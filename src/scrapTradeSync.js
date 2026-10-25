// Background sync of generated invoices to ScrapTrade.
// - Never blocks the PDF download.
// - If the Render server is asleep / offline, the invoice (data + PDF) waits in IndexedDB
//   and is retried automatically until it is saved. Safe to retry: the server de-duplicates by bill number.
import { useEffect, useState } from 'react';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';

const BASE = (import.meta.env.VITE_SCRAPTRADE_URL || '').replace(/\/+$/, '');
const KEY = import.meta.env.VITE_SCRAPTRADE_KEY || '';
const PREFIX = 'scraptrade-outbox:';
const RETRY_MS = 45000;
const TIMEOUT_MS = 90000; // Render cold start can take a minute

const num = v => parseFloat(String(v ?? '').replace(/,/g, '')) || 0;

// "25.10.2026" / "25-10-2026" / "25/10/2026" / "2026-10-25"  ->  "2026-10-25"
export function toISODate(s) {
  const str = String(s || '').trim();
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = str.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return new Date().toISOString().slice(0, 10);
}

// Indian financial year of an ISO date, e.g. 2026-10-25 -> "2026-2027"
const fyOf = iso => { const y = +iso.slice(0, 4), m = +iso.slice(5, 7); return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };

// Turns the invoice props into the payload ScrapTrade expects. Returns null if the invoice is incomplete.
export function buildInvoicePayload({ invoiceNo, date, vehicleNo, receiverName, receiverAddress, receiverGST, productDetailsArray, GST, RO, grandTotal }) {
  const items = (productDetailsArray || []).filter(p => p && p.productName);
  if (!invoiceNo || !receiverName || !items.length) return null;
  return {
    billNumber: String(invoiceNo).trim(),          // invoice number only, e.g. "12"
    billDate: toISODate(date),
    vehicleNo: vehicleNo || '',
    receiverName,
    receiverAddress: receiverAddress || '',
    receiverGST: receiverGST || '',
    items: items.map(p => ({ productName: p.productName, hsn: p.HSN, quantity: num(p.quantity), rate: num(p.Rate), amount: num(p.amount) })),
    gstPercent: 18,
    gstAmount: num(GST) * 2,                        // invoice shows CGST and SGST separately
    roundOff: num(RO),
    grandTotal: num(grandTotal),
  };
}

// ---- tiny status store (so the UI can show "Saving… / Saved / Pending") ----
let state = { status: 'idle', pending: 0, message: '' };
const listeners = new Set();
const update = patch => { state = { ...state, ...patch }; listeners.forEach(l => l(state)); };

async function send(item) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const fd = new FormData();
    fd.append('data', JSON.stringify(item.data));
    fd.append('pdf', item.pdf, `invoice-${item.data.billNumber.replace(/[^\w-]+/g, '_')}.pdf`);
    const res = await fetch(`${BASE}/api/integrations/invoice-sale`, { method: 'POST', headers: { 'x-api-key': KEY }, body: fd, signal: ctrl.signal });
    if (res.ok) return;
    const msg = (await res.json().catch(() => ({}))).message || `Server error ${res.status}`;
    const err = new Error(msg);
    if ([400, 401, 403, 413].includes(res.status)) err.fatal = true; // retrying won't help
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

let running = false;
export async function processOutbox() {
  if (running || !BASE || !KEY) return;
  running = true;
  try {
    const ks = (await idbKeys()).filter(k => String(k).startsWith(PREFIX));
    if (!ks.length) return;
    update({ status: 'saving', pending: ks.length, message: '' });
    let transient = 0, fatalMsg = '';
    for (const k of ks) {
      const item = await idbGet(k);
      if (!item) continue;
      if (item.fatal) { fatalMsg = item.fatal; continue; }
      try {
        await send(item);
        await idbDel(k);
      } catch (e) {
        if (e.fatal) { await idbSet(k, { ...item, fatal: e.message }); fatalMsg = e.message; }
        else transient++;
      }
    }
    if (transient) update({ status: 'pending', pending: transient, message: 'ScrapTrade is waking up — will retry automatically' });
    else if (fatalMsg) update({ status: 'failed', pending: 0, message: fatalMsg });
    else update({ status: 'saved', pending: 0, message: '' });
  } finally {
    running = false;
  }
}

// Call right after the PDF is generated. Does not wait for the network.
export function queueInvoiceSync(data, pdfBlob) {
  if (!BASE || !KEY) { console.warn('ScrapTrade sync skipped: VITE_SCRAPTRADE_URL / VITE_SCRAPTRADE_KEY not set'); return; }
  idbSet(`${PREFIX}${fyOf(data.billDate)}:${data.billNumber}`, { data, pdf: pdfBlob, queuedAt: Date.now() })
    .then(processOutbox)
    .catch(() => { // IndexedDB unavailable (private mode): try once directly
      update({ status: 'saving' });
      send({ data, pdf: pdfBlob }).then(() => update({ status: 'saved' })).catch(e => update({ status: 'failed', message: e.message }));
    });
}

let started = false;
function start() {
  if (started || !BASE) return;
  started = true;
  fetch(`${BASE}/api/health`, { mode: 'no-cors' }).catch(() => {}); // wake Render while the user fills the form
  processOutbox();                                                  // flush anything left from earlier sessions
  setInterval(processOutbox, RETRY_MS);
  window.addEventListener('online', processOutbox);
}

export function useScrapTradeSync() {
  const [s, setS] = useState(state);
  useEffect(() => { listeners.add(setS); start(); return () => listeners.delete(setS); }, []);
  return s;
}

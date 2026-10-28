import { useState, useEffect, useRef, useCallback } from 'react'
import { ToWords } from "to-words";
import './App.css'
import InvoiceComponent from './InvoiceComponent'
import Details from './Details'
import { todayDDMMYYYY, fyOfDate, fetchNextInvoiceNo } from './scrapTradeSync'

const DRAFT_KEY = 'invoice-draft-v1'

const loadDraft = () => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') } catch { return null }
}

function App() {
  // Draft saved by a previous session (tab closed, phone locked, refresh...)
  const [draft] = useState(loadDraft)

  const [invoiceNo, setInvoiceNo] = useState(draft?.invoiceNo ?? '')
  const [date, setDate] = useState(draft?.date || todayDDMMYYYY())   // defaults to today
  const [vehicleNo, setVehicleNo] = useState(draft?.vehicleNo ?? '')
  const [receiverName, setReceiverName] = useState(draft?.receiverName ?? '')
  const [receiverAddress, setReceiverAddress] = useState(draft?.receiverAddress ?? '')
  const [receiverGST, setReceiverGST] = useState(draft?.receiverGST ?? '')

  const [productDetailsArray, setProductDetailsArray] = useState(draft?.productDetailsArray ?? [])

  // Checkmark: must be ticked for the sale to be added to ScrapTrade when the PDF is generated
  const [saveToScrapTrade, setSaveToScrapTrade] = useState(true)

  const [totalQuantity, setTotalQuantity] = useState(0)
  const [amount, setAmount] = useState(0)
  const [GST, setGST] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [RO, setRO] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [amountInWords, setAmountInWords] = useState('')

  // Financial year comes from the invoice date (1 Apr - 31 Mar)
  const fy = fyOfDate(date)

  // ---- Auto invoice number (last number in ScrapTrade + 1) ----
  const invoiceNoManual = useRef(!!draft?.invoiceNoManual)   // true once the user typed a number themselves
  const [invoiceNoStatus, setInvoiceNoStatus] = useState('')  // '' | 'loading' | 'offline'

  const refreshInvoiceNo = useCallback((force = false, fyArg = fy) => {
    if (force) invoiceNoManual.current = false
    if (invoiceNoManual.current) return
    setInvoiceNoStatus('loading')
    fetchNextInvoiceNo(fyArg).then(({ next, offline }) => {
      if (invoiceNoManual.current) { setInvoiceNoStatus(''); return }   // user typed while we were fetching
      if (next) setInvoiceNo(next)
      setInvoiceNoStatus(offline ? 'offline' : '')
    })
  }, [fy])

  // Runs on load and whenever the financial year changes (e.g. date moved across 1 April)
  useEffect(() => { refreshInvoiceNo(false) }, [refreshInvoiceNo])

  const handleInvoiceNoChange = value => {
    invoiceNoManual.current = true
    setInvoiceNo(value)
  }

  // ---- Autosave draft ----
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const [restored, setRestored] = useState(!!draft)
  useEffect(() => {
    if (!restored) return
    const t = setTimeout(() => setRestored(false), 6000)
    return () => clearTimeout(t)
  }, [restored])

  const hasContent = !!(vehicleNo || receiverName || receiverAddress || receiverGST || productDetailsArray.length)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (!hasContent) { localStorage.removeItem(DRAFT_KEY); setDraftSavedAt(null); return }
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          invoiceNo, date, vehicleNo, receiverName, receiverAddress, receiverGST, productDetailsArray,
          invoiceNoManual: invoiceNoManual.current,
        }))
        setDraftSavedAt(new Date())
      } catch { /* storage full / unavailable: drafts are best effort */ }
    }, 500)
    return () => clearTimeout(t)
  }, [invoiceNo, date, vehicleNo, receiverName, receiverAddress, receiverGST, productDetailsArray, hasContent])

  const handleNewInvoice = () => {
    if (hasContent && !window.confirm('Clear this invoice and start a new one?')) return
    const today = todayDDMMYYYY()
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setVehicleNo('')
    setReceiverName('')
    setReceiverAddress('')
    setReceiverGST('')
    setProductDetailsArray([])
    setDate(today)
    setSaveToScrapTrade(true)
    setInvoiceNo('')
    setDraftSavedAt(null)
    setRestored(false)
    refreshInvoiceNo(true, fyOfDate(today))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (productDetailsArray.length === 0) {
      setTotalQuantity(0)
      setAmount(0)
      setGST(0)
      setSubTotal(0)
      setRO(0)
      setGrandTotal(0)
      setAmountInWords('')
      return
    }

    const totalAmt = productDetailsArray.reduce((sum, p) => sum + p.amount, 0)
    const totalQty = productDetailsArray.reduce((sum, p) => sum + Number(p.quantity), 0)
    const gst = Number((9 * totalAmt / 100).toFixed(1))
    const sub = Number((totalAmt + gst * 2).toFixed(1))
    const rounded = Math.round(sub)
    const ro = Number((rounded - sub).toFixed(2))

    setTotalQuantity(totalQty)
    setAmount(totalAmt)
    setGST(gst)
    setSubTotal(sub)
    setRO(ro)
    setGrandTotal(rounded)

    const toWords = new ToWords({
      localeCode: 'en-IN',
      converterOptions: { currency: true, ignoreDecimal: false },
    });
    setAmountInWords(toWords.convert(rounded, { currency: true }).toUpperCase())
  }, [productDetailsArray])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-1 pt-4 text-sm">
        <span className="text-gray-500">
          {restored && <span className="text-amber-600 font-medium">Draft restored · </span>}
          {draftSavedAt
            ? `Draft autosaved ${draftSavedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
            : 'Draft autosaves as you type'}
        </span>
        <button
          onClick={handleNewInvoice}
          className="border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition"
        >
          + New Invoice
        </button>
      </div>

      <Details
        invoiceNo={invoiceNo} setInvoiceNo={handleInvoiceNoChange}
        invoiceNoStatus={invoiceNoStatus} onAutoInvoiceNo={() => refreshInvoiceNo(true)}
        fy={fy}
        date={date} setDate={setDate}
        vehicleNo={vehicleNo} setVehicleNo={setVehicleNo}
        receiverName={receiverName} setReceiverName={setReceiverName}
        receiverAddress={receiverAddress} setReceiverAddress={setReceiverAddress}
        receiverGST={receiverGST} setReceiverGST={setReceiverGST}
        productDetailsArray={productDetailsArray}
        setProductDetailsArray={setProductDetailsArray}
      />
      <InvoiceComponent
        invoiceNo={invoiceNo}
        fy={fy}
        date={date}
        vehicleNo={vehicleNo}
        receiverName={receiverName}
        receiverAddress={receiverAddress}
        receiverGST={receiverGST}
        totalQuantity={totalQuantity}
        amount={amount}
        GST={GST}
        subTotal={subTotal}
        RO={RO}
        grandTotal={grandTotal}
        amountInWords={amountInWords}
        productDetailsArray={productDetailsArray}
        saveToScrapTrade={saveToScrapTrade}
        setSaveToScrapTrade={setSaveToScrapTrade}
      />
    </div>
  )
}

export default App
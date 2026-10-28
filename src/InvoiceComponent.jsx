import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { queueInvoiceSync, buildInvoicePayload, useScrapTradeSync } from "./scrapTradeSync";

// WhatsApp number that receives the invoice, digits only with country code, e.g. 919850109435
const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
// From this amount an e-way bill is needed (and the two PDFs are merged by hand), so no WhatsApp send
const WHATSAPP_LIMIT = 100000;

export function InvoiceComponent({ invoiceNo, fy, date, vehicleNo, receiverName, receiverAddress, receiverGST, totalQuantity, amount, GST, subTotal, RO, grandTotal, amountInWords, productDetailsArray, saveToScrapTrade, setSaveToScrapTrade }) {

  const TextStyle = {
    fontFamily: '"Times New Roman", Times, serif'
  };

  const invoiceRef = useRef();
  const sync = useScrapTradeSync();
  const [busy, setBusy] = useState(false);

  const canWhatsApp = grandTotal > 0 && grandTotal < WHATSAPP_LIMIT;
  const needsEwayBill = grandTotal >= WHATSAPP_LIMIT;

  // Blocks blank / half-filled invoices (they would also be rejected by ScrapTrade)
  const validate = () => {
    const missing = [];
    if (!invoiceNo) missing.push("Invoice No");
    if (!date) missing.push("Date");
    if (!receiverName) missing.push("Receiver");
    if (!productDetailsArray || productDetailsArray.length === 0) missing.push("at least one product");
    if (missing.length) { alert(`Please fill: ${missing.join(", ")}`); return false; }
    return true;
  };

  // Renders the invoice to an A4 PDF (does not download anything yet)
  const buildPdf = async () => {
    const invoice = document.getElementById("invoice");
    if (!invoice) throw new Error("Invoice element not found!");
    const canvas = await html2canvas(invoice, { scale: 1.2, useCORS: true, logging: false, windowWidth: 794 });
    const imgData = canvas.toDataURL("image/jpeg", 0.6);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 25, marginY = 30;
    const imgWidth = pageWidth - marginX * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", marginX, marginY, imgWidth, imgHeight);
    const newDate = date ? date.replaceAll(".", "-") : "nodate";
    return { pdf, fileName: `invoice-${invoiceNo}(${newDate})${receiverName}.pdf` };
  };

  // Adds the sale to ScrapTrade in the background, only if the checkmark is ticked (never blocks the user)
  const syncSale = (pdf) => {
    if (!saveToScrapTrade) return;
    try {
      const payload = buildInvoicePayload({ invoiceNo, date, vehicleNo, receiverName, receiverAddress, receiverGST, productDetailsArray, GST, RO, grandTotal });
      if (payload) queueInvoiceSync(payload, pdf.output("blob"));
    } catch (e) { console.error("Could not queue ScrapTrade sync", e); }
  };

  const downloadPDF = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    try {
      const { pdf, fileName } = await buildPdf();
      pdf.save(fileName);
      syncSale(pdf);
    } catch (e) {
      console.error(e);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendWhatsApp = async () => {
    if (busy || !validate()) return;
    if (!canWhatsApp) { alert("WhatsApp sending is only for invoices below ₹1,00,000."); return; }
    setBusy(true);
    try {
      const { pdf, fileName } = await buildPdf();
      const message = `Invoice ${invoiceNo}/${fy} | ${date}\n${receiverName}\nAmount: ₹${Number(grandTotal).toLocaleString("en-IN")}`;
      const file = new File([pdf.output("blob")], fileName, { type: "application/pdf" });

      // 1) Phone / supported browsers: open the share sheet with the PDF attached, pick WhatsApp
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: message });
          syncSale(pdf);
          return;
        } catch (e) {
          if (e && e.name === "AbortError") return;   // user closed the share sheet: nothing generated, nothing saved
          console.warn("Share failed, falling back to download + WhatsApp link", e);
        }
      }

      // 2) Fallback (desktop): download the PDF and open the WhatsApp chat with the fixed number; attach the PDF there
      pdf.save(fileName);
      syncSale(pdf);
      if (WHATSAPP_NUMBER) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      else alert("PDF downloaded. Set VITE_WHATSAPP_NUMBER to open the WhatsApp chat automatically.");
    } catch (e) {
      console.error(e);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const filledRows = productDetailsArray ? productDetailsArray.length : 0;
  const emptyRowCount = Math.max(2, 5 - filledRows);

  return (
    <div style={TextStyle}>
      <div className="flex flex-col items-center gap-3 p-5 pt-0">
        <label className="mt-6 flex items-start gap-2 text-sm sm:text-base text-gray-800 max-w-md cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!saveToScrapTrade}
            onChange={(e) => setSaveToScrapTrade(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            Add this sale to ScrapTrade when the PDF is generated
            <span className="text-gray-500"> (Invoice {invoiceNo || "—"}/{fy})</span>
          </span>
        </label>
        {!saveToScrapTrade && (
          <p className="text-xs sm:text-sm text-amber-600 -mt-1">Not ticked: this invoice will NOT be added to ScrapTrade sales.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={downloadPDF} disabled={busy} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60">
            {busy ? "Generating…" : "📄 Download PDF"}
          </button>
          {canWhatsApp && (
            <button onClick={sendWhatsApp} disabled={busy} className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60">
              💬 Send on WhatsApp
            </button>
          )}
        </div>
        {needsEwayBill && (
          <p className="text-xs sm:text-sm text-amber-700 text-center max-w-md">
            Amount is ₹{Number(grandTotal).toLocaleString("en-IN")} (₹1,00,000 or more): generate the e-way bill and merge both PDFs. WhatsApp sending is turned off for this invoice.
          </p>
        )}
      </div>
      {sync.status !== "idle" && (
        <p className="text-center text-sm -mt-3 pb-2" style={{ color: sync.status === "saved" ? "#16a34a" : sync.status === "failed" ? "#dc2626" : "#d97706" }}>
          {sync.status === "saving" && "Saving to ScrapTrade…"}
          {sync.status === "saved" && "✓ Saved to ScrapTrade sales"}
          {sync.status === "pending" && `⏳ ${sync.message} (${sync.pending} pending)`}
          {sync.status === "failed" && `✗ ScrapTrade rejected the invoice: ${sync.message}`}
        </p>
      )}

      <div className="h-0 w-0 overflow-hidden">
        <div ref={invoiceRef} id="invoice" className="bg-white mx-auto" style={{ width: "794px", minHeight: "1123px", boxSizing: "border-box", margin: "0 auto" }}>
          <div className="bg-white text-top border-2 border-black">
            <div className="border-b-2 border-black pb-2 text-center">
              <strong className="tracking-wider uppercase text-2xl">PRATIK TRADING</strong>
              <strong className="pb-2">
                <p className="mt-1">SNO.762, Surya Kiran Colony, Jyotiba Nagar, Pimpri</p>
                <p>Pune – 411017, MAHARASHTRA</p>
                <p>Mob.No.: 9850109435. Email: pratikvj9370@gmail.com</p>
                <p className="mt-1">OUR GST REG. NO.: 27BMAPJ2220A1ZY.</p>
              </strong>
            </div>
            <div className="border-b-2 border-black text-center pt-0 pb-2">
              <strong className="tracking-wider uppercase text-xl">TAX INVOICE</strong>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black">
                <strong className="flex"><div className="px-2 w-38">Reverse Charges</div><div className="px-2 flex-1">:</div><div className="px-2 flex-1">NO</div></strong>
                <strong className="flex"><div className="px-2 w-38">Invoice No.</div><div className="px-2 flex-1">:</div><div className="flex-1">{invoiceNo}/{fy}</div></strong>
                <strong className="flex"><div className="px-2 w-38">Invoice Date</div><div className="px-2 flex-1">:</div><div className="px-2 flex-1">{date}</div></strong>
                <strong className="flex"><div className="px-2 w-38">State</div><div className="px-2 flex-1">:</div><div className="px-2 flex-1">Maharashtra</div></strong>
                <strong className="flex pb-2"><div className="px-2 w-38">State code</div><div className="px-2 flex-1">:</div><div className="px-2 flex-1">27</div></strong>
              </div>
              <div className="leading-relaxed">
                <strong className="flex"><div className="px-2 w-50">Transportation Mode</div><div className="px-2 flex-1">: By Road</div></strong>
                <strong className="flex"><div className="px-2 w-50">Vehicle No.</div><div className="px-2 flex-1">: {vehicleNo}</div></strong>
                <strong className="flex"><div className="px-2 w-50">Date of Supply</div><div className="px-2 flex-1">: {date}</div></strong>
                <strong className="flex"><div className="px-2 w-50">Place of Supply</div><div className="px-2 flex-1">: </div></strong>
              </div>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black">
                <div className="border-b-2 pb-2 border-black text-center top bg-gray-300"><strong>Details of Receiver / Billed to:</strong></div>
                <strong className="flex"><div className="px-2 w-20">Name:</div><div className="px-2 flex-1 pb-2">{receiverName}</div></strong>
                <strong className="flex"><div className="px-2 w-20">Address:</div><div className="px-2 flex-1"><div className="text-wrap pb-1 text-sm">{receiverAddress}</div></div></strong>
                <strong className="flex"><div className="px-2 w-20">GSTIN:</div><div className="px-2 flex-1">{receiverGST}</div></strong>
                <strong className="flex pb-2"><div className="px-2 w-20">State:</div><div className="px-2 flex-1">Maharashtra</div><div className="px-2">State Code: 27</div></strong>
              </div>
              <div>
                <div className="border-b-2 pb-2 text-center bg-gray-300"><strong>Details of Consignee / Shipped to:</strong></div>
                <strong className="flex"><div className="px-2 w-20">Name:</div><div className="px-2 pb-2 flex-1 flex-wrap">{receiverName}</div></strong>
                <strong className="flex"><div className="px-2 w-20">Address:</div><div className="px-2 flex-1"><div className="text-wrap pb-1 text-sm">{receiverAddress}</div></div></strong>
                <strong className="flex"><div className="px-2 w-20">GSTIN:</div><div className="px-2 flex-1">{receiverGST}</div></strong>
                <strong className="flex"><div className="px-2 w-20">State:</div><div className="px-2 flex-1">Maharashtra</div><div className="px-2">State Code: 27</div></strong>
              </div>
            </div>
            <div className="border-b-2 border-black">
              <table className="border-collapse w-full table-fixed">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[40px]">Sr.No.</th>
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[125px]">Particulars</th>
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[60px]">HSN/SAC</th>
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[72px]">Unit</th>
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[83px]">Qty</th>
                    <th className="border-r-2 border-black text-center align-middle pb-2 w-[100px]">Rate (INR)</th>
                    <th className="border-black text-center align-middle pb-2 w-[115px]">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetailsArray && productDetailsArray.map((p, index) => (
                    <tr key={p.id}>
                      <td className="border-r-2 border-black px-2 py-1 align-top text-center">{index + 1}</td>
                      <td className="border-r-2 border-black text-center align-middle p-1">{p.productName}</td>
                      <td className="border-r-2 border-black px-2 py-1 align-top text-center">{p.HSN}</td>
                      <td className="border-r-2 border-black px-2 py-1 align-top text-center">Kg</td>
                      <td className="border-r-2 border-black px-2 py-1 align-top text-right">{p.quantity}</td>
                      <td className="border-r-2 border-black px-2 py-1 align-top text-right">{p.Rate}</td>
                      <td className="px-2 py-1 border-black align-top text-right">{p.amount}</td>
                    </tr>
                  ))}
                  {Array.from({ length: emptyRowCount }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-8">
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-black"></td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-black">
                    <td className="border-r-2 pb-2 border-black px-2" colSpan={2}></td>
                    <td className="border-r-2 pb-2 border-black px-2"></td>
                    <td className="border-r-2 px-2 pb-2 text-center">SUBTOTAL</td>
                    <td className="border-r-2 px-2 pb-2 border-black text-right">{totalQuantity}</td>
                    <td className="border-r-2 px-2 pb-2 border-black"></td>
                    <td className="px-2 pb-2 border-black text-right w-32.5">{amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black">
                <div className="flex border-b-2 h-8.5 border-black"><div className="px-2 py-1 w-32"></div><div className="px-2 py-1 flex-1"></div></div>
                <div className="flex border-black"><div className="px-2 py-1 w-32">Due Date:</div><div className="px-2 py-1 flex-1"></div></div>
                <strong className="flex border-t">
                  <div className="px-1 py-1 w-50">Amount(In Words):</div>
                  <div className="px-1 pt-2 text-sm"><div>{amountInWords}</div></div>
                </strong>
              </div>
              <div>
                <div className="flex border-b-2 border-black"><div className="px-2 pb-2 flex-1 justify-end">Add.:CGST</div><div className="px-2 pb-2 w-20 text-right">9.00%</div><div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{GST}</div></div>
                <div className="flex border-b-2 border-black"><div className="px-2 pb-2 flex-1">Add.:SGST</div><div className="px-2 pb-2 w-20 text-right">9.00%</div><div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{GST}</div></div>
                <div className="flex border-b-2 border-black"><div className="px-2 pb-2 flex-1">SUB.TOTAL</div><div className="px-2 pb-2 w-20"></div><div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{subTotal}</div></div>
                <div className="flex border-b-2 border-black"><div className="px-2 pb-2 flex-1">R.O</div><div className="px-2 pb-2 w-20"></div><div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{RO}</div></div>
                <div className="flex"><div className="px-2 pb-2 flex-1">GRAND TOTAL</div><div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right font-bold">{grandTotal}</div></div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black p-2 h-32"><div>Receiver Signature & Stamp</div></div>
              <div className="p-2">
                <div className="flex justify-between"><div>E. & O. E.</div><div>For PRATIK TRADING</div><div></div></div>
                <div className="mt-16 text-right">Authorised Signatory</div>
              </div>
            </div>
            <div className="p-2">Subject to PUNE Jurisdiction only.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InvoiceComponent;
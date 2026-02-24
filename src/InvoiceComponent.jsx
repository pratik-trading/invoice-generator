import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function InvoiceComponent({ invoiceNo, date, vehicleNo, receiverName, receiverAddress, receiverGST, quantity, Rate, amount, GST, subTotal, RO, grandTotal, amountInWords }) {

  const TextStyle = {
    fontFamily: '"Times New Roman", Times, serif'
  };


  const invoiceRef = useRef();

  const downloadPDF = () => {
  const invoice = document.getElementById("invoice");
  if (!invoice) {
    alert("Invoice element not found!");
    return;
  }

  html2canvas(invoice, {
    scale: 1.2,
    useCORS: true,
    logging: false,
    windowWidth: 794,
  }).then((canvas) => {

    const imgData = canvas.toDataURL("image/jpeg", 0.6);
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 25;
    const marginY = 30;

    const imgWidth = pageWidth - marginX * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", marginX, marginY, imgWidth, imgHeight);

    const newDate = date.replaceAll(".", "-");
    pdf.save(`invoice-${invoiceNo}(${newDate})${receiverName}.pdf`);
  });
};

  <style>
    {`
  #invoice * {
    box-sizing: border-box !important;
  }
  table {
    border-collapse: collapse !important;
    table-layout: fixed !important;
  }
  td, th {
    padding: 2px 4px !important;
    vertical-align: middle !important;
    line-height: 1.2 !important;
  }
  @media print {
    #invoice {
      width: 794px !important;
      height: auto !important;
    }
  }
`}
  </style>



  return (
    <div style={TextStyle}>
      <div className="flex justify-center p-5 pt-0">
        <button
          onClick={downloadPDF}
          className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg 
             font-medium shadow-md hover:bg-blue-700 hover:shadow-lg 
             transition-all duration-200 active:scale-95"
        >
          📄 Download PDF
        </button>
      </div>
      
      <div className="h-0 w-0 overflow-hidden">
        <div ref={invoiceRef} id="invoice"
          className="bg-white mx-auto"
          style={{
            width: "794px",   // A4 exact width in pixels
            minHeight: "1123px",
            boxSizing: "border-box",
            margin: "0 auto",
          }}
        >
          <div className="bg-white text-top border-2 border-black">
            {/* Header */}
            <div className="border-b-2 border-black pb-2 text-center">
              <strong className="tracking-wider uppercase text-2xl">PRATIK TRADING</strong>
              <strong className="pb-2">
                <p className="mt-1">SNO.762, Surya Kiran Colony, Jyotiba Nagar, Pimpri</p>
                <p>Pune – 411017, MAHARASHTRA</p>
                <p>Mob.No.: 9850109435. Email: pratikv19370@gmail.com</p>
                <p className="mt-1">OUR GST REG. NO.: 27BMAPJ2220A1ZY.</p>
              </strong>
            </div>

            {/* Tax Invoice Title */}
            <div className="border-b-2 border-black text-center pt-0 pb-2">
              <strong className="tracking-wider uppercase text-xl">TAX INOVICE</strong>
            </div>

            {/* Invoice Details Grid */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              {/* Left Column */}
              <div className="border-r-2 border-black">
                <strong className="flex">
                  <div className="px-2  w-38">Reverse Charges</div>
                  <div className="px-2  flex-1">:</div>
                  <div className="px-2  flex-1">NO</div>
                </strong>
                <strong className="flex">
                  <div className="px-2  w-38">Invoice No.</div>
                  <div className="px-2  flex-1">:</div>
                  <div className=" flex-1">{invoiceNo}/2025-2026</div>
                </strong>
                <strong className="flex">
                  <div className="px-2  w-38">Invoice Date</div>
                  <div className="px-2  flex-1">:</div>
                  <div className="px-2  flex-1">{date}</div>
                </strong>
                <strong className="flex">
                  <div className="px-2  w-38">State</div>
                  <div className="px-2   flex-1">:</div>
                  <div className="px-2  flex-1">Maharashtra</div>
                </strong>
                <strong className="flex  pb-2">
                  <div className="px-2  w-38">State code</div>
                  <div className="px-2   flex-1">:</div>
                  <div className="px-2  flex-1">27</div>
                </strong>          </div>

              {/* Right Column */}
              <div className="leading-relaxed">
                <strong className="flex">
                  <div className="px-2  w-50">Transportation Mode</div>
                  <div className="px-2  flex-1">: By Road</div>
                </strong>
                <strong className="flex">
                  <div className="px-2  w-50">Vehicle No.</div>
                  <div className="px-2  flex-1">: {vehicleNo}</div>
                </strong>
                <strong className="flex ">
                  <div className="px-2  w-50">Date of Supply</div>
                  <div className="px-2  flex-1">: {date}</div>
                </strong>
                <strong className="flex">
                  <div className="px-2  w-50">Place of Supply</div>
                  <div className="px-2  flex-1">: </div>
                </strong>
              </div>
            </div>

            {/* Receiver and Consignee Details */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              {/* Receiver Details */}
              <div className="border-r-2 border-black">
                <div className="border-b-2 pb-2 border-black text-center top bg-gray-300">
                  <strong>Details of Receiver / Billed to:</strong>
                </div>
                <strong className="flex">
                  <div className="px-2  w-20">Name:</div>
                  <div className="px-2 flex-1 pb-2">{receiverName}</div>
                </strong>
                <strong className="flex ">
                  <div className="px-2 w-20">Address:</div>
                  <div className="px-2  flex-1">
                    <div className="text-wrap pb-1 text-sm">{receiverAddress}</div>
                  </div>
                </strong>
                <strong className="flex">
                  <div className="px-2 w-20">GSTIN:</div>
                  <div className="px-2 flex-1">{receiverGST}</div>
                </strong>
                <strong className="flex pb-2">
                  <div className="px-2 w-20">State:</div>
                  <div className="px-2 flex-1">Maharashtra</div>
                  <div className="px-2">State Code: 27</div>
                </strong>
              </div>

              {/* Consignee Details */}
              <div>
                <div className="border-b-2 pb-2 text-center bg-gray-300">
                  <strong>Details of Consignee / Shipped to:</strong>
                </div>
                <strong className="flex ">
                  <div className="px-2 w-20">Name:</div>
                  <div className="px-2 pb-2 flex-1 flex-wrap">{receiverName}</div>
                </strong>
                <strong className="flex ">
                  <div className="px-2 w-20">Address:</div>
                  <div className="px-2 flex-1">
                    <div className="text-wrap pb-1 text-sm">{receiverAddress}</div>
                  </div>
                </strong>
                <strong className="flex ">
                  <div className="px-2 w-20">GSTIN:</div>
                  <div className="px-2 flex-1">{receiverGST}</div>
                </strong>
                <strong className="flex">
                  <div className="px-2 w-20">State:</div>
                  <div className="px-2 flex-1">Maharashtra</div>
                  <div className="px-2">State Code: 27</div>
                </strong>
              </div>
            </div>

            {/* Items Table */}
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
                  <tr>
                    <td className="border-r-2 border-black px-2 py-1 align-top text-center">1</td>
                    <td className="border-r-2 border-black text-center align-middle p-1">MS SCRAP</td>
                    <td className="border-r-2  border-black px-2 py-1 align-top text-center">7204</td>
                    <td className="border-r-2  border-black px-2 py-1 align-top text-center">Kg</td>
                    <td className="border-r-2  border-black px-2 py-1 align-top text-right">{quantity}</td>
                    <td className="border-r-2  border-black px-2 py-1 align-top text-right">{Rate}</td>
                    <td className="px-2 py-1  border-black align-top text-right">{amount}</td>
                  </tr>
                  <tr className="h-50">
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2  border-black"></td>
                    <td className="border-r-2  border-black"></td>
                    <td className="border-r-2  border-black"></td>
                    <td className="border-r-2  border-black"></td>
                    <td className="border-r-2  border-black"></td>
                    <td className=" border-black"></td>
                  </tr>
                  <tr className="border-t-2 border-black">
                    <td className="border-r-2 pb-2 border-black px-2 " colSpan={2}></td>
                    <td className="border-r-2 pb-2 border-black px-2 "></td>
                    <td className="border-r-2 px-2  pb-2 text-center">SUBTOTAL</td>
                    <td className="border-r-2 px-2 pb-2 border-black px-2  text-right">{quantity}</td>
                    <td className="border-r-2 px-2 pb-2 border-black px-2 "></td>
                    <td className="px-2 pb-2 border-black  text-right w-32.5">{amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              {/* Left Side - Amount in Words */}
              <div className="border-r-2 border-black">
                <div className="flex border-b-2 h-8.5 border-black">
                  <div className="px-2 py-1 w-32"></div>
                  <div className="px-2 py-1 flex-1"></div>
                </div>
                <div className="flex border-black">
                  <div className="px-2 py-1 w-32">Due Date:</div>
                  <div className="px-2 py-1 flex-1"></div>
                </div>
                <strong className="flex border-t">
                  <div className="px-1 py-1 w-50">Amount(In Words):</div>
                  <div className="px-1 pt-2 text-sm">
                    <div>{amountInWords}</div>
                  </div>
                </strong>
              </div>

              {/* Right Side - Tax Details */}
              <div>
                <div className="flex border-b-2 border-black">
                  <div className="px-2 pb-2 flex-1 justify-end">Add.:CGST</div>
                  <div className="px-2 pb-2  w-20 text-right">9.00%</div>
                  <div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{GST}</div>
                </div>
                <div className="flex border-b-2 border-black">
                  <div className="px-2 pb-2 flex-1">Add.:SGST</div>
                  <div className="px-2 pb-2  w-20 text-right">9.00%</div>
                  <div className="px-2 pb-2 border-l-2 border-black border-l border-black w-38.5 text-right">{GST}</div>
                </div>
                <div className="flex border-b-2 border-black">
                  <div className="px-2 pb-2 flex-1">SUB.TOTAL</div>
                  <div className="px-2 pb-2  w-20"></div>
                  <div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{subTotal}</div>
                </div>
                <div className="flex border-b-2 border-black">
                  <div className="px-2 pb-2 flex-1">R.O</div>
                  <div className="px-2 pb-2  w-20"></div>
                  <div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right">{RO}</div>
                </div>
                <div className="flex">
                  <div className="px-2 pb-2 flex-1">GRAND TOTAL</div>
                  <div className="px-2 pb-2 border-l-2 border-black w-38.5 text-right font-bold">{grandTotal}</div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black p-2 h-32">
                <div>Receiver Signature & Stamp</div>
              </div>
              <div className="p-2">
                <div className="flex justify-between">
                  <div>E. & O. E.</div>
                  <div>For PRATIK TRADING</div>
                  <div></div>
                </div>
                <div className="mt-16 text-right">Authorised Signatory</div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2">
              Subject to PUNE Jurisdiction only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InvoiceComponent;

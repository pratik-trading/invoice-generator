import { useState, useEffect } from 'react'
import { ToWords } from "to-words";
import './App.css'
import InvoiceComponent from './InvoiceComponent'
import Details from './Details'

function App() {
  const [invoiceNo, setInvoiceNo] = useState(null)
  const [date, setDate] = useState(null)
  const [vehicleNo, setVehicleNo] = useState(null)
  const [first, setfirst] = useState(null)
  const [receiverName, setReceiverName] = useState(null)
  const [receiverAddress, setReceiverAddress] = useState(null)
  const [receiverGST, setReceiverGST] = useState(null)

  const [productDetailsArray, setProductDetailsArray] = useState([])

  const [totalQuantity, setTotalQuantity] = useState(0)
  const [amount, setAmount] = useState(0)
  const [GST, setGST] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [RO, setRO] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [amountInWords, setAmountInWords] = useState('')

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
      <Details
        invoiceNo={invoiceNo} setInvoiceNo={setInvoiceNo}
        date={date} setDate={setDate}
        vehicleNo={vehicleNo} setVehicleNo={setVehicleNo}
        first={first} setfirst={setfirst}
        receiverName={receiverName} setReceiverName={setReceiverName}
        receiverAddress={receiverAddress} setReceiverAddress={setReceiverAddress}
        receiverGST={receiverGST} setReceiverGST={setReceiverGST}
        productDetailsArray={productDetailsArray}
        setProductDetailsArray={setProductDetailsArray}
      />
      <InvoiceComponent
        invoiceNo={invoiceNo}
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
      />
    </div>
  )
}

export default App
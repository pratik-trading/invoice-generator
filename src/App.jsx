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
  const [quantity, setQuantity] = useState(null)
  const [Rate, setRate] = useState(null)
  const [amount, setAmount] = useState(null)
  const [GST, setGST] = useState(null)
  const [subTotal, setSubTotal] = useState(null)
  const [RO, setRO] = useState(null)
  const [grandTotal, setGrandTotal] = useState(0)
  const [amountInWords, setAmountInWords] = useState(0)

  useEffect(() => {
    setAmount(quantity * Rate)
  }, [quantity, Rate])

  useEffect(() => {
    setGST(Number(9 * amount / 100).toFixed(1))
  }, [amount])

  useEffect(() => {
    setSubTotal(Number((amount + (GST * 2)).toFixed(1)))
  }, [GST])

  useEffect(() => {
    const rounded = Math.round(subTotal);
    const ro = Number((rounded - subTotal).toFixed(2));
    setRO(ro);
  }, [subTotal, GST, grandTotal]);


  useEffect(() => {
    setGrandTotal(Math.round(subTotal))
  }, [subTotal])

  useEffect(() => {
    const toWords = new ToWords({
      localeCode: 'en-IN', // Indian style
      converterOptions: { currency: true, ignoreDecimal: false },
    });
    const words = toWords.convert(grandTotal, { currency: true });
    setAmountInWords(words.toUpperCase())
  }, [grandTotal])  

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
        quantity={quantity} setQuantity={setQuantity}
        Rate={Rate} setRate={setRate}
      />
      <InvoiceComponent invoiceNo={invoiceNo}
        date={date}
        vehicleNo={vehicleNo}
        receiverName={receiverName}
        receiverAddress={receiverAddress}
        receiverGST={receiverGST}
        quantity={quantity}
        Rate={Rate}
        amount={amount}
        GST={GST}
        subTotal={subTotal}
        RO={RO}
        grandTotal={grandTotal}
        amountInWords={amountInWords}
      />
    </div>
  )
}

export default App

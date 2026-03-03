import React, { useState } from "react";

const Details = ({
  invoiceNo, setInvoiceNo,
  date, setDate,
  vehicleNo, setVehicleNo,
  first, setfirst,
  receiverName, setReceiverName,
  receiverAddress, setReceiverAddress,
  receiverGST, setReceiverGST,
  productDetailsArray, setProductDetailsArray,
}) => {

  const [productName, setProductName] = useState('M. S. Scrap')
  const [HSN, setHSN] = useState(7204)
  const [quantity, setQuantity] = useState('')
  const [Rate, setRate] = useState('')

  const frequentReceivers = [
    {
      name: "SAI METALS",
      address: "Gat No. 183, GANESH NAGAR, TALAWADE, PUNE 411062",
      gst: "27ADLPC5170H1ZL"
    },
    {
      name: "Cargos safe",
      address: "CHAKAN MIDC PHASE-2, PUNE 410501 MAHARASHTRA ",
      gst: "27AAOFC4513C1ZQ"
    },
    {
      name: "SWANANDESHA ALLOY CASTINGS PRIVATE LIMITED",
      address: "GAT NO 1582 SHED NO 01, TO 10, PATIL NAGAR, CHIKHALI, PUNE 412114 MAHARASHTRA",
      gst: "27ABJCS9186J1ZH"
    },
    {
      name: "Durgesh Foundry",
      address: "Shop No.1 Gate No. 155/b NR National Wajan Kata, Jyotiba Mandir Road, Talawade, Pune",
      gst: "27AMFPP5407P1ZI"
    },
    {
      name: "ARUN TRADERS",
      address: " GAT NO. 173, DEHU MOSHI ROAD, PUNE 411062",
      gst: "27DJEPS6320D1ZA"
    },
    {
      name: "OM SAI RAM METAL",
      address: "At post Bhare, Taluka Mulshi, Pune",
      gst: "27BQRPB0989F1ZJ"
    },
    {
      name: "MATADI STEEL",
      address: "Gat No. 689, shop no. 3, Chikhali-Jadhavwasti road, near Shivsai vajan kata, Chikhali, Pune 411062",
      gst: "27ARBPC2184R1ZH"
    },
    {
      name: "ABMIKA STEEL CORPORATION",
      address: "J 394/1, MIDC BHOSARI, PUNE 411026",
      gst: "27ADYPC6908Q1ZL"
    },
    {
      name: "SWARAJ STEEL BECYCLE INDUSTRIES",
      address: "S-29 S BLOCK BHOSARI MIDC, Pune-411026",
      gst: "27BERPR2883G1ZT"
    },
    {
      name: "Poona steel corporation",
      address: "T General block BG 106/1, Midc Bhosari, Pune 411026",
      gst: "27AAKPC1794P1Z5"
    }
  ];

  const handleAddProduct = () => {
    if (!productName || !HSN || !quantity || !Rate) {
      alert("Please fill in all product fields (Product Name, HSN, Quantity, Rate).");
      return;
    }
    const amt = Number(quantity) * Number(Rate);
    const newProduct = {
      id: Date.now(),
      productName,
      HSN,
      quantity,
      Rate,
      amount: amt,
    };
    setProductDetailsArray(prev => [...prev, newProduct]);
    // Reset product fields for next entry
    setProductName('M. S. Scrap');
    setHSN(7204);
    setQuantity('');
    setRate('');
  };

  const handleRemoveProduct = (id) => {
    setProductDetailsArray(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="mx-auto bg-white shadow-lg rounded-2xl p-5 sm:p-6 mt-6 border border-gray-200 transition-all duration-300">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5 border-b pb-2 text-center sm:text-left">
        Invoice Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Invoice Number */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Invoice No</label>
          <input
            type="text"
            value={invoiceNo || ""}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="Enter invoice number" required
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Date</label>
          <input
            type="date" required
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              const formattedDate = `${day}.${month}.${year}`;
              setDate(formattedDate);
            }}
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {date && (
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Selected: <span className="font-medium">{date}</span>
            </p>
          )}
        </div>

        {/* Vehicle Number */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Vehicle No</label>
          <input
            type="text" required
            value={vehicleNo || ""}
            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
            placeholder="Enter vehicle number"
            className="uppercase w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Frequent Receiver Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Select Frequent Receiver</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const selected = frequentReceivers.find(r => r.name === e.target.value);
              if (selected) {
                setReceiverName(selected.name);
                setReceiverAddress(selected.address);
                setReceiverGST(selected.gst);
              }
            }}
          >
            <option value="">-- Select Receiver --</option>
            {frequentReceivers.map((r, index) => (
              <option key={index} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Receiver Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Receiver Name</label>
          <input
            type="text" required
            value={receiverName || ""}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="Enter receiver name"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receiver Address */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Receiver Address</label>
          <textarea
            value={receiverAddress || ""} required
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="Enter address"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receiver GST */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Receiver GST</label>
          <input
            type="text" required
            value={receiverGST || ""}
            onChange={(e) => setReceiverGST(e.target.value)}
            placeholder="Enter GST number"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product Entry Section */}
      <div className="mt-6 border-t pt-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter Product Name"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">HSN</label>
            <input
              type="number"
              value={HSN}
              onChange={(e) => setHSN(e.target.value)}
              placeholder="Enter HSN"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Rate</label>
            <input
              type="number"
              value={Rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter rate"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddProduct}
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-green-700 transition-all duration-200 active:scale-95"
        >
          + Add Product
        </button>

        {/* Added Products List */}
        {productDetailsArray.length > 0 && (
          <div className="mt-5">
            <h4 className="text-gray-700 font-semibold mb-2">Added Products:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded-lg text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Product</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">HSN</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetailsArray.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{p.productName}</td>
                      <td className="border border-gray-300 px-3 py-2">{p.HSN}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{p.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{p.Rate}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{p.amount}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          onClick={() => handleRemoveProduct(p.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
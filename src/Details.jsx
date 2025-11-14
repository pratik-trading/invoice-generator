import React from "react";

const Details = ({
  invoiceNo, setInvoiceNo,
  date, setDate,
  vehicleNo, setVehicleNo,
  first, setfirst,
  receiverName, setReceiverName,
  receiverAddress, setReceiverAddress,
  receiverGST, setReceiverGST,
  quantity, setQuantity,
  Rate, setRate
}) => {

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

        {/* Quantity */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Quantity</label>
          <input
            type="number" required
            value={quantity || ""}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Rate */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Rate</label>
          <input
            type="number" required
            value={Rate || ""}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Enter rate"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Frequent Receiver Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Select Frequent Receiver</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const selected = frequentReceivers.find(
                r => r.name === e.target.value
              );
              if (selected) {
                setReceiverName(selected.name);
                setReceiverAddress(selected.address);
                setReceiverGST(selected.gst);
              }
            }}
          >
            <option value="">-- Select Receiver --</option>
            {frequentReceivers.map((r, index) => (
              <option key={index} value={r.name}>
                {r.name}
              </option>
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
    </div>
  );
};

export default Details;

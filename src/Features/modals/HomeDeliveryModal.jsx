import React, { useState } from "react";

const HomeDeliveryModal = ({ setShowHomeDeliveryModal, navigate, dispatch }) => {
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerDetails, setNewCustomerDetails] = useState({ name: "", phone: "" });

  const deliveryPartners = [
    { id: 1, name: "Partner A" },
    { id: 2, name: "Partner B" },
    { id: 3, name: "Partner C" },
  ]; // Replace with your API data

  const handleProceed = () => {
    if (!selectedDeliveryPartner || !selectedCustomer) {
      alert("Please select a delivery partner and a customer");
      return;
    }

    dispatch({ type: "CREATE_CART", payload: { selectedDeliveryPartner, selectedCustomer } });
    setShowHomeDeliveryModal(false);
    navigate("/table?type=new-order");
  };

  const handleSearchCustomer = (e) => {
    e.preventDefault();
    // Replace this with API call to search customer
    setSelectedCustomer({ name: "John Doe", phone: "1234567890" });
  };

  const handleAddNewCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerDetails.name || !newCustomerDetails.phone) {
      alert("Please provide valid customer details.");
      return;
    }
    // Add customer to the system (API call or local update)
    setSelectedCustomer({ ...newCustomerDetails });
    setNewCustomerDetails({ name: "", phone: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl mx-auto my-6 shadow-lg">
        <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b">
            <h3 className="text-3xl font-semibold">Home Delivery Order</h3>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => setShowHomeDeliveryModal(false)}
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Delivery Partners */}
            <div>
              <h4 className="mb-2 font-semibold">Select Delivery Partner</h4>
              <div className="grid grid-cols-3 gap-4">
                {deliveryPartners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedDeliveryPartner(partner)}
                    className={`p-4 rounded-lg text-center ${
                      selectedDeliveryPartner?.id === partner.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {partner.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Search */}
            <div>
              <h4 className="mb-2 font-semibold">Search Existing Customer</h4>
              <form onSubmit={handleSearchCustomer} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter customer phone number"
                  className="p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Add New Customer */}
            <div>
              <h4 className="mb-2 font-semibold">Add New Customer</h4>
              <form onSubmit={handleAddNewCustomer} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={newCustomerDetails.name}
                  onChange={(e) =>
                    setNewCustomerDetails((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Enter customer phone"
                  value={newCustomerDetails.phone}
                  onChange={(e) =>
                    setNewCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="col-span-2 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Add Customer
                </button>
              </form>
            </div>

            {/* Selected Customer */}
            {selectedCustomer && (
              <div className="p-4 border rounded-lg bg-gray-100">
                <h4 className="font-semibold">Selected Customer</h4>
                <p>Name: {selectedCustomer.name}</p>
                <p>Phone: {selectedCustomer.phone}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t">
            <button
              onClick={() => setShowHomeDeliveryModal(false)}
              className="px-6 py-2 mr-4 text-gray-600"
            >
              Close
            </button>
            <button
              onClick={handleProceed}
              className={`px-6 py-2 text-white rounded ${
                selectedDeliveryPartner && selectedCustomer
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedDeliveryPartner || !selectedCustomer}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDeliveryModal;

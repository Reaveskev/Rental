import React, { useState } from "react";
import { Transition } from "@headlessui/react";

const Property_Modal = ({ isOpen, onClose, onSave, property, onDelete }) => {
  const [formData, setFormData] = useState({
    name: property?.name || "",
    address: property?.address || "",
    price: property?.price || "",
  });

  const handleClose = (e) => {
    // Prevent modal from closing when clicking inside the modal
    e.stopPropagation();
  };

  const handleBackdropClick = () => {
    onClose(); // Close modal when clicking outside
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
        onClick={handleBackdropClick} // Trigger close when clicking outside modal
      >
        <div
          className="bg-white p-6 rounded-lg shadow-xl w-96"
          onClick={handleClose} // Prevent close when clicking inside the modal
        >
          <h2 className="text-2xl mb-4">
            {property ? "Edit Property" : "Add Property"}
          </h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                placeholder="Property Name"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                placeholder="Property Address"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                type="text"
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                placeholder="Property Price"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  onDelete(property.id); // Call onDelete with the property ID
                  onClose(); // Close modal
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave(formData); // Call onSave with the updated data
                  onClose(); // Close modal
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
};

export default Property_Modal;

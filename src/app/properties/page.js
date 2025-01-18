"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Property_Modal from "../propertyModal";
import { useUser } from "../userContext";

const Properties = () => {
  const { user } = useUser(); // Fetch user info from global state
  const [userRole, setUserRole] = useState("");
  const [properties, setProperties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Set user role from global state or sessionStorage
      setUserRole(user.role || sessionStorage.getItem("userRole"));
    }

    // Fetch properties from the database based on User_id
    const fetchProperties = async () => {
      try {
        const landlordId = user?.id || sessionStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:3000/landlord_properties/${landlordId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                user?.token || sessionStorage.getItem("token")
              }`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        console.log(data);

        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user]);

  const openModal = (property) => {
    setCurrentProperty(property);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentProperty(null);
  };

  const saveProperty = async (updatedProperty) => {
    try {
      const response = await fetch(`/api/properties/${currentProperty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            user?.token || sessionStorage.getItem("token")
          }`,
        },
        body: JSON.stringify(updatedProperty),
      });
      if (!response.ok) throw new Error("Failed to update property");
      const updated = await response.json();
      setProperties((prev) =>
        prev.map((property) =>
          property.id === updated.id ? { ...property, ...updated } : property
        )
      );
    } catch (error) {
      console.error("Error saving property:", error);
    }
    closeModal();
  };

  const deleteProperty = async (propertyId) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${
            user?.token || sessionStorage.getItem("token")
          }`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete property");
      setProperties((prev) =>
        prev.filter((property) => property.id !== propertyId)
      );
    } catch (error) {
      console.error("Error deleting property:", error);
    }
    closeModal();
  };

  // Handle adding new property
  const addProperty = async (newProperty) => {
    try {
      const response = await fetch(`/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            user?.token || sessionStorage.getItem("token")
          }`,
        },
        body: JSON.stringify(newProperty),
      });
      if (!response.ok) throw new Error("Failed to add property");
      const added = await response.json();
      setProperties((prev) => [...prev, added]);
    } catch (error) {
      console.error("Error adding property:", error);
    }
  };

  if (loading) return <p>Loading properties...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
        <p className="text-gray-600 mt-1">
          {userRole === "tenant"
            ? "View the properties available for rent."
            : "Manage your listed properties here."}
        </p>
      </div>

      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <Link href="/">
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Properties List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {userRole === "tenant" ? "Available Properties" : "Your Properties"}
        </h2>
        {properties.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Status</th>
                {userRole === "landlord" && (
                  <th className="text-left p-2">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr
                  key={property.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                >
                  <td className="p-2">{property.property_type}</td>{" "}
                  {/* Updated title */}
                  <td className="p-2">{property.address}</td>{" "}
                  {/* Updated location */}
                  <td className="p-2">
                    {property.status ? property.status : "N/A"}
                  </td>{" "}
                  {/* Handle missing status */}
                  {userRole === "landlord" && (
                    <td className="p-2">
                      <button
                        onClick={() => openModal(property)}
                        className="bg-yellow-500 text-white font-medium px-4 py-2 rounded hover:bg-yellow-600 mr-2 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="bg-red-600 text-white font-medium px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No properties listed.</p>
        )}
      </div>

      {/* Property_Modal for Edit/Delete */}
      {userRole === "landlord" && (
        <Property_Modal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={saveProperty}
          property={currentProperty}
          onDelete={deleteProperty}
        />
      )}
    </div>
  );
};

export default Properties;

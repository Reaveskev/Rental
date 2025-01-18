"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../userContext";

const Disputes = () => {
  const { user } = useUser();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");

  //localhost:3000

  // Fetch disputes from the backend when the component mounts
  useEffect(() => {
    async function fetchDisputes() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/disputes?user_id=${user.id}&role=${user.role}`,
          {
            headers: { Authorization: `Bearer ${user.token}` }, // Assuming token-based auth
          }
        );
        if (!response.ok) throw new Error("Failed to fetch disputes");
        const data = await response.json();

        setDisputes(data);

        const landlordId = user?.id || sessionStorage.getItem("userId");
        const prop_response = await fetch(
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
        if (!prop_response.ok) throw new Error("Failed to fetch properties");
        const prop_data = await prop_response.json();

        setProperties(prop_data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDisputes();
    }
  }, [user]);

  // Handle dispute resolution
  const resolveDispute = (id) => {
    setDisputes((prevDisputes) =>
      prevDisputes.map((dispute) =>
        dispute.id === id ? { ...dispute, status: "Resolved" } : dispute
      )
    );
  };

  // Handle dispute dismissal
  const dismissDispute = (id) => {
    setDisputes((prevDisputes) =>
      prevDisputes.filter((dispute) => dispute.id !== id)
    );
  };

  // Submit a new dispute
  const handleFileDispute = async () => {
    if (!selectedProperty || !issueDescription) {
      alert("Please select a property and enter an issue description.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          lease_id: selectedProperty,
          issue_description: issueDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to file dispute");
      const newDispute = await response.json();
      setDisputes([...disputes, newDispute.dispute]);
      setSelectedProperty("");
      setIssueDescription("");
      alert("Dispute filed successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div>Loading disputes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <Link href="/">
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">Disputes</h1>
      <p className="mb-6">
        {user.role === "tenant"
          ? "View and manage your disputes with your landlord."
          : "Manage the disputes related to your properties below."}
      </p>

      {/* Form for filing disputes (Tenant Only) */}
      {user.role === "tenant" && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">File a New Dispute</h2>
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">-- Select a property --</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Issue Description</label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleFileDispute}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            File Dispute
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Tenant View: Show only the tenant's disputes */}
        {user.role === "tenant" &&
          (() => {
            // Filter disputes for the current tenant
            const tenantDisputes = disputes.filter((dispute) => {
              const disputeTenant =
                `${dispute.tenant_first_name} ${dispute.tenant_last_name}`
                  .trim()
                  .toLowerCase();
              const currentUser = `${user.first_name} ${user.last_name}`
                .trim()
                .toLowerCase();
              return disputeTenant === currentUser;
            });

            return tenantDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="border rounded-md p-4 bg-white shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">
                    {dispute.tenant_first_name} {dispute.tenant_last_name}
                  </h3>
                  <p>{dispute.property_address}</p>
                  <p className="text-sm text-gray-500">
                    {dispute.issue_description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Lease Start:{" "}
                    {new Date(dispute.lease_start_date).toLocaleDateString()} |
                    Lease End:{" "}
                    {new Date(dispute.lease_end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-md text-white ${
                      dispute.status === "Open"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    {dispute.status}
                  </span>
                </div>
              </div>
            ));
          })()}

        <h2 className="text-2xl font-bold mb-4">Existing Disputes</h2>
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="border rounded-md p-4 bg-white shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {dispute.tenant_first_name} {dispute.tenant_last_name}
                </h3>
                <p>{dispute.property_address}</p>
                <p className="text-sm text-gray-500">
                  {dispute.issue_description}
                </p>
                <p className="text-sm text-gray-500">
                  Lease Start:{" "}
                  {new Date(dispute.lease_start_date).toLocaleDateString()} |
                  Lease End:{" "}
                  {new Date(dispute.lease_end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`px-4 py-2 rounded-md text-white ${
                    dispute.status === "Open" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                >
                  {dispute.status}
                </span>
                {dispute.status !== "Resolved" && user.role !== "tenant" && (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => resolveDispute(dispute.id)}
                  >
                    Resolve
                  </button>
                )}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={() => dismissDispute(dispute.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Disputes;

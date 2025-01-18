"use client";
import { Router } from "next/router";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "../userContext";

const Agreements = () => {
  const { user } = useUser();
  const [tenantAgreement, setTenantAgreement] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure user is logged in
  useEffect(() => {
    if (!user) {
      Router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    const fetchAgreements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:3000/api/agreements?role=${user.role}&userId=${user.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch agreements");
        }
        const data = await response.json();
        setAgreements(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAgreements();
    }
  }, [user?.id, user?.role]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div>Loading agreements...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Agreements</h1>
        <p className="text-gray-600 mt-1">
          {user.role === "tenant"
            ? "View the rental agreement for the property you are renting."
            : "Manage all your rental agreements here."}
        </p>
      </div>
      <div className="mb-4">
        <Link href="/">
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition">
            ← Back to Dashboard
          </button>
        </Link>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {user.role === "tenant" ? "Your Agreement" : "Your Agreements"}
        </h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="text-left p-2">Lease Start Date</th>
              <th className="text-left p-2">Lease End Date</th>
              <th className="text-left p-2">Rent Amount</th>
              <th className="text-left p-2">Deposit Amount</th>
              <th className="text-left p-2">Lease Status</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length > 0 ? (
              agreements.map((agreement) => (
                <tr
                  key={agreement.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                >
                  <td className="p-2">
                    {formatDate(agreement.lease_start_date)}
                  </td>
                  <td className="p-2">
                    {formatDate(agreement.lease_end_date)}
                  </td>
                  <td className="p-2">
                    ${parseFloat(agreement.rent_amount).toFixed(2)}
                  </td>
                  <td className="p-2">
                    ${parseFloat(agreement.deposit_amount).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <span
                      className={`p-1 rounded ${
                        agreement.lease_active
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {agreement.lease_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-2 text-center">
                  No agreements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agreements;

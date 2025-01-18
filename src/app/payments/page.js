"use client";
import { Router } from "next/router";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "../userContext";

const Payments = () => {
  const { user } = useUser();
  const [payments, setPayments] = useState([]); // Payment history
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: "",
    tenantName: "", // Set dynamically
  });

  // Ensure user is logged in
  useEffect(() => {
    if (!user) {
      Router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    // Fetch payments only if user is available
    if (user) {
      const fetchPayments = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/payments?user_id=${user.id}&role=${user.role}`
          );
          const paymentData = await response.json();
          console.log(paymentData);
          setPayments(paymentData);
        } catch (error) {
          console.error("Error fetching payments:", error);
        }
      };

      fetchPayments(); // Only fetch payments if user is logged in
    }
  }, [user?.id, user?.role]); // Add user properties and router as dependencies

  // Submit new payment to the database
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const newPaymentObj = {
      ...newPayment,
      status: "Paid",
    };

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaymentObj),
      });

      if (response.ok) {
        const createdPayment = await response.json();
        setPayments((prev) => [...prev, createdPayment]);
        setNewPayment({ amount: "", date: "", tenantName: user.name });
      } else {
        console.error("Failed to submit payment");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) return <div>Loading...</div>; // Display loading state until user is available

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-600 mt-1">
          {user.role === "tenant"
            ? "View your payment history below and make a payment."
            : "View and manage payment history for your properties."}
        </p>
      </div>

      {/* Back to Main Page */}
      <div className="mb-4">
        <Link href="/">
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Tenant Make Payment Form (only shown for tenants) */}
      {user.role === "tenant" && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Make a Payment</h2>
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                id="amount"
                type="text"
                className="w-full p-2 border rounded-md"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Date
              </label>
              <input
                id="date"
                type="date"
                className="w-full p-2 border rounded-md"
                value={newPayment.date}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, date: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Make Payment
            </button>
          </form>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        {user.role === "tenant"
          ? // Tenant View: Show payments related only to the logged-in tenant
            payments.map((payment) => (
              <div
                key={payment.id}
                className="border-b py-3 flex justify-between items-center"
              >
                <span>{formatDate(payment.payment_date)}</span>
                <span>{payment.amount}</span>
                <span>{payment.property_address}</span>
                <span
                  className={`font-medium ${
                    payment.payment_status === "Completed"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {payment.payment_status}
                </span>
              </div>
            ))
          : // Landlord View: Show all payments for properties the landlord manages
            payments.map((payment) => (
              <div
                key={payment.id}
                className="border-b py-3 flex justify-between items-center"
              >
                <span>{formatDate(payment.payment_date)}</span>
                <span>{payment.amount}</span>
                <span>
                  {payment.tenant_first_name} {payment.tenant_last_name}
                </span>
                <span>{payment.property_address}</span>
                <span
                  className={`font-medium ${
                    payment.payment_status === "Completed"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {payment.payment_status}
                </span>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Payments;

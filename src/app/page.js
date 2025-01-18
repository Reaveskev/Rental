"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "./userContext";

const Dashboard = () => {
  const { user, setUser } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      try {
        setUserRole(user.role || null);
        setUserAccount(user.name || null);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
        sessionStorage.removeItem("user"); // Clear corrupted data
        setLoading(false);
      }
    } else {
      window.location.href = "/login";
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null); // Clear the user from context
    sessionStorage.removeItem("user"); // Remove user data from sessionStorage
    window.location.href = "/login";
  };

  const TenantDashboard = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Tenant Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Your Agreements"
          description="View and manage your rental agreements."
          link="/agreements"
        />
        <DashboardCard
          title="Your Payments"
          description="View your payment history or make a payment."
          link="/payments"
        />
        <DashboardCard
          title="Manage Your Property"
          description="View and manage your rental property details."
          link="/properties"
        />
        <DashboardCard
          title="Manage Disputes"
          description="View and resolve any disputes with your landlord."
          link="/disputes"
        />
      </div>
    </div>
  );

  const LandlordDashboard = () => (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-green-700">
        Your Property Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Manage Your Properties"
          description="Add, edit, or remove properties."
          link="/properties"
        />
        <DashboardCard
          title="View Tenant Agreements"
          description="Review and manage agreements."
          link="/agreements"
        />
        <DashboardCard
          title="View Rental Payments"
          description="Monitor rental payments."
          link="/payments"
        />
        <DashboardCard
          title="Manage Disputes"
          description="Handle any tenant disputes or issues."
          link="/disputes"
        />
      </div>
    </div>
  );

  const DashboardCard = ({ title, description, link }) => (
    <div className="bg-white shadow-lg rounded-lg p-5 hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={link}
        className="inline-block text-blue-600 font-semibold hover:underline"
      >
        Go to {title.split(" ")[1]} →
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading your dashboard...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-red-600">
          Error: User not found. Please log in again.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Your Dashboard,{" "}
          {user?.first_name || <span className="skeleton">Loading...</span>}!
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <p>Your role is: {user?.role || "unknown"}</p>
      {userRole === "tenant" && <TenantDashboard />}
      {userRole === "landlord" && <LandlordDashboard />}
      {!userRole && (
        <div className="text-red-600">
          <p>Error: No role found. Please log in again.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

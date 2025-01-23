"use client"; // Ensures the component is client-side

import { useState } from "react";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset any error messages
    setSuccess(""); // Reset success message

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Simulate the sign-up API call (replace with your actual API)
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        sessionStorage.setItem("user", JSON.stringify(userData)); // Store user data
        setSuccess("Sign-up successful! Redirecting to dashboard...");
        // Redirect after successful sign-up
        setTimeout(() => {
          window.location.href = "/dashboard"; // You can replace this with a different route if needed
        }, 2000); // Wait for 2 seconds before redirecting
      } else {
        const data = await response.json();
        setError(data.message || "Sign-up failed! Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again."); // Catch any errors
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full sm:w-96 bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign Up
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            <p>{success}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className={`w-full p-3 rounded-lg text-white ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

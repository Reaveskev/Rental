"use client"; // Ensures the component is client-side

import { useState } from "react";
import { useUser } from "../userContext";

const Login = () => {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset any error messages

    if (!email || !password) {
      setError("Please fill in both fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();

        sessionStorage.setItem("user", JSON.stringify(userData)); // Save user data to sessionStorage
        setUser(userData); // Update context
        window.location.href = "/"; // Redirect
      } else {
        const data = await response.json();
        setError(data.message || "Invalid credentials!");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full sm:w-96 bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            <p>{error}</p>
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
            <button
              type="submit"
              className={`w-full p-3 rounded-lg text-white ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Do not have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { useRouter } from "next/router";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant"); // Default role is 'tenant'
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Simulate account creation API call (replace with real logic)
    try {
      const response = await fetch("/api/createAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        // After successful account creation, redirect to the login page
        router.push("/login");
      } else {
        // Handle error if the API call fails (e.g., duplicate email)
        const errorData = await response.json();
        setError(errorData.message || "Account creation failed.");
      }
    } catch (error) {
      setError("An error occurred while creating the account.");
    }
  };

  return (
    <div>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        <button type="submit">Create Account</button>
      </form>

      <p>
        Already have an account? <a href="/login">Login here</a>.
      </p>
    </div>
  );
};

export default CreateAccount;

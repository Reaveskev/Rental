const client = require("../database");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "https://rental-property-a5c9efc9bb42.herokuapp.com/", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you're using cookies or authentication headers
  })
);

app.use(express.json());

// Handle preflight (OPTIONS) requests to allow CORS
app.options("*", cors());

app.post("/users", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, password, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user");
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const result = await client.query(
      "UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *",
      [name, email, password, role, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.post("/users/login", async (req, res) => {
  console.log("Test");
  const { email, password } = req.body;

  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const user = result.rows[0];
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// Export as serverless function
module.exports = app;

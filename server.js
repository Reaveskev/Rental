// server.js
const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

// Initialize the Express app
const app = express();
const corsOptions = {
  origin: "https://rental-property-a5c9efc9bb42.herokuapp.com/", // Replace with your frontend's URL
  methods: ["GET", "POST", "PUT", "DELETE"], // HTTP methods allowed
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};
app.use(cors(corsOptions));
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Create a PostgreSQL client
const client = new Client({
  host: "localhost",
  database: "rental_system",
  port: 5432,
});

// Connect to the PostgreSQL database
client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err.stack));

// CREATE: Add a new user (tenant or owner)
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

// CREATE: Add a new property
app.post("/properties", async (req, res) => {
  const { owner_id, address, price, bedrooms, bathrooms, available } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO properties (owner_id, address, price, bedrooms, bathrooms, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [owner_id, address, price, bedrooms, bathrooms, available]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding property");
  }
});

// CREATE: Add a new lease agreement
app.post("/leases", async (req, res) => {
  const { tenant_id, property_id, start_date, end_date, rent, status } =
    req.body;

  try {
    const result = await client.query(
      "INSERT INTO leases (tenant_id, property_id, start_date, end_date, rent, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [tenant_id, property_id, start_date, end_date, rent, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding lease");
  }
});

//grabbing leases
app.get("/api/agreements", async (req, res) => {
  const { role, userId } = req.query; // Get role and userId from query parameters

  try {
    let query = "SELECT * FROM leases"; // Basic query to fetch all agreements
    const params = [];

    if (role === "tenant") {
      // Fetch agreements where the tenant is associated with the userId
      query += " WHERE tenant_id = $1";
      params.push(userId);
    } else if (role === "landlord") {
      // For landlords, fetch agreements associated with properties they own
      query += `
        WHERE leases.property_id IN (
          SELECT property_id FROM properties WHERE user_id = $1
        )`;
      params.push(userId);
    }

    // Execute the query and get the results
    const result = await client.query(query, params);

    // Send back the results as a JSON response
    res.status(200).json(result.rows);
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).send("Error fetching agreements");
  }
});

// CREATE: Add a new payment
app.post("/payments", async (req, res) => {
  const { lease_id, amount, payment_date, status } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO payments (lease_id, amount, payment_date, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [lease_id, amount, payment_date, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding payment");
  }
});

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    console.log(user);

    // Compare password (you can use bcrypt or another library for hashing comparison)
    if (user.password_hash !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // User login successful
    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.get("/landlord_properties/:landlordId", async (req, res) => {
  try {
    // Get landlord_id from the request params
    const landlordId = req.params.landlordId; // Retrieve landlord_id from URL params

    if (!landlordId) {
      return res
        .status(400)
        .json({ message: "Bad Request: No landlord ID provided" });
    }

    const query = `
     SELECT * FROM properties WHERE user_id = $1;
    `;
    const result = await client.query(query, [landlordId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for this landlord." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: Add a new property (landlord only, assuming user is authenticated)
app.post("/properties", async (req, res) => {
  try {
    const { title, location, status, owner_id } = req.body;

    // Assuming owner_id is passed by the frontend
    if (!owner_id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const result = await pool.query(
      "INSERT INTO properties (title, location, status, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, location, status, owner_id]
    );

    res.status(201).json({ property: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Update a property (landlord only)
app.put("/properties/:id", async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { title, location, status, owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const result = await pool.query(
      "UPDATE properties SET title = $1, location = $2, status = $3 WHERE id = $4 AND owner_id = $5 RETURNING *",
      [title, location, status, propertyId, owner_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: Remove a property (landlord only)
app.delete("/properties/:id", async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { owner_id } = req.body; // Owner ID should be passed for deletion

    if (!owner_id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 AND owner_id = $2 RETURNING *",
      [propertyId, owner_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// READ: Get payments
app.get("/api/payments", async (req, res) => {
  const { role, user_id } = req.query;
  console.log(role, user_id);

  try {
    let query = `
      SELECT 
        payments.id, 
        payments.payment_date, 
        payments.amount, 
        payments.payment_status, 
        properties.address AS property_address, 
        users.first_name AS tenant_first_name, 
        users.last_name AS tenant_last_name
      FROM payments
      JOIN leases ON leases.id = payments.lease_id
      JOIN users ON users.id = payments.tenant_id
      JOIN properties ON properties.id = leases.property_id
    `;
    const params = [];

    if (role === "tenant") {
      query += " WHERE payments.tenant_id = $1";
      params.push(user_id);
    } else if (role === "landlord") {
      query += ` 
        WHERE properties.user_id = $1
      `;
      params.push(user_id);
    }

    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching payments");
  }
});

app.get("/api/disputes", async (req, res) => {
  const { user_id, role } = req.query; // Get user_id and role from the query
  console.log("Fetching disputes for user_id:", user_id, "with role:", role);

  try {
    let leaseQuery = "";
    let leaseParams = [];

    // Step 1: Build the query to fetch leases based on role
    if (role === "tenant") {
      leaseQuery = `
        SELECT leases.id, leases.tenant_id, leases.landlord_id, leases.property_id, 
               leases.lease_start_date, leases.lease_end_date, leases.rent_amount, leases.deposit_amount,
               properties.address, properties.property_type,
               users.first_name AS landlord_first_name, users.last_name AS landlord_last_name, users.email AS landlord_email
        FROM leases
        JOIN properties ON leases.property_id = properties.id
        JOIN users ON leases.landlord_id = users.id
        WHERE leases.tenant_id = $1`;
      leaseParams = [user_id];
    } else if (role === "landlord") {
      leaseQuery = `
        SELECT leases.id, leases.tenant_id, leases.landlord_id, leases.property_id, 
               leases.lease_start_date, leases.lease_end_date, leases.rent_amount, leases.deposit_amount,
               properties.address, properties.property_type,
               users.first_name AS tenant_first_name, users.last_name AS tenant_last_name, users.email AS tenant_email
        FROM leases
        JOIN properties ON leases.property_id = properties.id
        JOIN users ON leases.tenant_id = users.id
        WHERE leases.landlord_id = $1`;
      leaseParams = [user_id];
    } else {
      return res.status(400).send("Invalid role specified");
    }

    // Step 2: Execute the query to fetch lease and user details
    const leaseResult = await client.query(leaseQuery, leaseParams);
    const leaseIds = leaseResult.rows.map((row) => row.id);

    // Step 3: If no leases are found, return an empty array
    if (leaseIds.length === 0) {
      return res.status(200).json([]);
    }

    // Step 4: Fetch disputes associated with those lease IDs
    const disputesQuery = `
      SELECT disputes.id, disputes.issue_description, disputes.status, disputes.created_at, disputes.updated_at, disputes.lease_id
      FROM disputes
      WHERE disputes.lease_id = ANY ($1)`;
    const disputesResult = await client.query(disputesQuery, [leaseIds]);

    // Step 5: Combine the disputes with the additional lease and user info
    const disputesWithDetails = disputesResult.rows.map((dispute) => {
      const lease = leaseResult.rows.find(
        (lease) => lease.id === dispute.lease_id
      );

      // Check if the lease is found for the dispute
      if (!lease) {
        return {
          ...dispute,
          error: "Lease data not found for this dispute", // Optional: Add an error field for missing lease data
        };
      }

      return {
        ...dispute,
        lease_start_date: lease.lease_start_date,
        lease_end_date: lease.lease_end_date,
        rent_amount: lease.rent_amount,
        deposit_amount: lease.deposit_amount,
        property_address: lease.address,
        property_type: lease.property_type,
        ...(role === "tenant"
          ? {
              landlord_first_name: lease.landlord_first_name,
              landlord_last_name: lease.landlord_last_name,
              landlord_email: lease.landlord_email,
            }
          : {
              tenant_first_name: lease.tenant_first_name,
              tenant_last_name: lease.tenant_last_name,
              tenant_email: lease.tenant_email,
            }),
      };
    });

    // Step 6: Return the disputes to the client
    res.status(200).json(disputesWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching disputes");
  }
});

app.post("/api/disputes", async (req, res) => {
  const { lease_id, issue_description } = req.body;

  // Input validation
  if (!lease_id || !issue_description) {
    return res
      .status(400)
      .json({ error: "Lease ID and issue description are required." });
  }

  try {
    // Insert new dispute into the database
    const result = await client.query(
      `INSERT INTO disputes (lease_id, issue_description, status) 
       VALUES ($1, $2, 'Open') 
       RETURNING *`,
      [lease_id, issue_description]
    );

    // Respond with the created dispute
    res.status(201).json({
      message: "Dispute created successfully.",
      dispute: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting dispute:", error);
    res
      .status(500)
      .json({ error: "Failed to create dispute. Please try again later." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

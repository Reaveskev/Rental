const client = require("../database");

const cors = require("cors");
app.use(
  cors({
    origin: "https://rental-property-a5c9efc9bb42.herokuapp.com/", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you're using cookies or authentication headers
  })
);

module.exports = (app) => {
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

  app.get("/api/payments", async (req, res) => {
    const { role, user_id } = req.query;

    try {
      let query = `
        SELECT 
          payments.id, 
          payments.payment_date, 
          payments.amount, 
          payments.status, 
          properties.address AS property_address, 
          users.name AS tenant_name
        FROM payments
        JOIN leases ON leases.id = payments.lease_id
        JOIN users ON users.id = leases.tenant_id
        JOIN properties ON properties.id = leases.property_id
      `;
      const params = [];

      if (role === "tenant") {
        query += " WHERE leases.tenant_id = $1";
        params.push(user_id);
      } else if (role === "landlord") {
        query += " WHERE properties.owner_id = $1";
        params.push(user_id);
      }

      const result = await client.query(query, params);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching payments");
    }
  });

  app.put("/payments/:id", async (req, res) => {
    const { id } = req.params;
    const { lease_id, amount, payment_date, status } = req.body;

    try {
      const result = await client.query(
        "UPDATE payments SET lease_id = $1, amount = $2, payment_date = $3, status = $4 WHERE id = $5 RETURNING *",
        [lease_id, amount, payment_date, status, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating payment");
    }
  });

  app.delete("/payments/:id", async (req, res) => {
    const { id } = req.params;

    try {
      await client.query("DELETE FROM payments WHERE id = $1", [id]);
      res.status(200).send("Payment deleted successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting payment");
    }
  });
};

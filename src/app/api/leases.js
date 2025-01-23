const client = require("../database");
const cors = require("cors");
app.use(
  cors({
    origin: "https://rental-plum.vercel.app", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you're using cookies or authentication headers
  })
);

module.exports = (app) => {
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

  app.put("/leases/:id", async (req, res) => {
    const { id } = req.params;
    const { tenant_id, property_id, start_date, end_date, rent, status } =
      req.body;

    try {
      const result = await client.query(
        "UPDATE leases SET tenant_id = $1, property_id = $2, start_date = $3, end_date = $4, rent = $5, status = $6 WHERE id = $7 RETURNING *",
        [tenant_id, property_id, start_date, end_date, rent, status, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating lease");
    }
  });

  app.delete("/leases/:id", async (req, res) => {
    const { id } = req.params;

    try {
      await client.query("DELETE FROM leases WHERE id = $1", [id]);
      res.status(200).send("Lease deleted successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting lease");
    }
  });
};

// const client = require("../database");

// const cors = require("cors");
// app.use(
//   cors({
//     origin: "https://rental-property-a5c9efc9bb42.herokuapp.com/", // Replace with your frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true, // If you're using cookies or authentication headers
//   })
// );

// module.exports = (app) => {
//   app.post("/properties", async (req, res) => {
//     const { owner_id, address, price, bedrooms, bathrooms, available } =
//       req.body;

//     try {
//       const result = await client.query(
//         "INSERT INTO properties (owner_id, address, price, bedrooms, bathrooms, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
//         [owner_id, address, price, bedrooms, bathrooms, available]
//       );
//       res.status(201).json(result.rows[0]);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error adding property");
//     }
//   });

//   app.get("/properties/:id", async (req, res) => {
//     const { id } = req.params;

//     try {
//       const result = await client.query(
//         "SELECT * FROM properties WHERE id = $1",
//         [id]
//       );
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error fetching property");
//     }
//   });

//   app.put("/properties/:id", async (req, res) => {
//     const { id } = req.params;
//     const { owner_id, address, price, bedrooms, bathrooms, available } =
//       req.body;

//     try {
//       const result = await client.query(
//         "UPDATE properties SET owner_id = $1, address = $2, price = $3, bedrooms = $4, bathrooms = $5, available = $6 WHERE id = $7 RETURNING *",
//         [owner_id, address, price, bedrooms, bathrooms, available, id]
//       );
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error updating property");
//     }
//   });

//   app.delete("/properties/:id", async (req, res) => {
//     const { id } = req.params;

//     try {
//       await client.query("DELETE FROM properties WHERE id = $1", [id]);
//       res.status(200).send("Property deleted successfully");
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error deleting property");
//     }
//   });
// };

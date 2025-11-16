import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// API routes (add your routes here)

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

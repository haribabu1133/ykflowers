import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend dist directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// API routes
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    const orderId = Date.now().toString();

    // Save to orders.json
    const ordersFile = path.join(__dirname, 'orders.json');
    let orders = [];
    if (fs.existsSync(ordersFile)) {
      orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    }
    orders.push({ id: orderId, ...orderData, timestamp: new Date().toISOString() });
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    // Also save to orders.xlsx (simplified as JSON for now)
    // In a real app, you'd use a library like xlsx to write Excel files

    res.json({ success: true, orderId, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const ordersFile = path.join(__dirname, 'orders.json');
    if (fs.existsSync(ordersFile)) {
      const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// Root route - serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

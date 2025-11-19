import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Resolve static / index locations robustly
const PROJECT_ROOT = path.join(__dirname, '..'); // repo root
const CANDIDATE_STATIC_DIRS = [
  path.join(__dirname, 'public'),      // backend/public
  path.join(PROJECT_ROOT, 'public'),   // root/public
  PROJECT_ROOT,                        // project root (if index.html at repo root)
];

let STATIC_DIR = CANDIDATE_STATIC_DIRS.find(d => d && fs.existsSync(d));
if (STATIC_DIR) {
  app.use(express.static(STATIC_DIR));
  console.log('Serving static from:', STATIC_DIR);
} else {
  console.warn('No static directory found among candidates:', CANDIDATE_STATIC_DIRS);
}

// Data files (use absolute paths)
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Helper functions
function readJsonFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('Error reading JSON file', filePath, err);
  }
  return [];
}

function writeJsonFileSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON file', filePath, err);
  }
}

// API routes
app.post("/api/orders", (req, res) => {
  try {
    const order = req.body || {};
    const orders = readJsonFileSafe(ORDERS_FILE);
    const orderId = Date.now().toString();
    orders.push({ orderId, ...order, createdAt: new Date().toISOString() });
    writeJsonFileSafe(ORDERS_FILE, orders);
    res.json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error('POST /api/orders error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/orders", (req, res) => {
  const orders = readJsonFileSafe(ORDERS_FILE);
  res.json(orders);
});

// Resolve index file to serve for root and client-side routes
const INDEX_CANDIDATES = [
  path.join(STATIC_DIR || '', 'index.html'),
  path.join(__dirname, 'index.html'),
  path.join(PROJECT_ROOT, 'index.html')
].filter(p => p && fs.existsSync(p));

const INDEX_FILE = INDEX_CANDIDATES[0] || null;

app.get("/", (req, res) => {
  if (INDEX_FILE) {
    res.sendFile(INDEX_FILE);
  } else {
    res.status(404).send('index.html not found on server. Place index.html in project root or backend/public.');
  }
});

// Catch-all for client-side routes
app.get("*", (req, res) => {
  if (INDEX_FILE) {
    res.sendFile(INDEX_FILE);
  } else {
    res.status(404).send('index.html not found on server.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

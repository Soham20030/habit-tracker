import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB, setupTables, db } from "./db/db.js";
import authRoutes from './Routes/authRoutes.js';
import habitRoutes from './Routes/habitRoutes.js';
import completionRoutes from "./Routes/completionRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://habit-tracker-8eqs.onrender.com", // deployed frontend
  "http://localhost:5173"                    // local frontend dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// For preflight OPTIONS requests (very important for CORS)
app.options('*', cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB
await connectDB();
await setupTables();

// TEST: Add routes one by one to find the problematic one
console.log("Adding authRoutes...");
app.use('/api/auth', authRoutes);

// COMMENT OUT habitRoutes temporarily to test
// console.log("Adding habitRoutes...");
// app.use('/api', habitRoutes);

// COMMENT OUT completionRoutes temporarily
// console.log("Adding completionRoutes...");
// app.use('/api', completionRoutes);

// Test DB route
app.get("/database", async (req, res) => {
  try {
    const data = await db.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public'");
    return res.status(200).json(data.rows);
  } catch (error) {
    return res.status(500).json({ message: "error retrieving data" });
  }
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).send("<h1>Hello World</h1>");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server has started at port: ${PORT}`);
});
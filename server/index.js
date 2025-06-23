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

// Add detailed CORS logging
app.use(cors({
  origin: (origin, callback) => {
    console.log('=== CORS CHECK ===');
    console.log('Request Origin:', origin);
    console.log('Allowed Origins:', allowedOrigins);
    console.log('Origin in allowed list:', allowedOrigins.includes(origin));
    console.log('==================');
    
    // Allow requests with no origin (like Postman, mobile apps, etc.)
    if (!origin) {
      console.log('No origin header - allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed - proceeding');
      callback(null, true);
    } else {
      console.log('Origin NOT allowed - blocking request');
      console.log('Actual origin:', JSON.stringify(origin));
      console.log('Expected origins:', JSON.stringify(allowedOrigins));
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// For preflight OPTIONS requests
app.options('*', cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  console.log('Request headers:', req.headers);
  next();
});

// Connect to DB
try {
  await connectDB();
  await setupTables();
  console.log('Database connected and tables set up successfully');
} catch (error) {
  console.error('Database setup error:', error);
  process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', habitRoutes);
app.use('/api', completionRoutes);

// Test DB route
app.get("/database", async (req, res) => {
  try {
    const data = await db.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public'");
    return res.status(200).json(data.rows);
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ message: "error retrieving data" });
  }
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).send("<h1>Hello World</h1>");
});

// Add a test route to check CORS
app.get("/api/test-cors", (req, res) => {
  res.json({ 
    message: "CORS test successful", 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server has started at port: ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});
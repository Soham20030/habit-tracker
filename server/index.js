import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {connectDB, setupTables, db} from "./db/db.js";
import authRoutes from './Routes/authRoutes.js';
import habitRoutes from './Routes/habitRoutes.js';
import completionRoutes from "./Routes/completionRoutes.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Add these middleware lines:
app.use(express.json()); // This parses JSON bodies
app.use(express.urlencoded({ extended: true })); // This parses form data

await connectDB();
await setupTables();

app.use('/api/auth', authRoutes)

app.use('/api', habitRoutes);

app.use('/api', completionRoutes);

app.get("/database", async (req, res) => {
    try {
        const data = await db.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public'");
        res.json(data.rows);    
    } catch (error) {
        console.error("error getting the database", error);
        res.status(500).json({message: "error retriving data"});
    }
})

app.get("/", (req,res) =>{
    res.send("<h1>Hello World</h1>"); 
})




app.listen(PORT, () => {
    console.log(`Server has started at port: ${PORT}`);
})
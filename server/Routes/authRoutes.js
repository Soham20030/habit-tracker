import { Router } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {db} from '../db/db.js';
import authMiddleware from "../middleware/authMiddleware.js";
const router = new Router();

router.post("/register", async(req, res) => {
    console.log("=== REGISTER ROUTE HIT ===");
    console.log("Request body:", req.body);
    console.log("Headers:", req.headers);
    
    try {
        const {username, email, password} = req.body;
        
        console.log("Extracted data:", { username, email, password: password ? "***" : "undefined" });
        
        // Validate input
        if (!username || !email || !password) {
            console.log("Validation failed - missing fields");
            return res.status(400).json({message: "All fields are required"});
        }
        
        console.log("About to hash password...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully");
       
        console.log("About to insert into database...");
        const data = await db.query("INSERT INTO habit_users (username, email, password) VALUES ($1, $2, $3) RETURNING id", [
            username,
            email,
            hashedPassword
        ]);
        
        console.log("User inserted successfully with ID:", data.rows[0].id);
        res.status(201).json({message: "Successfully created a user"});
    } catch (error) {
        console.error("Registration error:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        
        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({message: "User with this email or username already exists"});
        }
        
        res.status(500).json({message: "Server error while creating a user", error: error.message});
    }
});

router.post("/login", async(req,res) => {
    console.log("=== LOGIN ROUTE HIT ===");
    console.log("Request body:", req.body);
    
    try {
        const {email, password} = req.body;
        
        console.log("Extracted data:", { email, password: password ? "***" : "undefined" });
        
        if (!email || !password) {
            console.log("Validation failed - missing email or password");
            return res.status(400).json({message: "Email and password are required"});
        }
        
        console.log("Searching for user with email:", email);
        const user = await db.query("SELECT * FROM habit_users WHERE email = $1", [email]);
        console.log("User query result:", user.rows.length > 0 ? "User found" : "No user found");

        if(user.rows.length === 0){
            console.log("Login failed - user not found");
            return res.status(401).json({message: "Invalid email or password" });
        } else {
            console.log("Comparing passwords...");
            const isMatch = await bcrypt.compare(password, user.rows[0].password);
            console.log("Password match:", isMatch);
            
            if(!isMatch) {
                console.log("Login failed - password mismatch");
                return res.status(401).json({message: "Invalid email or password" });
            } else{
                console.log("Login successful, generating token...");
                const token = jwt.sign(
                    {userId: user.rows[0].id, email: user.rows[0].email},
                    process.env.JWT_SECRET,
                    {expiresIn:"12h"}
                );
                console.log("Token generated successfully");
                res.status(200).json({message:"Login Successful", token: token});
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        res.status(500).json({message:"Server error while logging in", error: error.message});
    }
});

router.get("/profile", authMiddleware, async(req,res) => {
    try {
        const userId = req.user.userId;
        const user = await db.query("SELECT id, username, email FROM habit_users WHERE id = $1",[userId]);
        if(user.rows.length === 0){
            return res.status(404).json({message:"User not found"});
        }

        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({message:"Server error while fetching profile", error: error.message});
    }
});

export default router;
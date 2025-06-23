import { Router } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = new Router();

router.post("/register", async (req, res) => {
  console.log("=== REGISTER ROUTE HIT ===");
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = await db.query(
      "INSERT INTO habit_users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword]
    );

    return res.status(201).json({ message: "Successfully created a user" });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "User with this email or username already exists" });
    }

    return res.status(500).json({ message: "Server error while creating a user", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  console.log("=== LOGIN ROUTE HIT ===");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await db.query("SELECT * FROM habit_users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Server error while logging in", error: error.message });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await db.query("SELECT id, username, email FROM habit_users WHERE id = $1", [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching profile", error: error.message });
  }
});

export default router;

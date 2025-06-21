import { Router } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {db} from '../db/db.js';
const router = new Router();


router.post("/register", async(req, res) => {
    try {
        const {username, email, password} = req.body;
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
       
        const data = await db.query("INSERT INTO habit_users (username, email, password) VALUES ($1, $2, $3)", [
            username,
            email,
            hashedPassword
        ]);
        console.log("User inserted successfully");
        res.status(201).json({message: "Successfully created a user"});
    } catch (error) {
        res.status(500).json({message: "server error while creating a user"});
    }
});

router.post("/login", async(req,res) => {
    try {
        const {email, password} = req.body;
        const user = await db.query("SELECT * FROM habit_users WHERE email = $1", [email]);


        if(user.rows.length ===0){
            return res.status(401).json({message: "Invalid email or password" });
        } else {
            const isMatch = await bcrypt.compare(password, user.rows[0].password);
            if(!isMatch) {
                return res.status(401).json({message: "Invalid email or password" });
            } else{
                const token = jwt.sign(
                    {userId: user.rows[0].id, email: user.rows[0].email},
                    process.env.JWT_SECRET,
                    {expiresIn:"12h"}
                );
                res.status(200).json({message:"Login Successful", token: token});
            }
        }
    } catch (error) {
        res.status(500).json({message:"Server error while logging in"});
    }
});

export default router;
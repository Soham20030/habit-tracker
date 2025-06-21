import {Router} from "express";
import {db} from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = new Router();

router.use(authMiddleware);


// Show all habits

router.get('/habits', async(req, res) => {
    try {
        
        const userId = req.user.userId;

        const habits = await db.query("SELECT * FROM habits WHERE user_id = $1", [userId]);

        res.status(200).json(habits.rows);

    } catch (error) {
        res.status(500).json({message: "Error fetching habits"});
    }
});


//POST A HABIT

router.post ('/habits', async(req,res)=> {
    try {
        const {name, description} = req.body;
        const userId = req.user.userId;

        const newHabit = await db.query("INSERT INTO habits (name, description, user_id) VALUES ($1, $2, $3) RETURNING *", [
            name,
            description,
            userId
        ]);
        res.status(201).json(newHabit.rows[0]);
    } catch (error) {
        res.status(500).json({message:"Server error while creating a habit"});
        
    }
});


//EDIT A HABIT

router.put('/habits/:id', async(req,res)=> {
    try {
        const habitId = req.params.id;
        const {name, description} = req.body;
        const userId = req.user.userId;

        const updatedHabit = await db.query("UPDATE habits SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",[
            name,
            description,
            habitId,
            userId
        ]);

        if(updatedHabit.rows.length === 0) {
            return res.status(404).json({message: "Habit not found"});
        }

        res.status(200).json(updatedHabit.rows[0]);
    } catch (error) {
        res.status(500).json({message: "Error updating habit"});
    }
});


//DELETE A HABIT

router.delete('/habits/:id', async(req,res)=> {
    try {
        const habitId = req.params.id;
        const userId = req.user.userId;

        const deletedHabit = await db.query("DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *", [
            habitId,
            userId
        ]);

        if(deletedHabit.rows.length === 0) {
            return res.status(404).json({message: "Habit not found"});
        }
        res.status(200).json({message: "Habit deleted Successfully"});

    } catch (error) {
        res.status(500).json({message:"Error deleteing habit"});
    }
});


export default router;
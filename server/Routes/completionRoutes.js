import {db} from "../db/db.js";
import {Router} from "express";
import authMiddleware from "../middleware/authMiddleware.js";
const router = new Router();

router.use(authMiddleware);


// TO UPDATE THE HABIT

router.post("/completions", async(req, res)=>{
    try {
        const {habitId, date, completed} = req.body;
        const userId = req.user.userId;

        if(!habitId || !date) {
            return res.status(400).json({message:"Habit Id and date are required"});
        }

        const habitCheck = await db.query("SELECT * FROM habits WHERE user_id = $1 AND id = $2",[
            userId,
            habitId
        ]);


        if(habitCheck.rows.length === 0) {
            res.status(404).json({message: "Habit not found or dosen't belong to user"});
        }

const existingCompletion = await db.query("SELECT * FROM completions WHERE habit_id = $1 AND completed_date = $2", [            habitId,
            date
        ]);


        if(existingCompletion.rows.length === 0) {
            const result = await db.query(
                "INSERT INTO completions (habit_id, completed_date, completed) VALUES ($1, $2, $3) RETURNING *", [
                    habitId,
                    date,
                    completed
                ]
            );
            res.status(201).json({message:"Habit has been inserted",
                                  completion: result.rows[0]
            });
        } else {
            const result = await db.query(
                "UPDATE completions SET completed = $1 WHERE habit_id = $2 AND completed_date = $3 RETURNING *",[
                    completed,
                    habitId,
                    date
                ]
            );
             res.status(200).json({message:"Habit has been Updated",
                                     completion: result.rows[0]
             });
        }
    } catch (error) {
        res.status(500).json({message:"Error updating habit completion"});
    }
});


//Get Completions of single habits

router.get("/completions/:habitId", async(req,res) => {
    try {
        const {habitId} = req.params;
        const userId = req.user.userId;

        const result = await db.query("SELECT * FROM habits WHERE id = $1 AND user_id = $2", [
            habitId,
            userId
        ])

        if(result.rows.length === 0) {
            return res.status(404).json({message: "Habit not found or doesn't belong to user"});
        }

        const completions = await db.query("SELECT * FROM completions WHERE habit_id = $1 ORDER BY completed_date DESC", [
            habitId
        ]);
        return res.status(200).json(completions.rows);

    } catch (error) {
        res.status(500).json({message: "Error fetching completion history"});
    }
});


router.get("/completions", async(req,res)=> {
    try {
        const userId = req.user.userId;

        const result = await db.query(
            "SELECT completions.* FROM completions JOIN habits ON completions.habit_id = habits.id WHERE habits.user_id = $1 ORDER BY completed_date DESC",
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({message: "Error fetching completions"});
    }
});


export default router;

import express from "express";
import auth from "../middlewares/authentication.js";

const router = express.Router();

// to get the list of all saves
router.get('/list', async (req, res) => {});

// to add to save:
router.put('/save',auth, async (req, res) => {
    try {
        // getting my user Id from req object which is added
    } catch (error) {
        
    }
});

// to update new srouce:
router.patch('/update/:save_id', async (req, res) => {});

// to delete new srouce:
router.delete('/delete/:save_id', async (req, res) => {});

export default router;
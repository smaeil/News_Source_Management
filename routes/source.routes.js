import express from "express";
import authentication from "../middlewares/authentication.js";
import { adminCheck } from "../middlewares/authentication.js";

const router = express.Router();

// to get the list of all sources
router.get('/list',authentication, adminCheck, async (req, res) => {});

// to add new srouce:
router.put('/new',authentication, adminCheck, async (req, res) => {});

// to update new srouce:
router.patch('/update/:source_id',authentication, adminCheck, async (req, res) => {});

// to delete new srouce:
router.delete('/delete/:source_id',authentication, adminCheck, async (req, res) => {});

export default router;


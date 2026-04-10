import express from "express";

const router = express.Router();

// to get the list of all sources
router.get('/list', async (req, res) => {});

// to add new srouce:
router.put('/new', async (req, res) => {});

// to update new srouce:
router.patch('/update/:source_id', async (req, res) => {});

// to delete new srouce:
router.delete('/delete/:source_id', async (req, res) => {});

export default router;


import express from "express";
import authentication, { adminCheck } from "../middlewares/authentication.js";
import Sources from "../models/Sources.schema.js";
import respond from "../middlewares/tools/httpRes.js";

const router = express.Router();

// 1. Get the list of all sources (Admin only)
// Supports optional pagination via query: ?page=1&limit=10
router.get('/list', authentication, adminCheck, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [allSources, total] = await Promise.all([
            Sources.find().sort({ name: 1 }).skip(skip).limit(limit),
            Sources.countDocuments()
        ]);

        return respond(res, 200, "Sources list retrieved.", {
            sources: allSources,
            total
        });
    } catch (error) {
        return respond(res, 500, "Error fetching sources.");
    }
});

// 2. Get full data for a single source
router.get('/single/:source_id', authentication, adminCheck, async (req, res) => {
    try {
        const { source_id } = req.params;
        const source = await Sources.findById(source_id);

        if (!source) return respond(res, 404, "Source not found.");

        return respond(res, 200, "Source details found.", source);
    } catch (error) {
        return respond(res, 500, "Error fetching source.");
    }
});

// 3. Add new source (Changed to POST for consistency)
router.post('/new', authentication, adminCheck, async (req, res) => {
    try {
        const { name, url, urlType, category, apiKey } = req.body;

        if (!name || !url || !urlType || !category) {
            return respond(res, 400, "All required fields must be provided.");
        }

        const newSource = new Sources({
            name,
            url,
            urlType,
            category,
            apiKey
        });

        await newSource.save();
        return respond(res, 201, "New source added successfully!", newSource);
    } catch (error) {
        if (error.code === 11000) {
            return respond(res, 400, "This source URL already exists.");
        }
        return respond(res, 500, "Failed to create source.");
    }
});

// 4. Update a source (Changed to POST for consistency)
router.post('/update/:source_id', authentication, adminCheck, async (req, res) => {
    try {
        const { source_id } = req.params;

        const updatedSource = await Sources.findByIdAndUpdate(
            source_id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedSource) return respond(res, 404, "Source not found.");

        return respond(res, 200, "Source updated successfully.", updatedSource);
    } catch (error) {
        return respond(res, 500, "Update failed.");
    }
});

// 5. Delete a source (Changed to POST for consistency)
router.post('/delete/:source_id', authentication, adminCheck, async (req, res) => {
    try {
        const { source_id } = req.params;

        const deletedSource = await Sources.findByIdAndDelete(source_id);

        if (!deletedSource) return respond(res, 404, "Source not found.");

        return respond(res, 200, "Source deleted successfully.");
    } catch (error) {
        return respond(res, 500, "Delete failed.");
    }
});

export default router;
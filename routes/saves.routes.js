import express from "express";
import authentication from "../middlewares/authentication.js";
import Save from "../models/Saves.schema.js"; 
import respond from "../middlewares/tools/httpRes.js";

const router = express.Router();

// 1. Get list with Pagination (using Query: ?page=1&limit=10)
router.get('/list', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        
        // Default settings if no query parameters exist
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [saves, total] = await Promise.all([
            Save.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Save.countDocuments({ user: userId })
        ]);

        return respond(res, 200, "Saves retrieved successfully.", {
            saves,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error("List Saves Error:", error);
        return respond(res, 500, "Server error while fetching list.");
    }
});

// 2. Get a single save (using Param)
router.get('/single/:save_id', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const { save_id } = req.params;

        const save = await Save.findOne({ _id: save_id, user: userId });

        if (!save) return respond(res, 404, "Save not found.");

        return respond(res, 200, "Save found.", save);
    } catch (error) {
        return respond(res, 500, "Server error.");
    }
});

// 3. Add a new save (using POST Body)
router.post('/save', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const { title, url, source, imageUrl, description } = req.body;

        if (!title || !url) return respond(res, 400, "Missing title or URL.");

        const newSave = new Save({
            user: userId,
            title,
            url,
            source,
            imageUrl,
            description
        });

        await newSave.save();
        return respond(res, 201, "News saved!", newSave);
    } catch (error) {
        return respond(res, 500, "Save failed.");
    }
});

// 4. Update a save (using Param)
router.post('/update/:save_id', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const { save_id } = req.params;
        const updateData = req.body;

        const updatedSave = await Save.findOneAndUpdate(
            { _id: save_id, user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedSave) return respond(res, 404, "Save not found.");

        return respond(res, 200, "Save updated.", updatedSave);
    } catch (error) {
        return respond(res, 500, "Update failed.");
    }
});

// 5. Delete a save (using Param)
router.post('/delete/:save_id', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const { save_id } = req.params;

        const deletedSave = await Save.findOneAndDelete({ _id: save_id, user: userId });

        if (!deletedSave) return respond(res, 404, "Save not found.");

        return respond(res, 200, "Save deleted successfully.");
    } catch (error) {
        return respond(res, 500, "Delete failed.");
    }
});

// 6. Search within saves (using Query: ?q=keyword&page=1&limit=10)
router.get('/search', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return respond(res, 400, "Search query 'q' is required.");
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Define the search filter
        const searchFilter = {
            user: userId,
            $text: { $search: q } // This utilizes the text index
        };

        const [results, total] = await Promise.all([
            Save.find(searchFilter, { score: { $meta: "textScore" } }) // Get relevance score
                .sort({ score: { $meta: "textScore" } })             // Sort by best match
                .skip(skip)
                .limit(parseInt(limit)),
            Save.countDocuments(searchFilter)
        ]);

        return respond(res, 200, `Found ${total} results for "${q}"`, {
            results,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error("Search Error:", error);
        return respond(res, 500, "Server error during search.");
    }
});

export default router;
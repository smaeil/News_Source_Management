import express from "express";
import authentication from "../middlewares/authentication.js";
import Sources from "../models/Sources.schema.js";
import User from "../models/Users.schema.js";
import { fetchFromSource } from "../middlewares/newsCatcher.js";
import respond from "../tools/httpRes.js";

const router = express.Router();


// 1. Live Feed according to user's preference
router.get('/my_feed', authentication, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const user = await User.findById(userId);
        if (!user) return respond(res, 404, "User not found.");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Find sources that match user preferences
        // If user has no preferences, get all active sources
        const sourceFilter = user.preferences.length > 0 
            ? { category: { $in: user.preferences }, isActive: true } 
            : { isActive: true };

        const activeSources = await Sources.find(sourceFilter);

        // Fetch from all matching sources in parallel
        const nestedResults = await Promise.all(
            activeSources.map(source => fetchFromSource(source))
        );

        // Flatten the array and sort by date (newest first)
        let allArticles = nestedResults.flat().sort((a, b) => 
            new Date(b.publishDate) - new Date(a.publishDate)
        );

        // Manual Pagination for live data
        const totalItems = allArticles.length;
        const startIndex = (page - 1) * limit;
        const paginatedArticles = allArticles.slice(startIndex, startIndex + limit);

        return respond(res, 200, "Fresh feed fetched.", {
            feed: paginatedArticles,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Live Feed Error:", error);
        return respond(res, 500, "Error fetching live feed.");
    }
});

// 2. Full text search through LIVE sources
router.get('/search', authentication, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return respond(res, 400, "Search query required.");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const activeSources = await Sources.find({ isActive: true });
        const nestedResults = await Promise.all(
            activeSources.map(source => fetchFromSource(source))
        );

        const keyword = q.toLowerCase();
        let filteredArticles = nestedResults.flat().filter(article => 
            article.title.toLowerCase().includes(keyword) || 
            (article.description && article.description.toLowerCase().includes(keyword))
        );

        // Manual Pagination
        const totalItems = filteredArticles.length;
        const startIndex = (page - 1) * limit;
        const paginatedResults = filteredArticles.slice(startIndex, startIndex + limit);

        return respond(res, 200, `Search results for "${q}"`, {
            results: paginatedResults,
            pagination: {
                totalItems,
                currentPage: page
            }
        });
    } catch (error) {
        return respond(res, 500, "Live search failed.");
    }
});


// 3. Get news for a single specific category (using Query: ?page=1&limit=10)
// URL Example: /api/feeds/category/sport?page=1&limit=10
router.get('/category/:catName', authentication, async (req, res) => {
    try {
        const { catName } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Find all active sources that cover this specific category
        // MongoDB handles the array search automatically
        const sources = await Sources.find({ 
            category: catName, 
            isActive: true 
        });

        if (sources.length === 0) {
            return respond(res, 404, `No active sources found for category: ${catName}`);
        }

        // 2. Fetch from all matching sources in parallel
        const nestedResults = await Promise.all(
            sources.map(source => fetchFromSource(source))
        );

        // 3. Flatten, remove empty results, and sort by date
        let allArticles = nestedResults
            .flat()
            .filter(article => article && article.title)
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

        // 4. Manual Pagination
        const totalItems = allArticles.length;
        const paginatedArticles = allArticles.slice(skip, skip + limit);

        return respond(res, 200, `${catName.toUpperCase()} feed fetched.`, {
            feed: paginatedArticles,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Category Fetch Error (${req.params.catName}):`, error);
        return respond(res, 500, "Error fetching category news.");
    }
});

export default router;
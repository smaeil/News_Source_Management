import mongoose from "mongoose";
import { CATEGORIES } from "./enums.js";

const sourcesSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "BBC Tech"
    url: { type: String, required: true, unique: true }, // The RSS/API link
    apiKey: {type: String},
    urlType: {
        type: String,
        enum: ['rss', 'api'],
        required: true
    },
    headers: { type: Object, default: {} }, // e.g., { "User-Agent": "NSM-App" }
    mapping: {
        root: { type: String, default: "articles" },    // Path to the array
        title: { type: String, default: "title" },      // Field name for title
        link: { type: String, default: "url" },         // Field name for link
        thumbnail: { type: String, default: "urlToImage" }, // Field name for image
        description: { type: String, default: "description" }, // Added
        content: { type: String, default: "content" },         // Added
        date: { type: String, default: "publishedAt" }  // Field name for date
    },
    category: [{ 
        type: String, 
        enum: CATEGORIES, 
        required: true 
    }],
    isActive: { type: Boolean, default: true }, // Admin can "turn off" a broken feed
    lastFetched: { type: Date }
}, {timestamps: true});

const Sources = mongoose.model('Source', sourcesSchema);

export default Sources;
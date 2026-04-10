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
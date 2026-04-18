import mongoose from "mongoose";
import { CATEGORIES } from "./enums.js";

const savesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbnail: {
        type: String,
        default: null
    },
    favorite: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    source: String,
    categories: [{
        type: String,
        enum: CATEGORIES
    }],
    publishDate: Date
}, { timestamps: true });

// 1. Existing Index: Prevent a user from saving the same link twice
savesSchema.index({ user: 1, link: 1 }, { unique: true });

// 2. New Index: Full Text Search Index
// This allows searching across title and source fields
savesSchema.index({ 
    title: 'text', 
    source: 'text' 
}, {
    weights: {
        title: 10,  // Title matches have higher relevance
        source: 2
    },
    name: "SavesTextSearchIndex"
});

const Saves = mongoose.model('Save', savesSchema);

export default Saves;
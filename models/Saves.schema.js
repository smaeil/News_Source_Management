import mongoose from "mongoose";
import { CATEGORIES } from "./enums.js";

const savesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    source: String,
    // Changed to 'categories' to match your enum and other schema
    categories: [{
        type: String,
        enum: CATEGORIES
    }],
    publishDate: Date
}, { timestamps: true });

// Prevent a user from saving the same link twice
savesSchema.index({ user: 1, link: 1 }, { unique: true });

const Saves = mongoose.model('Save', savesSchema);

export default Saves;
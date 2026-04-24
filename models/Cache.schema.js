import mongoose from "mongoose";

const cacheSchema = new mongoose.Schema({
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source', unique: true },
    articles: [{
        title: String,
        content: String,
        link: String,
        thumbnail: String,
        publishDate: Date
    }],
    updatedAt: { type: Date, default: Date.now }
});

// Create a Text Index on title and content for Full-Text Search
cacheSchema.index({ "articles.title": "text", "articles.content": "text" });

const Cache = mongoose.model("Cache", cacheSchema);

export default Cache;
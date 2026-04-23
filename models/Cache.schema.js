import mongoose from "mongoose";

const cacheSchema = new mongoose.Schema({
    sourceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Source', 
        required: true,
        unique: true 
    },
    articles: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now}
});

const Cache = mongoose.model("Cache", cacheSchema);
export default Cache;
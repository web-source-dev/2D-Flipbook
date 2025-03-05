import mongoose from 'mongoose';

const flipbookSchema = new mongoose.Schema({
    name: String,
    description : String,
    filename: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Flipbook = mongoose.model("Flipbook", flipbookSchema);
export default Flipbook;
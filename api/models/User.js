import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // Fixed "tpye" → "type"
    password: { type: String, required: true }, // Added required: true for security
}, { timestamps: true });

// Corrected model export (mongoose.model instead of mongoose.Model)
export const UserModel = mongoose.model('User', UserSchema);

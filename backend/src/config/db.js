const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ MongoDB Atlas connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error("👉 Please whitelist your IP in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access From Anywhere 0.0.0.0/0)");
    }
};

module.exports = connectDB;
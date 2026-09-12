const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS to resolve MongoDB Atlas SRV records if local ISP/router DNS fails
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
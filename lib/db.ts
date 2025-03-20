import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testing';

if (!MONGODB_URI) {
    throw new Error("❌ MongoDB URI is missing!");
}

let isConnected = false; 

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Already connected to MongoDB");
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI, {
            dbName: "testing", 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);

        isConnected = !!db.connections[0].readyState;
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
};

export default connectDB;

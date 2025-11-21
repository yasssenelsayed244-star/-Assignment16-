import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not provided. Skipping DB connection (for assignment/demo).");
    return;
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};

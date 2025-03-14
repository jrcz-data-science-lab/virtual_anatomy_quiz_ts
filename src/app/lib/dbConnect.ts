import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

const options = { bufferCommands: false };

async function dbConnect() {
  try {
    await mongoose.connect(MONGODB_URI, options);
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log("Connected to MongoDB");
  } finally {
    await mongoose.disconnect();
  }
}

dbConnect().catch(console.error);

export default dbConnect;

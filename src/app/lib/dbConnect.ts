import mongoose from "mongoose";

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? (process.env.MONGODB_URI_TEST as string)
    : (process.env.MONGODB_URI as string);

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI and MONGODB_URI_TEST environment variables inside .env"
  );
}

const options = { bufferCommands: false };

/**
 * Establishes a connection to MongoDB using the MONGODB_URI environment variable
 * and performs a `ping` command to verify the connection.
 *
 * @returns {Promise<void>}
 */
async function dbConnect(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

// dbConnect().catch(console.error);

export default dbConnect;

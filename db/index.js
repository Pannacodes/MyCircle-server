// ℹ️ Mongoose (ODM) handles the connection to MongoDB and provides schema-based modeling.
const mongoose = require("mongoose");

async function connectDB() {
  // Checks if a DB connection is already present. Prevents duplicate connections on serverless deployments like Vercel.
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  // ℹ️ Connects to MongoDB using the URI from environment variables.
  try {
    const response = await mongoose.connect(process.env.MONGODB_URI);
    const dbName = response.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  } catch (err) {
    console.error("Error connecting to mongo: ", err);
  }
}

module.exports = connectDB;
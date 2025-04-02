import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from "./routes/userRoutes.js";
import headerRoutes from "./routes/headerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Express app setup
const app = express();
app.use(express.json());

// Use routes
app.use("/api", userRoutes);
app.use("/api", headerRoutes);
app.use("/api", messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

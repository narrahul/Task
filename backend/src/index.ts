import "reflect-metadata";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import productRoutes from "./routes/productRoutes";

dotenv.config();

// Fix SSL issue with Supabase - only in development
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Initialize database and start server

AppDataSource.initialize()
  .then(async () => {
    // Database connection established
    
    app.listen(PORT, () => {
      // Server started successfully
    });
  })
  .catch((error) => {
    // Error during Data Source initialization
    process.exit(1);
  });
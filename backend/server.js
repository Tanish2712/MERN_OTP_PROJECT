const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const productRoutes =
    require("./routes/productRoutes");


// Load environment variables
dotenv.config();


// Create Express app
const app = express();


// Connect MongoDB
connectDB();


// Middleware
app.use(cors());

app.use(express.json());


// Static uploads folder
app.use(
    "/uploads",
    express.static("uploads")
);


// Test route
app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "Company Project API is running"

    });

});


// Auth routes
app.use(
    "/api/auth",
    authRoutes
);


// Product routes
app.use(
    "/api/products",
    productRoutes
);


// Port
const PORT =
    process.env.PORT || 5000;


// Start server
app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);
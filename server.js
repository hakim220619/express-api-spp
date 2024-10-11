// Import necessary modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

// Middleware setup

// Use Helmet to secure Express apps by setting various HTTP headers
app.use(helmet());

// Enable CORS for all origins
app.use(cors({
  origin: '*',  // Adjust as needed for specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parse JSON and urlencoded requests
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Simple welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API." });
});

// Import routes from an external file
require("./app/routes/routes.js")(app);

// Error handling middleware for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware for catching errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Set port and listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

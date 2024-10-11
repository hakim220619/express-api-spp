const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');  // Tambahkan helmet untuk keamanan

const app = express();

// Use Helmet to help secure Express apps by setting various HTTP headers
app.use(helmet());

// Enable All CORS Requests or specify allowed origins if needed
app.use(cors({
  origin: '*',  // Atur domain yang diizinkan, misal: 'http://example.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Izinkan metode HTTP tertentu
  allowedHeaders: ['Content-Type', 'Authorization'],  // Izinkan header tertentu
}));

// Set custom CORS headers for every request
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Handle pre-flight requests (OPTIONS method)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Parse JSON and urlencoded requests
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Simple welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome Api Dlh." });
});

// Import routes from external file
require("./app/routes/routes.js")(app);

// Error handling middleware for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware for catching errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Set port and listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}.`);
});

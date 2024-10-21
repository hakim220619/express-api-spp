const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
// Serve static files from the 'uploads' directory
app.use(cors({
  origin: '*', // Atur sesuai kebutuhan, bisa spesifik domain.
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.use('/uploads', express.static('uploads'));

// parse requests of content-type - application/json

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Api DLH." });
});

require("./app/routes/routes.js")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}.`);
});

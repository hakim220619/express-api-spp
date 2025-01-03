const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require('cors');
const path = require('path');


const app = express();
// Serve static files from the 'uploads' directory
app.use(cors({
  origin: '*', // Atau bisa diatur ke domain spesifik yang diizinkan
}));



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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Api DLH." });
});

require("./app/routes/routes.js")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
const HOST = '192.168.1.79'; // Default ke '0.0.0.0' agar mendengarkan semua IP

app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});


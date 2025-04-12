const express = require("express");
const cors = require('cors');
const os = require('os'); // To get the network interfaces
const path = require('path');

const app = express();
// Serve static files from the 'uploads' directory
app.use(cors({
  origin: '*', // Or configure it for specific allowed domains
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

// Parse requests of content-type - application/json
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Api DLH." });
});

require("./app/routes/routes.js")(app);

// Get the local network IP address
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i = 0; i < interfaces[iface].length; i++) {
      const alias = interfaces[iface][i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return '127.0.0.1'; // Default to localhost if no other IP is found
};

const HOST = getLocalIp();
const PORT = process.env.PORT || 8080;

app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

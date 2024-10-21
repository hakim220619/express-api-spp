const express = require("express");
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware untuk parsing JSON dan URL-encoded dengan limit 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mengaktifkan CORS untuk semua origin
app.use(cors());

// Menyajikan file statis dari folder 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route sederhana untuk cek server berjalan
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// Mengimpor routes dari folder routes
require("./app/routes/routes.js")(app);

// Menentukan port dan menjalankan server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

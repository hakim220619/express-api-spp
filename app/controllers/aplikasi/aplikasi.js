const Aplikasi = require("../../models/aplikasi/aplikasi.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = "uploads/aplikasi";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define the storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/aplikasi"); // Destination to save the file
  },
  filename: function (req, file, cb) {
    // Use the current timestamp and original extension for the filename
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File type filtering function
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    ); // Reject the file
  }
};

// Initialize multer with storage options, file limits, and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
  fileFilter: fileFilter, // Use the file filter
});

// Update existing Admin
exports.updateAplikasi = [
  upload.single("logo"), // Expect a single file with field name 'logo'
  async (req, res) => {
    // if (!req.body || (!req.body.data && !req.file)) {
    //   return res.status(400).send({
    //     message: "Content cannot be empty!",
    //   });
    // }
    const logoPath = req.file ? req.file.path : req.body.logo;

    try {
      // Construct the Aplikasi object
      const aplikasi = {
        id: req.body.uid, // Unique ID
        owner: req.body.owner,
        title: req.body.title,
        aplikasi_name: req.body.aplikasi_name,
        logo: logoPath, // Use the uploaded file path or existing logo
        copy_right: req.body.copy_right,
        versi: req.body.versi,
        token_whatsapp: req.body.token_whatsapp,
        urlCreateTransaksiMidtrans: req.body.urlCreateTransaksiMidtrans,
        urlCekTransaksiMidtrans: req.body.urlCekTransaksiMidtrans,
        claientKey: req.body.claientKey,
        serverKey: req.body.serverKey,
        updated_at: new Date(), // Update timestamp
      };

      const school = {
        id: req.body.school_id,
        address: req.body.address,
        phone: req.body.phone,
      };

      // Log file upload path for debugging
      console.log(
        "File uploaded to:",
        req.file ? req.file.path : "No file uploaded"
      );

      // Update Aplikasi in the database
      Aplikasi.update(aplikasi, school, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Aplikasi.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      console.error("Error during update:", error); // Log error details
      res.status(500).send({ message: "Error updating Aplikasi" });
    }
  },
];

// Retrieve all Admins from the database with conditions
exports.listAplikasi = (req, res, next) => {
  const aplikasi_name = req.query.q;
  Aplikasi.listAplikasi(aplikasi_name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};
exports.detailAplikasi = (req, res, next) => {
  const uid = req.body.uid;
  Aplikasi.detailAplikasi(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailSettingAplikasi = (req, res, next) => {
  const school_id = req.body.school_id;
  Aplikasi.detailSettingAplikasi(school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

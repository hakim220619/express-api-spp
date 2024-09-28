const Siswa = require("../../models/siswa/siswa.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const baseUploadDir = "uploads/school/siswa";
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const schoolId = req.body.school_id; // Get the school ID from the request body
    const uploadPath = path.join(baseUploadDir, schoolId.toString()); // Construct the folder path

    // Ensure the specific school directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Directory created: ${uploadPath}`);
    }

    cb(null, uploadPath); // Callback with the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Rename file with a unique identifier
  },
});

const upload = multer({ storage: storage });

// Retrieve all Siswa from the database with conditions
exports.listSiswa = (req, res, next) => {
  const fullName = req.query.q;
  const major = req.query.major;
  const clas = req.query.clas;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Siswa.listSiswa(fullName, school_id, major, clas, status, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    }
    res.send(data);
  });
};

// Create new Siswa
exports.createSiswa = [
  upload.single("gambar"), // Middleware for handling file upload
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      nisn,
      unit_id,
      full_name,
      email,
      phone,
      password,
      school_id,
      status,
      major_id,
      class_id,
      address,
      date_of_birth,
    } = req.body;

    try {
      // Create new siswa object
      const siswa = new Siswa({
        uid: uuidv4(),
        nisn: nisn,
        unit_id,
        school_id: school_id,
        full_name: full_name.toUpperCase(),
        email: email,
        address: address,
        phone: phone,
        major_id: major_id,
        class_id: class_id,
        password: await bcrypt.hash(password, 10),
        role: 160,
        created_by: req.body.created_by || "system",
        status: status || "ON",
        created_at: new Date(),
        date_of_birth: date_of_birth,
        image: req.file ? req.file.filename : null, // Store file name if uploaded
      });

      // Save siswa to the database
      Siswa.create(siswa, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || "Some error occurred while creating the Siswa.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      console.error("Error creating Siswa:", error);
      res.status(500).send({ message: "Error creating Siswa" });
    }
  },
];

// Update existing Siswa
exports.updateSiswa = [
  upload.single("image"), // Middleware for handling file upload during update
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const siswa = new Siswa({
        uid: req.body.data.uid,
        nisn: req.body.data.nisn,
        full_name: req.body.data.full_name.toUpperCase(),
        email: req.body.data.email,
        date_of_birth: req.body.data.date_of_birth,
        address: req.body.data.address,
        phone: req.body.data.phone,
        class_id: req.body.data.class_id,
        major_id: req.body.data.major_id,
        school_id: req.body.data.school,
        status: req.body.data.status,
        updated_by: req.body.data.updated_by,
        updated_at: new Date(),
        role: 160,
        image: req.file ? req.file.filename : null, // Update file if uploaded
      });

      Siswa.update(siswa, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || "Some error occurred while updating the Siswa.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      console.error("Error updating Siswa:", error);
      res.status(500).send({ message: "Error updating Siswa" });
    }
  },
];

// Delete a Siswa
exports.delete = (req, res) => {
  const uid = req.body.data;

  Siswa.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Siswa.",
      });
    }
    res.send(data);
  });
};

// Get details of a specific Siswa
exports.detailSiswa = (req, res, next) => {
  const uid = req.body.uid;
  
  Siswa.detailSiswa(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving the Siswa details.",
      });
    }
    res.send(data);
  });
};

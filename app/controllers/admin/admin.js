const Admin = require("../../models/admin/admin.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Rename file with a unique identifier
  },
});

const upload = multer({ storage: storage });

// Retrieve all Admins from the database with conditions
exports.listAdmin = (req, res, next) => {
  const fullName = req.query.q;
  const role = req.query.role;
  const status = req.query.status;
  const school = req.query.school;

  Admin.listAdmin(fullName, role, status, school, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createAdmin = [
  upload.single("image"), // Middleware for handling file upload
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      full_name,
      email,
      phone,
      password,
      school,
      status,
      role,
      address,
      date_of_birth,
    } = req.body;

    try {
      // Create new admin object
      const admin = new Admin({
        uid: uuidv4(),
        school_id: school,
        full_name: full_name.toUpperCase(),
        email: email,
        address: address,
        phone: phone,
        password: await bcrypt.hash(password, 10),
        role: role,
        created_by: req.body.created_by || "system",
        status: status || "ON",
        created_at: new Date(),
        date_of_birth: date_of_birth,
        image: req.file ? req.file.filename : null, // Store file name if uploaded
      });

      // Save admin to the database
      Admin.create(admin, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Admin.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error creating Admin" });
    }
  },
];

// Update existing Admin
exports.updateAdmin = [
  upload.single("image"), // Middleware for handling file upload during update
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const admin = new Admin({
        uid: req.body.data.uid,
        full_name: req.body.data.full_name.toUpperCase(),
        email: req.body.data.email,
        date_of_birth: req.body.data.date_of_birth,
        address: req.body.data.address,
        phone: req.body.data.phone,
        role: req.body.data.role,
        school_id: req.body.data.school,
        status: req.body.data.status,
        updated_by: req.body.data.updated_by,
        updated_at: new Date(),
      });

      Admin.update(admin, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Admin.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Admin" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Admin.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailAdmin = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  Admin.detailAdmin(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

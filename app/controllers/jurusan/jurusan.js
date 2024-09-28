const Jurusan = require("../../models/jurusan/jurusan.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listJurusan = (req, res, next) => {
  const unit_name = req.query.q;
  const school_id = req.query.school_id;
  const major_status = req.query.major_status;

  Jurusan.listJurusan(unit_name, school_id, major_status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createJurusan = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, unit_id, major_name, major_desc, major_status } = req.body;

    try {
      // Create new admin object
      const jurusan = new Jurusan({
        school_id: school_id,
        unit_id: unit_id,
        major_name: major_name.toUpperCase(),
        major_desc: major_desc.toUpperCase(),
        major_status: major_status || "ON",
        created_at: new Date(),
      });

      // Save admin to the database
      Jurusan.create(jurusan, (err, data) => {
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
exports.updateJurusan = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const jurusan = new Jurusan({
        uid: req.body.data.uid,
        school_id: req.body.data.school_id,
        unit_id: req.body.data.unit_id,
        major_name: req.body.data.major_name,
        major_desc: req.body.data.major_desc,
        major_status: req.body.data.major_status,
        updated_at: new Date(),
      }); 
      console.log(req.body.data);
      
      Jurusan.update(jurusan, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Kelas.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Kelass" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Jurusan.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Jurusan.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailJurusan = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  Jurusan.detailJurusan(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

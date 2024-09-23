const Bulan = require("../../models/bulan/bulan.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listBulan = (req, res, next) => {
  const month = req.query.q;
  const school_id = req.query.school_id;
  const month_status = req.query.month_status;

  Bulan.listBulan(month, school_id, month_status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createBulan = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, month, month_status } = req.body;

    try {
      // Create new admin object
      const jurusan = new Jurusan({
        school_id: school_id,
        month: month,
        month_status: month_status || "ON",
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
exports.updateBulan = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const bulan = new Bulan({
        uid: req.body.data.uid,
        school_id: req.body.data.school_id,
        month_number: req.body.data.month_number,
        month_status: req.body.data.month_status,
        updated_at: new Date(),
      }); 
      console.log(req.body.data);
      
      Bulan.update(bulan, (err, data) => {
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

exports.detailBulan = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  Bulan.detailBulan(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

const Affiliate = require("../../models/affiliate/affiliate.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listAffiliate = (req, res, next) => {
  const full_name = req.query.q;

  Affiliate.listAffiliate(full_name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createAccountAffiliate = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }
    try {
      // Create new admin object
      

      // Save admin to the database
      Affiliate.create( req.body, (err, data) => {
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
exports.updateAffiliate = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const jurusan = new Affiliate({
        uid: req.body.data.uid,
        school_id: req.body.data.school_id,
        major_name: req.body.data.major_name.toUpperCase(),
        major_status: req.body.data.major_status,
        updated_at: new Date(),
      }); 
      
      Affiliate.update(jurusan, (err, data) => {
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

  Affiliate.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Affiliate.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailAffiliate = (req, res, next) => {
  const uid = req.body.uid;
  Affiliate.detailAffiliate(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

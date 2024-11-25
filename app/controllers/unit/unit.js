const Unit = require("../../models/unit/unit.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listUnit = (req, res, next) => {
  const unit_name = req.query.q;
  const school_id = req.query.school_id;

  Unit.listUnit(unit_name, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createUnit = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      // Save admin to the database
      Unit.create(req.body, (err, data) => {
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
exports.updateUnit = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      
      Unit.update(req.body.data, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Unit.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Units" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Unit.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailUnit = (req, res, next) => {
  const uid = req.body.uid;
  Unit.detailUnit(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

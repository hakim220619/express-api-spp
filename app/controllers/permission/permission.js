const Permission = require("../../models/permission/permission.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listPermission = (req, res, next) => {
  const title = req.query.q;
  const school_id = req.query.school_id;

  Permission.listPermission(title, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createPermission = [
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
      const permissionData = {
        school_id: req.body.school_id,
        title: req.body.title,
        icon: req.body.icon,
        path: req.body.path,
        role: req.body.role,
        status: req.body.status || "ON",
        created_at: new Date(),
      };

      // Save admin to the database
      Permission.create(permissionData, (err, data) => {
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
exports.updatePermission = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const dataAll = {
        id: req.body.data.id,

        school_id: req.body.data.school_id,
        title: req.body.data.title,
        icon: req.body.data.icon,
        path: req.body.data.path,
        role: req.body.data.role,
        updated_at: new Date(),
      }; 
      Permission.update(dataAll, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Permission.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Permissions" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const id = req.body.data;

  Permission.delete(id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailPermission = (req, res, next) => {
  const id = req.body.id;
  Permission.detailPermission(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

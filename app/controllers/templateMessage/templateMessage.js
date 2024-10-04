const TemplateMessage = require("../../models/templateMessage/templateMessage.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listTemplateMessage = (req, res, next) => {
  const template_name = req.query.q;
  const school_id = req.query.school_id;

  TemplateMessage.listTemplateMessage(template_name, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createTemplateMessage = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }
console.log(req.body);

    try {
      // Create new admin object
      const dataALl = {
        school_id: req.body.school_id,
        template_name: req.body.template_name,
        deskripsi: req.body.deskripsi,
        message: req.body.message,
        status: req.body.status || "ON",
        created_at: new Date(),
      };
      

      // Save admin to the database
      TemplateMessage.create(dataALl, (err, data) => {
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
exports.updateTemplateMessage = [
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
            template_name: req.body.data.template_name,  // Mengganti title menjadi template_name
            deskripsi: req.body.data.deskripsi,          // Mengganti icon menjadi deskripsi
            message: req.body.data.message,              // Mengganti path menjadi message
            updated_at: new Date(),
          };
          
      TemplateMessage.update(dataAll, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the TemplateMessage.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating TemplateMessages" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const id = req.body.data;

  TemplateMessage.delete(id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailTemplateMessage = (req, res, next) => {
  const id = req.body.id;
  TemplateMessage.detailTemplateMessage(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

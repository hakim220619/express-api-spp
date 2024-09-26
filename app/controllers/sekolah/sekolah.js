const Sekolah = require("../../models/sekolah/sekolah.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listSekolah = (req, res, next) => {
  const school_name = req.query.q;

  Sekolah.listSekolah(school_name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createSekolah = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      school_name,
      address,
      phone,
      bank,
      account_name,
      account_number,
      status,
      type_payment,
    } = req.body;

    try {
      // Create new school object
      const sekolah = {
        school_name: school_name,
        address: address,
        phone: phone,
        bank: bank,
        account_name: account_name,
        account_number: account_number,
        status: status || "ON", // Default to "ON" if not provided
        type_payment: type_payment,
        created_at: new Date(),
      };

      // Save school to the database
      Sekolah.create(sekolah, (err, data) => {
        console.log(data);
        console.log(err);
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the School.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error creating School" });
    }
  },
];

// Update existing Admin
exports.updateSekolah = [
  upload.none(),
  async (req, res) => {
    if (!req.body || !req.body.data) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      id,
      school_name,
      address,
      phone,
      bank,
      account_name,
      account_number,
      status,
      type_payment,
    } = req.body.data;

    // Validate required fields
    if (
      !id ||
      !school_name ||
      !address ||
      !phone ||
      !bank ||
      !account_name ||
      !account_number ||
      !status ||
      !type_payment
    ) {
      return res.status(400).send({
        message: "All fields are required!",
      });
    }

    try {
      // Prepare the update data
      const updateData = {
        id,
        school_name,
        address,
        phone,
        bank,
        account_name,
        account_number,
        status,
        type_payment,
        updated_at: new Date(),
      };
      console.log(updateData);

      // Update the Sekolah document based on uid
      Sekolah.update(updateData, (err, data) => {
        if (err) {
          console.error("Error updating Sekolah:", err);
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Sekolah.",
          });
        }

        if (data.nModified === 0) {
          // Assuming you're using MongoDB
          return res.status(404).send({
            message: "Sekolah not found or no changes made.",
          });
        }

        res.send({
          message: "Sekolah was updated successfully!",
          data,
        });
      });
    } catch (error) {
      console.error("Error in updateSekolah:", error);
      res.status(500).send({ message: "Error updating Sekolah." });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Sekolah.delete(uid, (err, data) => {    
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailSekolah = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  Sekolah.detailSekolah(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

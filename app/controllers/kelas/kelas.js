const Kelas = require("../../models/kelas/kelas.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listKelas = (req, res, next) => {
  const class_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Kelas.listKelas(class_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};
exports.listPindahKelas = (req, res, next) => {
  const full_name = req.query.q;
  const school_id = req.query.school_id;

  Kelas.listPindahKelas(full_name, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createKelas = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, unit_id , class_name, class_desc, class_status } = req.body;

    try {
      // Create new admin object
      const kelas = new Kelas({
        school_id: school_id,
        unit_id: unit_id,
        class_name: class_name,
        class_desc: class_desc,
        class_status: class_status || "ON",
        created_at: new Date(),
      });

      // Save admin to the database
      Kelas.create(kelas, (err, data) => {
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
exports.updateKelas = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const kelas = new Kelas({
        uid: req.body.data.uid,
        unit_id: req.body.data.unit_id,
        school_id: req.body.data.school_id,
        class_name: req.body.data.class_name,
        class_desc: req.body.data.class_desc,
        class_status: req.body.data.class_status,
        updated_at: new Date(),
      }); 
      Kelas.update(kelas, (err, data) => {
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

// Update existing Admin
exports.pindahKelasByUserId = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }
// console.log(req.body);

    try {
      const Pindahkelas = {
        unit_from: req.body.unit_from,
        class_from: req.body.class_from,
        unit_to: req.body.unit_to,
        class_to: req.body.class_to,
        students: req.body.students,
        updated_at: new Date(),
      }; 
      Kelas.pindahKelasByUserId(Pindahkelas, (err, data) => {
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

// Update existing Admin
exports.kembaliKelasByUserId = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }
// console.log(req.body);

    try {
      const Pindahkelas = {
        unit_from: req.body.unit_from,
        class_from: req.body.class_from,
        unit_to: req.body.unit_to,
        class_to: req.body.class_to,
        students: req.body.students,
        updated_at: new Date(),
      }; 
      Kelas.pindahKelasByUserId(Pindahkelas, (err, data) => {
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

  Kelas.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailKelas = (req, res, next) => {
  const uid = req.body.uid;
  Kelas.detailKelas(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

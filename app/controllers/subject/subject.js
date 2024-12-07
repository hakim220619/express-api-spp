const subjects = require("../../models/absensi/subject.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();
const dayjs = require("dayjs");

// Retrieve all Admins from the database with conditions
exports.listSubjects = (req, res, next) => {
  const subject_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  subjects.listSubjects(subject_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createSubjects = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      school_id,
      unit_id,
      class_id,
      user_id,
      subject_name,
      code,
      start_time_in,
      end_time_in,
      status,
      description,
    } = req.body;
    try {
      // Create new admin object
      const Subjects = {
        school_id: school_id,
        unit_id: unit_id,
        class_id: class_id,
        user_id: user_id,
        subject_name: subject_name,
        code: code,
        start_time_in: start_time_in,
        end_time_in: end_time_in,
        description: description,
        status: status || "ON",
        created_at: new Date(),
      };

      // Save admin to the database
      subjects.createsubjects(Subjects, (err, data) => {
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
exports.updateSubjects = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const {
        id,
        school_id,
        unit_id,
        class_id,
        user_id,
        subject_name,
        code,
        start_time_in,
        end_time_in,
        status,
        description,
      } = req.body.data;

      // Create new admin object
      const Subjects = {
        id,
        school_id: school_id,
        unit_id: unit_id,
        class_id: class_id,
        user_id: user_id,
        subject_name: subject_name,
        code: code,
        start_time_in: start_time_in,
        end_time_in: end_time_in,
        description: description,
        status: status,
        updated_at: new Date(),
      };

      subjects.updateSubjects(Subjects, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the subjects.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating subjectss" });
    }
  },
];

// Delete an Admin
exports.deleteSubjects = (req, res) => {
  const id = req.body.data;

  subjects.deleteSubjects(id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailSubjects = (req, res, next) => {
  const id = req.body.id;
  subjects.detailSubjects(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

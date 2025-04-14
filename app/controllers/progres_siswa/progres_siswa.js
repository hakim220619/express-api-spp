const ProgresSiswa = require("../../models/progres_siswa/progres_siswa.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listProgresSiswa = (req, res, next) => {
  const ProgresSiswa_name = req.query.q;
  const school_id = req.query.school_id;

  ProgresSiswa.listProgresSiswa(ProgresSiswa_name, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};
exports.createProgresSiswa = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      user_id,
      subject_id,
      description,
      status,
    } = req.body;

    // If user_id contains multiple IDs, split it into an array
    const userIds = user_id.split(',');

    try {
      // Iterate over each user_id and create a new entry in ProgresSiswa
      const promises = userIds.map((id) => {
        const Subjects = {
          user_id: id.trim(),  // Ensure no extra spaces
          subject_id: subject_id,
          description: description,
          status: status,
          created_at: new Date(),
        };

        // Create each entry
        return ProgresSiswa.create(Subjects);
      });

      // Wait for all insert operations to complete
      const results = await Promise.all(promises);
      res.send(results); // Send the created data as response
    } catch (error) {
      res.status(500).send({
        message: "Some error occurred while creating the ProgresSiswa.",
        error: error.message,
      });
    }
  },
];


// Update existing Admin
exports.updateProgresSiswa = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      
      ProgresSiswa.update(req.body.data, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the ProgresSiswa.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating ProgresSiswas" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  ProgresSiswa.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailProgresSiswa = (req, res, next) => {
  const uid = req.body.uid;
  ProgresSiswa.detailProgresSiswa(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

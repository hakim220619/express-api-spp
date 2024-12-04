const Cuti = require("../../models/absensi/cuti.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");


const baseUploadDir = "uploads/school/cuti";
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const schoolId = req.body.school_id; // Get the school ID from the request body
    const uploadPath = path.join(baseUploadDir, schoolId.toString()); // Construct the folder path

    // Ensure the specific school directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Directory created: ${uploadPath}`);
    }

    cb(null, uploadPath); // Callback with the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Rename file with a unique identifier
  },
});

const upload = multer({ storage: storage });

// Retrieve all Admins from the database with conditions
exports.listCuti = (req, res, next) => {
  const full_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Cuti.listCuti(full_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.createCuti = [
  // Multer middleware for file upload handling
  upload.single("gambar"), // Handles a single file upload under the field 'gambar'

  async (req, res) => {
    try {
      // Extract necessary fields from req.body
      const {
        school_id,
        user_id,
        jenis_cuti_id,
        notes,
        status,
        start_date,
        end_date,
      } = req.body;

      // Basic validation for required fields
      if (
        !school_id ||
        !user_id ||
        !jenis_cuti_id ||
        !notes ||
        !status ||
        !start_date ||
        !end_date
      ) {
        return res.status(400).send({
          message:
            "All fields (school_id, user_id, jenis_cuti_id, notes, status, start_date, end_date) are required.",
        });
      }
      const formattedStartTime = dayjs(start_date).format(
        "YYYY-MM-DD HH:mm:ss"
      ); // Use dayjs to format the time
      const formattedEndTime = dayjs(end_date).format("YYYY-MM-DD HH:mm:ss");
      // Prepare the cuti data object
      const cutiData = {
        school_id,
        user_id,
        cuti_type_id: jenis_cuti_id,
        notes: notes.toUpperCase(),
        date_requested: new Date(),
        status,
        start_date: formattedStartTime,
        end_date: formattedEndTime,
        created_at: new Date(),
      };

      // If an image is uploaded, add it to the cutiData object
      if (req.file) {
        cutiData.image = req.file.filename; // Store filename of the uploaded image
      }
      console.log(cutiData);

      // Save the cuti entry to the database (assuming you have a model or query function like Cuti.createCuti)
      Cuti.createCuti(cutiData, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Cuti.",
          });
        }

        // Successfully created the cuti entry
        res.status(201).send(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "An unexpected error occurred while creating the Cuti.",
      });
    }
  },
];

exports.updateCuti = [
  // Multer middleware for file upload handling
  upload.single("gambar"), // Handles a single file upload under the field 'gambar'

  async (req, res) => {
    try {
      // Extract necessary fields from req.body
      const {
        id,
        jenis_cuti_id,
        notes,
        status,
        start_date,
        end_date,
      } = req.body;

      // Basic validation for required fields
      if (
       
        !jenis_cuti_id ||
        !notes ||
        !status ||
        !start_date ||
        !end_date
      ) {
        return res.status(400).send({
          message:
            "All fields (jenis_cuti_id, notes, status, start_date, end_date) are required.",
        });
      }
      const formattedStartTime = dayjs(start_date).format(
        "YYYY-MM-DD HH:mm:ss"
      ); // Use dayjs to format the time
      const formattedEndTime = dayjs(end_date).format("YYYY-MM-DD HH:mm:ss");
      // Prepare the cuti data object
      const cutiData = {
        id,
        cuti_type_id: jenis_cuti_id,
        notes: notes.toUpperCase(),
        date_requested: new Date(),
        status,
        start_date: formattedStartTime,
        end_date: formattedEndTime,
        updated_at: new Date(),
      };

      // If an image is uploaded, add it to the cutiData object
      if (req.file) {
        cutiData.image = req.file.filename; // Store filename of the uploaded image
      }
      console.log(cutiData);

      // Save the cuti entry to the database (assuming you have a model or query function like Cuti.createCuti)
      Cuti.updateCuti(cutiData, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Cuti.",
          });
        }

        // Successfully created the cuti entry
        res.status(201).send(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "An unexpected error occurred while creating the Cuti.",
      });
    }
  },
];

exports.listjenisCuti = (req, res, next) => {
  const cuti_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Cuti.listjenisCuti(cuti_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.createJenisCuti = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, cuti_name, description, status } = req.body;

    try {
      // Create the Activities object
      const jenisCuti = {
        school_id: school_id,
        cuti_name: cuti_name,
        description: description,
        status: status,
        created_at: new Date(),
      };

      // Save to database
      Cuti.createJenisCuti(jenisCuti, (err, data) => {
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

exports.listActivities = (req, res, next) => {
  const activity_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Cuti.listActivities(activity_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.updateJenisCuti = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { id, school_id, cuti_name, description, status } = req.body.data;

    try {
      // Create the Activities object
      const JenisCuti = {
        id,
        school_id: school_id,
        cuti_name: cuti_name,
        description: description,
        status: status,
        updated_at: new Date(),
      };

      console.log(JenisCuti);

      // Save to database
      Cuti.updateJenisCuti(JenisCuti, (err, data) => {
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

// Delete an Admin
exports.deleteCuti = (req, res) => {
  const uid = req.body.data;

  Cuti.deleteCuti(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};
exports.deleteJenisCuti = (req, res) => {
  const uid = req.body.data;

  Cuti.deleteJenisCuti(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailCuti = (req, res, next) => {
  const id = req.body.id;

  Cuti.detailCuti(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailJenisCuti = (req, res, next) => {
  const id = req.body.id;

  Cuti.detailJenisCuti(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

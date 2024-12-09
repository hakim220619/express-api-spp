const Absensi = require("../../models/absensi/absensi.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const dayjs = require("dayjs");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listAbsensi = (req, res, next) => {
  const full_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Absensi.listAbsensi(full_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};


exports.listAbsensiKegiatanByUserId = (req, res, next) => {
  const school_id = req.query.school_id;
  const unit_id = req.query.unit_id;
  const class_id = req.query.class_id;
  const activity_id = req.query.activity_id;
  const type = 'MASUK';


  Absensi.listAbsensiKegiatanByUserId(
    school_id,
    unit_id,
    class_id,
    activity_id,
    type,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};

exports.listAbsensiSubjectsByUserId = (req, res, next) => {
  const school_id = req.query.school_id;
  const unit_id = req.query.unit_id;
  const class_id = req.query.class_id;
  const subject_id = req.query.subject_id;
  const type = 'MASUK';

  Absensi.listAbsensiSubjectsByUserId(
    school_id,
    unit_id,
    class_id,
    subject_id,
    type,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};

exports.laporanAbsensiActivityByUserId = (req, res, next) => {

  const full_name = req.query.q;
  const school_id = req.query.school_id;
  const unit_id = req.query.unit_id;
  const class_id = req.query.class_id;
  const activity_id = req.query.activity_id;
  const selectedMonth = req.query.selectedMonth;
  const year = req.query.year;
  const type = 'MASUK';

  Absensi.laporanAbsensiActivityByUserId(
    full_name,
    school_id,
    unit_id,
    class_id,
    activity_id,
    selectedMonth,
    year,
    type,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};

exports.laporanAbsensiSubjectByUserId = (req, res, next) => {

  const full_name = req.query.q;
  const school_id = req.query.school_id;
  const unit_id = req.query.unit_id;
  const class_id = req.query.class_id;
  const subject_id = req.query.subject_id;
  const selectedMonth = req.query.selectedMonth;
  const year = req.query.year;
  const type = 'MASUK';

  Absensi.laporanAbsensiSubjectByUserId(
    full_name,
    school_id,
    unit_id,
    class_id,
    subject_id,
    selectedMonth,
    year,
    type,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};

// Create new Absensi (Attendance)
exports.createAbsensi = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, unit_id, user_id, activity_id, subject_id, status, type } =
      req.body;

    try {
      // Create new Absensi object
      const attendance = {
        school_id: school_id,
        unit_id: unit_id,
        user_id: user_id,
        activity_id: activity_id,
        subject_id: subject_id,
        status: status,
        type: type,
        created_at: new Date(),
      };
      console.log(attendance);

      // Save attendance to the database
      Absensi.createAbsensi(attendance, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Absensi.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error creating Absensi" });
    }
  },
];

// Update existing Admin
exports.updateAbsensi = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const kelas = new Absensi({
        uid: req.body.data.uid,
        unit_id: req.body.data.unit_id,
        school_id: req.body.data.school_id,
        class_name: req.body.data.class_name,
        class_desc: req.body.data.class_desc,
        class_status: req.body.data.class_status,
        updated_at: new Date(),
      });
      Absensi.update(kelas, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Absensi.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Absensis" });
    }
  },
];

exports.listActivities = (req, res, next) => {
  const activity_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Absensi.listActivities(activity_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.createActivities = [
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
      activity_name,
      start_time_in,
      end_time_in,
      description,
      status,
    } = req.body;

    try {
      // Parse and format start_time_in and end_time_in to ISO format or a database-friendly format
      const formattedStartTime = dayjs(start_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      ); // Use dayjs to format the time
      const formattedEndTime = dayjs(end_time_in).format("YYYY-MM-DD HH:mm:ss");

      // Create the Activities object
      const Activities = {
        school_id: school_id,
        activity_name: activity_name,
        start_time_in: formattedStartTime, // Set start time in a proper format
        end_time_in: formattedEndTime, // Set end time in a proper format
        description: description,
        status: status,
        created_at: new Date(),
      };

      // Save to database
      Absensi.createActivities(Activities, (err, data) => {
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

exports.updateActivities = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      id,
      school_id,
      activity_name,
      start_time_in,
      end_time_in,
      description,
      status,
    } = req.body.data;

    try {
      // Parse and format start_time_in and end_time_in to ISO format or a database-friendly format
      const formattedStartTime = dayjs(start_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      ); // Use dayjs to format the time
      const formattedEndTime = dayjs(end_time_in).format("YYYY-MM-DD HH:mm:ss");

      // Create the Activities object
      const Activities = {
        id,
        school_id: school_id,
        activity_name: activity_name,
        start_time_in: formattedStartTime, // Set start time in a proper format
        end_time_in: formattedEndTime, // Set end time in a proper format
        description: description,
        status: status,
        updated_at: new Date(),
      };

      console.log(Activities);

      // Save to database
      Absensi.updateActivities(Activities, (err, data) => {
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
exports.deleteActivities = (req, res) => {
  const uid = req.body.data;

  Absensi.deleteActivities(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailActivities = (req, res, next) => {
  const id = req.body.id;

  Absensi.detailActivities(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

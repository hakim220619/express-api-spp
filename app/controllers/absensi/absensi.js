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
exports.listAbsensiAktif = (req, res, next) => {
  const deskripsi = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Absensi.listAbsensiAktif(deskripsi, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.listAbsensiByUserId = (req, res, next) => {
  const user_id = req.query.user_id;

  Absensi.listAbsensiByUserId(user_id, (err, data) => {
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
  const type = req.query.type;

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
  const type = req.query.type;

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
  const type = "MASUK";

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
  const type = "MASUK";

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

    const {
      school_id,
      unit_id,
      user_id,
      activity_id,
      subject_id,
      status,
      type,
    } = req.body;

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

exports.createAbsensiAktif = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, unit_id, activity_id, subject_id, status, deskripsi } =
      req.body;

    try {
      // Create new Absensi object
      const attendance = {
        school_id: school_id,
        unit_id: unit_id,
        activity_id: activity_id,
        subject_id: subject_id,
        status: status,
        deskripsi: deskripsi,
        token: uuidv4(),
        created_at: new Date(),
      };

      // Save attendance to the database
      Absensi.createAbsensiAktif(attendance, (err, data) => {
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

exports.createAbsensiWithToken = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, nisn, token,activity_id, subject_id, type, status } = req.body;

    try {
      // Create new Absensi object
      const attendance = {
        school_id: school_id,
        nisn: nisn,
        token: token,
        activity_id: activity_id,
        subject_id: subject_id,
        type: type,
        status: status,
      };
console.log(attendance);

      Absensi.createAbsensiWithToken(attendance, (err, data) => {
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
      const formattedStartTime = dayjs(req.body.data.created_at).format(
        "YYYY-MM-DD HH:mm:ss"
      ); // Use dayjs to format the time
      const Absen = {
        id: req.body.data.id,
        created_at: formattedStartTime,
        status: req.body.data.status,
        updated_at: new Date(),
      };
      // console.log(Absensi);

      Absensi.updateAbsensi(Absen, (err, data) => {
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
      start_time_out,
      end_time_out,
      description,
      status,
    } = req.body;

    try {
      const formattedStartTimeIn = dayjs(start_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTimeIn = dayjs(end_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedStartTimeOut = dayjs(start_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTimeOut = dayjs(end_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      // Create the Activities object
      const Activities = {
        school_id: school_id,
        activity_name: activity_name,
        start_time_in: formattedStartTimeIn,
        end_time_in: formattedEndTimeIn,
        start_time_out: formattedStartTimeOut,
        end_time_out: formattedEndTimeOut,
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
      start_time_out,
      end_time_out,
      description,
      status,
    } = req.body.data;

    try {
      const formattedStartTimeIn = dayjs(start_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTimeIn = dayjs(end_time_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedStartTimeOut = dayjs(start_time_out).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTimeOut = dayjs(end_time_out).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      const Activities = {
        id,
        school_id: school_id,
        activity_name: activity_name,
        start_time_in: formattedStartTimeIn,
        end_time_in: formattedEndTimeIn,
        start_time_out: formattedStartTimeOut,
        end_time_out: formattedEndTimeOut,
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
exports.deleteAbsensi = (req, res) => {
  const uid = req.body.data;

  Absensi.deleteAbsensi(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};
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
exports.detailAbsensi = (req, res, next) => {
  const id = req.body.id;

  Absensi.detailAbsensi(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

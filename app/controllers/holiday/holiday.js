const Holiday = require("../../models/absensi/holiday.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();
const dayjs = require("dayjs");


// Retrieve all Admins from the database with conditions
exports.listHoliday = (req, res, next) => {
  const holiday_name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Holiday.listHoliday(holiday_name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createHoliday = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id , holiday_name, holiday_date_start, holiday_date_end, status, description } = req.body;
    const formattedholiday_date_start = dayjs(holiday_date_start).format(
        "YYYY-MM-DD"
      );
    const formattedholiday_date_end = dayjs(holiday_date_end).format(
        "YYYY-MM-DD"
      );
    try {
      // Create new admin object
      const holidays = {
        school_id: school_id,
        holiday_name: holiday_name,
        holiday_date_start: formattedholiday_date_start,
        holiday_date_end: formattedholiday_date_end,
        description: description,
        status: status || "ON",
        created_at: new Date(),
      };

      // Save admin to the database
      Holiday.createHoliday(holidays, (err, data) => {
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
exports.updateHoliday = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const hariLibur = {
        id: req.body.data.id,
        school_id: req.body.data.school_id,
        holiday_name: req.body.data.holiday_name,
        holiday_date_start: req.body.data.holiday_date_start,
        holiday_date_end: req.body.data.holiday_date_end,
        description: req.body.data.description,
        status: req.body.data.status,
        updated_at: new Date(),
      }; 

      
      Holiday.update(hariLibur, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Holiday.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Holidays" });
    }
  },
];

// Delete an Admin
exports.deleteHoliday = (req, res) => {
  const id = req.body.data;

  Holiday.deleteHoliday(id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailHoliday = (req, res, next) => {
  const id = req.body.id;
  Holiday.detailHoliday(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

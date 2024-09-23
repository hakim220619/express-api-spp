const SettingPembayaran = require("../../../models/setting/pembayaran/pembayaran.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listSettingPembayaran = (req, res, next) => {
  const sp_name = req.query.q;
  const school_id = req.query.school_id;
  const years = req.query.year;
  const sp_type = req.query.sp_type;
  const sp_status = req.query.sp_status;

  SettingPembayaran.listSettingPembayaran(sp_name, school_id, years, sp_type, sp_status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createSettingPembayaran = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, sp_name, sp_desc, years, sp_type, sp_status } = req.body;

    try {
      // Create new admin object
      const st_pembayaran = new SettingPembayaran({
        uid: `${uuidv4()}-${Date.now()}`,
        school_id: school_id,
        sp_name: sp_name.toUpperCase(),
        sp_desc: sp_desc.toUpperCase(),
        years: years,
        sp_type: sp_type,
        sp_status: sp_status || "ON",
        created_at: new Date(),
      });

      // Save admin to the database
      SettingPembayaran.create(st_pembayaran, (err, data) => {
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
exports.delete = (req, res) => {
  const uid = req.body.data;

  SettingPembayaran.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailSettingPembayaran = (req, res, next) => {
    const uid = req.body.uid;
    // console.log(req);
    SettingPembayaran.detailSettingPembayaran(uid, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials.",
        });
      else res.send(data);
    });
  };

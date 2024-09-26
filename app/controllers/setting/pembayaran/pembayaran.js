const SettingPembayaran = require("../../../models/setting/pembayaran/pembayaran.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();
const db = require("../../../config/db.config");

// Retrieve all Admins from the database with conditions
exports.listSettingPembayaran = (req, res, next) => {
  const sp_name = req.query.q;
  const school_id = req.query.school_id;
  const years = req.query.year;
  const sp_type = req.query.sp_type;
  const sp_status = req.query.sp_status;

  SettingPembayaran.listSettingPembayaran(
    sp_name,
    school_id,
    years,
    sp_type,
    sp_status,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.listSettingPembayaranDetail = (req, res, next) => {
  const full_name = req.query.q;
  const school_id = req.query.school_id;
  const clas = req.query.clas;
  const major = req.query.major;
  const setting_payment_uid = req.query.setting_payment_uid;

  SettingPembayaran.listSettingPembayaranDetail(
    full_name,
    school_id,
    clas,
    major,
    setting_payment_uid,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
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

    // Create new UID and timestamp
    const uid = `${uuidv4()}-${Date.now()}`;
    const created_at = new Date().toISOString();

    const query = `
      INSERT INTO setting_payment (uid, school_id, sp_name, sp_desc, years, sp_type, sp_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      uid,
      school_id,
      sp_name,
      sp_desc,
      years,
      sp_type,
      sp_status || "ON",
      created_at,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).send({
          message: "Error creating setting pembayaran.",
        });
      }
      return res.status(201).send({
        id: result.insertId,
        uid,
        school_id,
        sp_name,
        sp_desc,
        years,
        sp_type,
        sp_status: sp_status || "ON",
        created_at,
      });
    });
  },
];

exports.createPaymentByFree = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      school_id,
      sp_name,
      years,
      sp_type,
      sp_status,
      class_id,
      major_id,
      amount
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        uid: `${uuidv4()}-${Date.now()}`,
        setting_payment_uid: req.body.uid,
        school_id,
        sp_name: sp_name.toUpperCase(),
        years,
        sp_type,
        sp_status: sp_status || "ON",
        created_at: new Date(),
        class_id,
        major_id,
        amount
      });

      SettingPembayaran.createPaymentByFree(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
    }
  },
];
exports.createPaymentByMonth = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      school_id,
      sp_name,
      years,
      sp_type,
      sp_status,
      class_id,
      major_id,
      amount,
      months,
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        uid: `${uuidv4()}-${Date.now()}`,
        setting_payment_uid: req.body.uid,
        school_id,
        sp_name: sp_name.toUpperCase(),
        years,
        sp_type,
        sp_status: sp_status || "ON",
        created_at: new Date(),
        class_id,
        major_id,
        amount,
        months,
      });

      SettingPembayaran.createPaymentByMonth(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
    }
  },
];
exports.createPaymentByStudent = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      user_id,
      school_id,
      sp_name,
      years,
      sp_type,
      sp_status,
      class_id,
      major_id,
      amount,
      months,
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        uid: `${uuidv4()}-${Date.now()}`,
        user_id,
        setting_payment_uid: req.body.uid,
        school_id,
        sp_name: sp_name.toUpperCase(),
        years,
        sp_type,
        sp_status: sp_status || "ON",
        created_at: new Date(),
        class_id,
        major_id,
        amount,
        months,
      });
      // console.log(st_pembayaran);

      SettingPembayaran.createPaymentByStudent(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
    }
  },
];
exports.updateSettingPaymentByMonth = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      uid,
      setting_payment_uid,
      school_id,
      years,
      sp_type,
      months,
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        setting_payment_uid,
        uid,
        school_id,
        years,
        sp_type,
        created_at: new Date(),
        months,
      });
      // console.log(st_pembayaran);

      SettingPembayaran.updateSettingPaymentByMonth(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
    }
  },
];
exports.updateSettingPaymentByFree = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      uid,
      setting_payment_uid,
      school_id,
      years,
      sp_type,
      amount,
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        setting_payment_uid,
        uid,
        school_id,
        years,
        sp_type,
        created_at: new Date(),
        amount,  
      });
      // console.log(st_pembayaran);

      SettingPembayaran.updateSettingPaymentByFree(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
    }
  },
];
exports.createPaymentByFreeStudent = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {
      user_id,
      school_id,
      sp_name,
      years,
      sp_type,
      sp_status,
      class_id,
      major_id,
      amount
    } = req.body;

    try {
      const st_pembayaran = new SettingPembayaran({
        uid: `${uuidv4()}-${Date.now()}`,
        user_id,
        setting_payment_uid: req.body.uid,
        school_id,
        sp_name: sp_name.toUpperCase(),
        years,
        sp_type,
        sp_status: sp_status || "ON",
        created_at: new Date(),
        class_id,
        major_id,
        amount,
      });
      // console.log(st_pembayaran);

      SettingPembayaran.createPaymentByFreeStudent(st_pembayaran, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the payment.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating payment: " + error.message });
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
exports.deleteDetail = (req, res) => {
  const uid = req.body.data;
  const setting_payment_uid = req.body.setting_payment_id;
  const user_id = req.body.user_id;

  SettingPembayaran.deleteDetail(
    uid,
    setting_payment_uid,
    user_id,
    (err, data) => {
      // console.log(data);
      
      if (err) {
        return res.status(500).send({
          message:
            err.message || "Some error occurred while deleting the Admin.",
        });
      } else {
       return res.status(200).send({data});
      }
    }
  );
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
exports.detailSettingPembayaranByUid = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  SettingPembayaran.detailSettingPembayaranByUid(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailSettingPembayaranByUidFree = (req, res, next) => {
  const uid = req.body.id;
  console.log(req.body);
  SettingPembayaran.detailSettingPembayaranByUidFree(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

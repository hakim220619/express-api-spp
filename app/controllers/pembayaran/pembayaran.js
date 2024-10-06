const Pembayaran = require("../../models/pembayaran/pembayaran.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();
const db = require("../../config/db.config");

exports.listPembayaranPayByMonth = (req, res, next) => {
  const month_name = req.query.q;
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;
  const id_payment = req.query.id_payment;

  Pembayaran.listPembayaranPayByMonth(
    month_name,
    school_id,
    user_id,
    id_payment,
    (err, data) => {
      // console.log(data);

      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.listPembayaranPayByFree = (req, res, next) => {
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;
  const id_payment = req.query.id_payment;
  const setting_payment_uid = req.query.setting_payment_uid;

  Pembayaran.listPembayaranPayByFree(
    school_id,
    user_id,
    id_payment,
    setting_payment_uid,
    (err, data) => {
      // console.log(data);

      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.listPembayaranPayByFreeDetail = (req, res, next) => {
  const sp_name = req.query.q;
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;
  const id_payment = req.query.id_payment;

  Pembayaran.listPembayaranPayByFreeDetail(
    sp_name,
    school_id,
    user_id,
    id_payment,
    (err, data) => {
      // console.log(data);

      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};

// Create new Admin
exports.createPaymentPending = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataUsers, dataPayment, order_id, redirect_url } = req.body;

    try {
      // Create new admin object
      const pembayaran = {
        dataUsers: dataUsers,
        dataPayment: dataPayment,
        order_id: order_id,
        redirect_url: redirect_url,
      };

      // Save admin to the database
      Pembayaran.updatePaymentPendingAdmin(pembayaran, (err, data) => {
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
exports.createPaymentPendingByAdmin = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataUsers, dataPayment, admin_id, total_affiliate } = req.body;
    // console.log(req.body);

    try {
      // Create new admin object
      const pembayaran = {
        dataUsers: dataUsers,
        dataPayment: dataPayment,
        admin_id,
        total_affiliate
      };

      // Save admin to the database
      Pembayaran.updatePaymentPendingByAdmin(pembayaran, (err, data) => {
        
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
exports.createPaymentSuccess = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataUsers, dataPayment, order_id, redirect_url } = req.body;
    // console.log(req.body);

    try {
      // Create new admin object
      const pembayaran = {
        dataUsers: dataUsers,
        dataPayment: dataPayment,
        order_id: order_id,
        redirect_url: redirect_url,
      };

      // Save admin to the database
      Pembayaran.updateSuccess(pembayaran, (err, data) => {
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
exports.createPaymentSuccessFree = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataPayment, order_id, redirect_url, total_amount} = req.body;
    // console.log(req.body);

    try {
      // Create new admin object
      const pembayaran = {
        dataPayment: dataPayment,
        order_id: order_id,
        redirect_url: redirect_url,
        total_amount: total_amount,
      };

      // Save admin to the database
      Pembayaran.updateSuccessFree(pembayaran, (err, data) => {
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
exports.createPaymentPendingFree = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataPayment, order_id, redirect_url, total_amount} = req.body;
    // console.log(req.body);

    try {
      // Create new admin object
      const pembayaran = {
        dataPayment: dataPayment,
        order_id: order_id,
        redirect_url: redirect_url,
        total_amount: total_amount,
      };

      // Save admin to the database
      Pembayaran.updateSiswaFree(pembayaran, (err, data) => {
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
exports.createPaymentPendingByAdminFree = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { dataPayment, total_amount, admin_id, } = req.body;
    // console.log(req.body);

    try {
      // Create new admin object
      const pembayaran = {
        dataPayment: dataPayment,
        total_amount: total_amount,
        admin_id
      };

      // Save admin to the database
      Pembayaran.updatePaymentPendingByAdminFree(pembayaran, (err, data) => {
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

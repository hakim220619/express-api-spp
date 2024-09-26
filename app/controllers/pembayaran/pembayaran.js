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

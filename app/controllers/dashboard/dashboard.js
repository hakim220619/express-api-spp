const Dashboard = require("../../models/dashboard/dashboard.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listPaymentByMonths = (req, res, next) => {
  const sp_name = req.query.q;
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;

  Dashboard.listPaymentByMonths(sp_name, school_id, user_id, (err, data) => {
    console.log(data);
    
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

exports.detailBulan = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  Dashboard.detailBulan(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

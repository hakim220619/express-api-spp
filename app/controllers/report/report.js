const Report = require("../../models/report/report.model.js");

// Retrieve all Admins from the database with conditions
exports.listReport = (req, res, next) => {
  const dataAll = {
    user_id: req.query.q,
    school_id: req.query.school_id,
    user_id: req.query.user_id,
    setting_payment_uid: req.query.setting_payment_uid,
    type: req.query.type,
    years: req.query.year,
  };

  Report.listReport(dataAll, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};
exports.listReportFree = (req, res, next) => {
  const dataAll = {
    user_id: req.query.q,
    school_id: req.query.school_id,
    user_id: req.query.user_id,
    setting_payment_uid: req.query.setting_payment_uid,
    type: req.query.type,
    years: req.query.year,
  };

  Report.listReportFree(dataAll, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

const Tunggakan = require("../../models/tunggakan/tunggakan.model.js");

// Retrieve all Admins from the database with conditions
exports.listTunggakan = (req, res, next) => {
  const dataAll = {
    user_id: req.query.q,
    unit_id: req.query.unit_id,
    school_id: req.query.school_id,
    user_id: req.query.user_id,
    clas: req.query.clas,
    major: req.query.major,
  };

  Tunggakan.listTunggakan(dataAll, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};
exports.sendTunggakanSiswa = (req, res, next) => {
  const dataAll = {
    user_id: req.body.q,
    unit_id: req.body.unit_id,
    school_id: req.body.school_id,
    user_id: req.body.user_id,
    clas: req.body.clas,
    major: req.body.major,
  };

  Tunggakan.sendTunggakanSiswa(dataAll, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

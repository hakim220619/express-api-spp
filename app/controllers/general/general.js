const Role = require("../../models/general/role.model");

const db = require("../../config/db.config");
const Generate = require("../../models/general/generate.model");
const General = require("../../models/general/general.model");

// Retrieve all Tutorials from the database (with condition).
exports.roleAdmin = (req, res, next) => {
  const role_name = req.body.role_name;
  // console.log(role_name);
  Role.getRoleAdmin(role_name, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getRoleNoDeve = (req, res, next) => {
  const { role_name } = req.body;

  // console.log(role_name);
  Role.getRoleNoDeve(role_name, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

exports.findUsersByUid = (req, res, next) => {
  const uid = req.body.uid;
  // console.log(req);
  General.findUsersByUid(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getstatus = (req, res, next) => {
  // console.log(req);
  General.getstatus((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getSchool = (req, res, next) => {
  // console.log(req);
  General.getSchool((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getUsersAffiliate = (req, res, next) => {
  // console.log(req);
  General.getUsersAffiliate((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getRole = (req, res, next) => {
  // console.log(req);
  General.getRole((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getTypePayment = (req, res, next) => {
  // console.log(req);
  General.getTypePayment((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getUnit = (req, res, next) => {
  // console.log(req);
  General.getUnit((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getListPayment = (req, res, next) => {
  // console.log(req);
  General.getListPayment((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.cekTransaksiSuccesMidtrans = (req, res, next) => {
  // console.log(req);
  General.cekTransaksiSuccesMidtrans((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.cekTransaksiSuccesMidtransByUserIdFree = (req, res, next) => {
  const userId = req.query.user_id;
  console.log(userId);

  if (!userId) {
    return res.status(400).send({
      message: "User ID is required",
    });
  }

  General.cekTransaksiSuccesMidtransByUserIdFree(userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving transactions.",
      });
    } else {
      res.status(200).send(data);
    }
  });
};
exports.cekTransaksiSuccesMidtransByUserIdByMonth = (req, res, next) => {
  const userId = req.query.user_id;
  console.log(userId);

  if (!userId) {
    return res.status(400).send({
      message: "User ID is required",
    });
  }

  General.cekTransaksiSuccesMidtransByUserIdByMonth(userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving transactions.",
      });
    } else {
      res.status(200).send(data);
    }
  });
};

exports.cekTransaksiSuccesMidtransFree = (req, res, next) => {
  // console.log(req);
  General.cekTransaksiSuccesMidtransFree((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.cekFunction = (req, res, next) => {
  // console.log(req);
  General.cekFunction((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getMajors = (req, res, next) => {
  const schoolId = req.query.schoolId;

  // Validasi jika schoolId tidak ada di query
  if (!schoolId) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMajors dengan schoolId sebagai parameter
  General.getMajors(schoolId, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving majors.",
      });
    }

    // Jika data ditemukan, kirimkan respons dengan data
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No majors found for this schoolId." });
    }

    // Kirimkan data jurusan yang ditemukan
    res.status(200).send(data);
  });
};
exports.getClass = (req, res, next) => {
  const schoolId = req.query.schoolId;

  // Validasi jika schoolId tidak ada di query
  if (!schoolId) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getClass dengan schoolId sebagai parameter
  General.getClass(schoolId, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving majors.",
      });
    }

    // Jika data ditemukan, kirimkan respons dengan data
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No majors found for this schoolId." });
    }

    // Kirimkan data jurusan yang ditemukan
    res.status(200).send(data);
  });
};
exports.getMonths = (req, res, next) => {
  const schoolId = req.query.schoolId;

  // Validasi jika schoolId tidak ada di query
  if (!schoolId) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMonths dengan schoolId sebagai parameter
  General.getMonths(schoolId, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving majors.",
      });
    }

    // Jika data ditemukan, kirimkan respons dengan data
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No majors found for this schoolId." });
    }

    // Kirimkan data jurusan yang ditemukan
    res.status(200).send(data);
  });
};

exports.generate = (req, res) => {
  Generate.create((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};

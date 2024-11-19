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
exports.getAplikasiBySchool = (req, res, next) => {
  // console.log(req);
  const school_id = req.query.school_id
  General.getAplikasiBySchool(school_id, (err, data) => {
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
exports.getListPpdbActive = (req, res, next) => {
  const school_id = req.query.school_id;

  General.getListPpdbActive(school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getYears = (req, res, next) => {
  // console.log(req);
  General.getYears((err, data) => {
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
exports.getActivityBySchoolId = (req, res, next) => {
  const school_id = req.query.school_id;
  General.getActivityBySchoolId(school_id, (err, data) => {
    // console.log(data);

    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.forgetPassword = (req, res, next) => {
  const emailOrWhatsapp = req.body.emailOrWhatsapp;
  General.forgetPassword(emailOrWhatsapp, (err, data) => {
    console.log(err);

    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.resetNewPassword = (req, res, next) => {
  const id = req.body.id;
  const newPassword = req.body.newPassword;
  General.resetNewPassword(id, newPassword, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.newPasswordAll = (req, res, next) => {
  const id = req.body.uid;
  const newPassword = req.body.password;
  General.newPasswordAll(id, newPassword, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};


exports.sendMessages = (req, res) => {
  const { message, number, school_id } = req.body;
  // Contoh fungsi sendMessages untuk mengirim pesan WhatsApp
  General.sendMessages(message, number, school_id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Terjadi kesalahan saat mengirim pesan.",
      });
    } else res.send(data);
  });
};

exports.sendMessageBroadcast = (req, res, next) => {
  const dataUsers = req.body.dataUsers;
  const message = req.body.message;
  const school_id = req.body.school_id;

  // console.log(req);
  General.sendMessageBroadcast(dataUsers, message, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.getDetailClassMajorUsers = (req, res, next) => {
  const school_id = req.query.school_id;
  // console.log(req);
  General.getDetailClassMajorUsers(school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.cekTransaksiSuccesMidtrans = (req, res, next) => {
  const school_id = req.query.school_id
  General.cekTransaksiSuccesMidtrans(school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.cekTransaksiPaymentSiswaBaru = (req, res, next) => {
  // console.log(req);
  const school_id = req.query.school_id
  console.log(school_id);
  
  General.cekTransaksiPaymentSiswaBaru(school_id, (err, data) => {
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
exports.rolePermissions = (req, res, next) => {
  const school_id = req.query.school_id;

  // Validasi jika schoolId tidak ada di query
  if (!school_id) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMonths dengan schoolId sebagai parameter
  General.rolePermissions(school_id, (err, data) => {
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
exports.getMenuActive = (req, res, next) => {
  const school_id = req.query.school_id;

  // Validasi jika schoolId tidak ada di query
  if (!school_id) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMonths dengan schoolId sebagai parameter
  General.getMenuActive(school_id, (err, data) => {
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
exports.getDataMaster = (req, res, next) => {
  const school_id = req.query.school_id;

  // Validasi jika schoolId tidak ada di query
  if (!school_id) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMonths dengan schoolId sebagai parameter
  General.getDataMaster(school_id, (err, data) => {
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
exports.getPdfByIdPaymentMonth = (req, res, next) => {
  const id = req.query.id;

  // Validasi jika schoolId tidak ada di query
  if (!id) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  // Panggil fungsi General.getMonths dengan schoolId sebagai parameter
  General.getPdfByIdPaymentMonth(id, (err, data) => {
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

const Dashboard = require("../../models/dashboard/dashboard.model.js");

// Retrieve all Admins from the database with conditions
exports.listPaymentByMonths = (req, res, next) => {
  const sp_name = req.query.q;
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;

  Dashboard.listPaymentByMonths(
    sp_name,
    school_id,
    user_id,
    (err, data) => {
      console.log(data);

      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.listPaymentByMonthsByAdmin = (req, res, next) => {
  const sp_name = req.query.q;
  const unit_id = req.query.unit_id;
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;

  Dashboard.listPaymentByMonthsByAdmin(
    sp_name,
    unit_id,
    school_id,
    user_id,
    (err, data) => {

      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPembayaranBulanan = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPembayaranBulanan(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalTunggakanBulananBySiswa = (req, res, next) => {
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;

  Dashboard.getTotalTunggakanBulananBySiswa(
    school_id,
    user_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalTunggakanFreeBySiswa = (req, res, next) => {
  const school_id = req.query.school_id;
  const user_id = req.query.user_id;

  Dashboard.getTotalTunggakanFreeBySiswa(
    school_id,
    user_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPembayaranBebas = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPembayaranBebas(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPaymentThisDay = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPaymentThisDay(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPaymentThisWeek = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPaymentThisWeek(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPaymentThisMonth = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPaymentThisMonth(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalPaymentThisYears = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalPaymentThisYears(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalLoginMmLogs = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalLoginMmLogs(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getCountMonthAndFree = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getCountMonthAndFree(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalTunggakanBulanan = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalTunggakanBulanan(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTotalTunggakanBebas = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTotalTunggakanBebas(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getSaldoBySchool = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getSaldoBySchool(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
};
exports.getTransaksiAffiliateBySchool = (req, res, next) => {
  const school_id = req.query.school_id;

  Dashboard.getTransaksiAffiliateBySchool(
    school_id,
    (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Data.",
        });
      else res.send(data);
    }
  );
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

const db = require("../../config/db.config");
const General = function (data) {};

General.findUsersByUid = async (uid, result) => {
  let query =
    "SELECT u.id, u.religion, u.work, u.member_id, u.company_id, c.company_name, u.uid, u.nik,  u.member_id, u.fullName, u.email, u.date_of_birth, u.address, u.phone_number, u.status, u.password, u.role, u.created_at, r.role_name, u.marital_status, u.place_of_birth, u.no_identity, u.gender, u.identity_type FROM users u, role r, company c WHERE u.role=r.id and u.company_id=c.id and u.uid = '" +
    uid +
    "'";

  //   console.log(uid);
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    //   console.log("users: ", res);
    result(null, res[0]);
  });
};
General.getstatus = async (result) => {
  let query = "SELECT * from status where active = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getSchool = async (result) => {
  let query = "SELECT * from school where status = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getRole = async (result) => {
  let query = "SELECT * from role where role_status = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getMajors = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM major WHERE major_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += " AND school_id = ?";
  }

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
General.getClass = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM class WHERE class_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += " AND school_id = ?";
  }

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
General.getMonths = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM months WHERE month_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  const params = [];
  if (schoolId) {
    query += " AND school_id = ?";
    params.push(schoolId);
  }

  // Urutkan hasil berdasarkan month_number
  query += " ORDER BY month_number ASC";

  // Eksekusi query dengan parameter yang sesuai
  db.query(query, params, (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};



module.exports = General;

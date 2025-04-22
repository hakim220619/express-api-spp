const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const ProgresSiswa = function (data) {
  this.id = data.uid;
};

ProgresSiswa.create = (newData, result) => {

  db.query("INSERT INTO progres_siswa SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created ProgresSiswa: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

ProgresSiswa.update = (newData, result) => {
  console.log(newData);

  db.query(
    "UPDATE ProgresSiswa SET ? WHERE id = ?",
    [newData, newData.id],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null);
        return;
      }
      if (res.affectedRows == 0) {
        // Not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("Updated User: ", { id: newData.id, ...newData });
      result(null, { id: newData.uid, ...newData });
    }
  );
};

ProgresSiswa.listProgresSiswa = (full_name, school_id, subjec, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, p.*, u.full_name, u.school_id  FROM progres_siswa p, users u WHERE p.user_id=u.id ";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (subjec) {
    query += ` AND p.subject_id = '${subjec}'`;
  }

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("users: ", res);
    result(null, res);
  });
};

ProgresSiswa.listRekapSiswa = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, p.*, u.full_name, u.school_id, s.subject_name  FROM progres_siswa p, users u, subjects s WHERE p.user_id=u.id AND p.subject_id=s.id ";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }


  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("users: ", res);
    result(null, res);
  });
};
ProgresSiswa.deleteProgresSiswa = (uid, result) => {
  let query = `DELETE FROM progres_siswa WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted ProgresSiswa with ID ${uid}`);
    result(null, res);
  });
};
ProgresSiswa.detailProgresSiswa = async (uid, result) => {
  let query =
    "SELECT * from ProgresSiswa where id = '" +
    uid +
    "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res[0]);
  });
};

module.exports = ProgresSiswa;

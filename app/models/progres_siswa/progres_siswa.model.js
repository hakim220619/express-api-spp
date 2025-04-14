const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const ProgresSiswa = function (data) {
  this.id = data.uid;
};

ProgresSiswa.create = (newData, result) => {
    console.log(newData);
    
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

ProgresSiswa.listProgresSiswa = (ProgresSiswa_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.*  FROM ProgresSiswa u WHERE 1=1";

  if (ProgresSiswa_name) {
    query += ` AND u.ProgresSiswa_name like '%${ProgresSiswa_name}%'`;
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
ProgresSiswa.delete = (uid, result) => {
  let query = `DELETE FROM ProgresSiswa WHERE id = '${uid}'`;
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

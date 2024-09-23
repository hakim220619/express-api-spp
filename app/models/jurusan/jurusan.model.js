const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Jurusan = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.major_name = data.major_name;
  this.major_status = data.major_status || 'ON'; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Jurusan.create = (newJurusan, result) => {
    console.log(newJurusan);
    
  db.query("INSERT INTO major SET ?", newJurusan, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Jurusan: ", { id: res.insertId, ...newJurusan });
    result(null, { id: res.insertId, ...newJurusan });
  });
};

Jurusan.update = (newJurusan, result) => {
    console.log(newJurusan);
    
  db.query(
    "UPDATE major SET ? WHERE id = ?",
    [newJurusan, newJurusan.id],
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
      console.log("Updated Jurusan: ", { id: newJurusan.id, ...newJurusan });
      result(null, { id: newJurusan.uid, ...newJurusan });
    }
  );
};

Jurusan.listJurusan = (major_name, school_id, major_status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, m.*  FROM major m WHERE 1=1";

  if (major_name) {
    query += ` AND m.major_name like '%${major_name}%'`;
  }
  if (school_id) {
    query += ` AND m.school_id = '${school_id}'`;
  }
  if (major_status) {
    query += ` AND m.major_status = '${major_status}'`;
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
Jurusan.delete = (uid, result) => {
  let query = `DELETE FROM major WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted user with ID ${uid}`);
    result(null, res);
  });
};
Jurusan.detailJurusan = async (uid, result) => {
  let query =
    "SELECT * from major where id = '" +
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

module.exports = Jurusan;

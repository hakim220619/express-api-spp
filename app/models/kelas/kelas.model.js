const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Kelas = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.class_name = data.class_name;
  this.class_desc = data.class_desc;
  this.class_status = data.class_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Kelas.create = (newUsers, result) => {
  db.query("INSERT INTO class SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Kelas: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Kelas.update = (newUsers, result) => {
  db.query(
    "UPDATE class SET ? WHERE id = ?",
    [newUsers, newUsers.id],
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
      console.log("Updated User: ", { id: newUsers.id, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};

Kelas.listKelas = (class_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, c.*  FROM class c WHERE 1=1";

  if (class_name) {
    query += ` AND c.class_name like '%${class_name}%'`;
  }
  if (school_id) {
    query += ` AND c.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND c.status = '${status}'`;
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
Kelas.delete = (uid, result) => {
  let query = `DELETE FROM class WHERE id = '${uid}'`;
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
Kelas.detailKelas = async (uid, result) => {
  let query =
    "SELECT * from class where id = '" +
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

module.exports = Kelas;

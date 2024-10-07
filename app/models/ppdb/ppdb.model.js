const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Ppdb = function (data) {
  this.id = data.uid;
};

Ppdb.create = (newUsers, result) => {
  db.query("INSERT INTO class SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Ppdb: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Ppdb.update = (newUsers, result) => {
  db.query(
    "UPDATE calon_siswa SET ? WHERE id = ?",
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

Ppdb.listPpdb = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, cs.*, u.unit_name, s.school_name  FROM calon_siswa cs, school s, unit u WHERE cs.school_id=s.id AND cs.unit_id=u.id";

  if (full_name) {
    query += ` AND cs.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND cs.school_id = '${school_id}'`;
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
Ppdb.delete = (uid, result) => {
  let query = `DELETE FROM calon_siswa WHERE id = '${uid}'`;
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
Ppdb.detailPpdb = async (uid, result) => {
  let query =
    "SELECT * from calon_siswa where id = '" +
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

module.exports = Ppdb;

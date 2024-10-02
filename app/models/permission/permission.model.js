const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Permission = function (data) {
  this.id = data.uid;
};

Permission.create = (newUsers, result) => {
  db.query("INSERT INTO role_permission SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Permission: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Permission.update = (newUsers, result) => {
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

Permission.listPermission = (title, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, a.*, s.school_name, r.role_name  FROM role_permission a, school s, role r WHERE a.school_id=s.id AND a.role=r.id";

  if (title) {
    query += ` AND a.title like '%${unit_name}%'`;
  }
  if (school_id) {
    query += ` AND a.school_id = '${school_id}'`;
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
Permission.delete = (uid, result) => {
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
Permission.detailPermission = async (uid, result) => {
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

module.exports = Permission;

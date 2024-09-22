const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Admin = function (data) {
  this.uid = data.uid;
  this.school_id = data.school_id || null; // Fallback to null if not provided

  // Email, fullName, and other essential fields
  this.email = data.email;
  this.full_name = data.full_name;
  this.date_of_birth = data.date_of_birth || null; // Handling case if dob is not provided
  this.address = data.address;
  this.phone = data.phone;
  this.role = data.role;

  // Password (conditionally set if available)
  if (data.password != undefined) {
    this.password = data.password;
  }
  this.image = data.image || null; // Handling case if image is not provided
  // Status (Active by default if not provided)
  this.status = data.status || "ON";

  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Admin.create = (newUsers, result) => {
  db.query("INSERT INTO users SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Admin: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Admin.update = (newUsers, result) => {
  db.query(
    "UPDATE users SET ? WHERE uid = ?",
    [newUsers, newUsers.uid],
    (err, res) => {
      console.log(res);
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

      // console.log("Updated User: ", { id: newUsers.uid, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};

Admin.listAdmin = (fullName, role, status, school, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.*, r.role_name, s.school_name  FROM users u, role r, school s WHERE u.role=r.id AND u.school_id=s.id AND u.role != '160'";

  if (fullName) {
    query += ` AND u.full_name like '%${fullName}%'`;
  }
  if (role) {
    query += ` AND r.role_name = '${role}'`;
  }
  if (status) {
    query += ` AND u.status = '${status}'`;
  }
  if (school) {
    query += ` AND s.school_name = '${school}'`;
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
Admin.delete = (uid, result) => {
  let query = `DELETE FROM users WHERE uid = '${uid}'`;
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
Admin.detailAdmin = async (uid, result) => {
  let query =
    "SELECT u.*, r.role_name, s.school_name FROM users u, role r, school s WHERE u.role=r.id AND u.school_id=s.id AND u.uid = '" +
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

module.exports = Admin;

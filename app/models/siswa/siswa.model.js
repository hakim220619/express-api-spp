const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Siswa = function (data) {
  this.uid = data.uid;
  this.nisn = data.nisn;
  this.unit_id = data.unit_id;
  this.school_id = data.school_id || null; // Fallback to null if not provided

  // Email, fullName, and other essential fields
  this.email = data.email;
  this.full_name = data.full_name;
  this.date_of_birth = data.date_of_birth || null; // Handling case if dob is not provided
  this.address = data.address;
  this.phone = data.phone;
  this.role = data.role;
  this.major_id = data.major_id;
  this.class_id = data.class_id;

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

Siswa.create = (newUsers, result) => {
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

Siswa.update = (newUsers, result) => {
    console.log(newUsers);
    
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

Siswa.listSiswa = (fullName, school_id, major, clas, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.*, r.role_name, s.school_name, c.class_name, m.major_name  FROM users u, role r, school s, class c, major m WHERE u.role=r.id AND u.school_id=s.id AND u.class_id=c.id and u.major_id=m.id and u.role = '160'";

  if (fullName) {
    query += ` AND u.full_name like '%${fullName}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (major) {
    query += ` AND u.major_id = '${major}'`;
  }
  if (clas) {
    query += ` AND u.class_id = '${clas}'`;
  }
  if (status) {
    query += ` AND u.status = '${status}'`;
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
Siswa.delete = (uid, result) => {
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
Siswa.detailSiswa = async (uid, result) => {
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

module.exports = Siswa;

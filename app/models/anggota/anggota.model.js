const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Anggota = function (data) {
  console.log(data);

  this.uid = data.uid;
  this.company_id = data.company_id;
  this.nik = data.nik;
  this.member_id = data.member_id ? "KSP" + data.member_id : null;
  this.email = data.email;
  this.fullName = data.fullName;
  this.date_of_birth = data.dob || null;
  this.place_of_birth = data.place_of_birth || "";
  this.address = data.address;
  this.phone_number = data.phone_number;
  this.gender = data.gender || "";
  this.marital_status = data.marital_status || "";
  this.identity_type = data.identity_type || "";
  this.no_identity = data.no_identity || "";
  this.religion = data.religion || "";
  this.work = data.work || "";
  this.password = data.password || null;
  this.status = data.status || "";
  this.role = "4";
  this.created_at = data.created_at || new Date();
  this.created_by = data.created_by || null;
  this.updated_by = data.updated_by || null;
  this.updated_at = data.updated_at || null;
};

Anggota.create = (newUsers, result) => {
  console.log(newUsers);
  db.query("INSERT INTO users SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Anggota: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Anggota.update = (newUsers, result) => {
  if (newUsers.password) {
    bcrypt.hash(newUsers.password, 10, (err, hash) => {
      if (err) {
        console.error("Error hashing password: ", err);
        result(err, null);
        return;
      }
      newUsers.password = hash;

      // Update user with hashed password
      performUpdate(newUsers, result);
    });
  } else {
    // Update user without password change
    performUpdate(newUsers, result);
  }
};
Anggota.updateAnggotaAccept = (uid, result) => {
  db.query(
    "UPDATE users SET status = 'Active' WHERE uid = ?",
    [uid],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        // Not found User with the uid
        result({ kind: "not_found" }, null);
        return;
      }

      // Status updated successfully
      result(null, { uid: uid, status: 'Rejected' });
    }
  );
};
Anggota.updateAnggotaRejected = (uid, result) => {
  db.query(
    "UPDATE users SET status = 'Rejected' WHERE uid = ?",
    [uid],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        // Not found User with the uid
        result({ kind: "not_found" }, null);
        return;
      }

      // Status updated successfully
      result(null, { uid: uid, status: 'Rejected' });
    }
  );
};
const performUpdate = (newUsers, result) => {
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

Anggota.getAll = (fullName, company, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.id, u.company_id, u.uid, u.nik,  u.member_id, u.fullName, u.email, u.date_of_birth, u.address, u.phone_number, u.status, u.password, r.role_name as role FROM users u, role r WHERE u.role=r.id and r.role_name = 'Anggota' and u.status = 'Active'";

  if (fullName) {
    query += ` AND u.fullName like '%${fullName}%'`;
  }
  if (company != 1) {
    query += ` AND u.company_id = '${company}'`;
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

Anggota.listAnggotaVerification = (fullName, company, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.id, u.company_id, u.uid, u.nik,  u.member_id, u.fullName, u.email, u.date_of_birth, u.place_of_birth, u.religion, u.work, u.marital_status, u.no_identity, u.gender, u.identity_type, u.address, u.phone_number, u.status, u.password, u.created_at, r.role_name as role FROM users u, role r WHERE u.role=r.id and r.role_name = 'Anggota' and u.status IN('Verification', 'Rejected')";

  if (fullName) {
    query += ` AND u.fullName like '%${fullName}%'`;
  }
  if (company != 1) {
    query += ` AND u.company_id = '${company}'`;
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
Anggota.delete = (uid, result) => {
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

module.exports = Anggota;

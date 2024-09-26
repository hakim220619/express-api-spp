const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Aplikasi = function (data) {
  this.id = data.id;
  this.owner = data.owner;
  this.title = data.title;
  this.aplikasi_name = data.aplikasi_name;
  this.logo = data.logo;
  this.copy_right = data.copy_right;
  this.versi = data.versi;
  this.token_whatsapp = data.token_whatsapp;
  this.urlCreateTransaksiMidtrans = data.urlCreateTransaksiMidtrans;
  this.urlCekTransaksiMidtrans = data.urlCekTransaksiMidtrans;
  this.claientKey = data.claientKey;
  this.serverKey = data.serverKey;

  // Default values for timestamps
  this.created_at = data.created_at || new Date(); // Use the provided timestamp or default to now
  this.updated_at = data.updated_at || new Date(); // Use the provided updated time or default to now
};
Aplikasi.update = (newAplikasi, school, result) => {
  // console.log(school);

  // Update aplikasi
  db.query(
    "UPDATE aplikasi SET ? WHERE id = ?",
    [newAplikasi, newAplikasi.id],
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
      console.log("Updated Aplikasi: ", { id: newAplikasi.id, ...newAplikasi });

      // Update school setelah aplikasi berhasil diupdate
      db.query(
        "UPDATE school SET ? WHERE id = ?",
        [school, school.id],
        (err, res) => {
          if (err) {
            console.error("Error: ", err);
            result(err, null);
            return;
          }
          if (res.affectedRows == 0) {
            // Not found School with the id
            result({ kind: "not_found" }, null);
            return;
          }
          console.log("Updated School: ", { id: school.school_id, ...school });
          result(null, { id: newAplikasi.id, ...newAplikasi, school: { id: school.school_id, ...school } });
        }
      );
    }
  );
};


Aplikasi.listAplikasi = (aplikasi_name, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, a.*, s.school_name, s.address  FROM aplikasi a, school s WHERE a.school_id=s.id";

  if (aplikasi_name) {
    query += ` AND a.aplikasi_name like '%${aplikasi_name}%'`;
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

Aplikasi.detailAplikasi = async (uid, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, a.*, s.school_name, s.address, s.phone  FROM aplikasi a, school s WHERE a.school_id=s.id and a.id = '" +
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
Aplikasi.detailSettingAplikasi = async (school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, a.*, s.school_name, s.address, s.phone  FROM aplikasi a, school s WHERE a.school_id=s.id and a.school_id = '" +
    school_id +
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

module.exports = Aplikasi;

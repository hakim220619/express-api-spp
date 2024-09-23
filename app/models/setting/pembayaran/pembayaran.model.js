const db = require("../../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const SettingPembayaran = function (data) {
  this.uid = data.uid;
  this.school_id = data.school_id;
  this.sp_name = data.sp_name;
  this.sp_desc = data.sp_desc;
  this.years = data.years;
  this.sp_type = data.sp_type;
  this.sp_status = data.sp_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
  this.updated_at = data.updated_at || new Date(); // Use current date if not provided
};

SettingPembayaran.create = (newSettingPembayaran, result) => {
  db.query("INSERT INTO setting_payment SET ?", newSettingPembayaran, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created SettingPembayaran: ", { id: res.insertId, ...newSettingPembayaran });
    result(null, { id: res.insertId, ...newSettingPembayaran });
  });
};
SettingPembayaran.listSettingPembayaran = (sp_name, school_id, years, sp_type, sp_status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, sp.*  FROM setting_payment sp WHERE 1=1";

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (school_id) {
    query += ` AND sp.school_id = '${school_id}'`;
  }
  if (years) {
    query += ` AND sp.years = '${years}'`;
  }
  if (sp_type) {
    query += ` AND sp.sp_type = '${sp_type}'`;
  }
  if (sp_status) {
    query += ` AND sp.sp_status = '${sp_status}'`;
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
SettingPembayaran.delete = (uid, result) => {
  let query = `DELETE FROM setting_payment WHERE uid = '${uid}'`;
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
SettingPembayaran.detailSettingPembayaran = async (uid, result) => {
    let query =
      "SELECT * from setting_payment where uid = '" +
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

module.exports = SettingPembayaran;

const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Bulan = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.month_number = data.month_number;
  this.month_status = data.month_status || 'ON'; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Bulan.create = (newBulan, result) => {
    
  db.query("INSERT INTO month SET ?", newBulan, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Bulan: ", { id: res.insertId, ...newBulan });
    result(null, { id: res.insertId, ...newBulan });
  });
};

Bulan.update = (newBulan, result) => {
    console.log(newBulan);
  db.query(
    "UPDATE months SET ? WHERE id = ? and school_id = ?",
    [newBulan, newBulan.id, newBulan.school_id],
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
      console.log("Updated Bulan: ", { id: newBulan.id, ...newBulan });
      result(null, { id: newBulan.uid, ...newBulan });
    }
  );
};

Bulan.listBulan = (month, school_id, month_status, result) => {
    let query =
      "SELECT ROW_NUMBER() OVER () AS no, m.* FROM months m WHERE 1=1";
    
    if (month) {
      query += ` AND m.month LIKE '%${month}%'`;
    }
    if (school_id) {
      query += ` AND m.school_id = '${school_id}'`;
    }
    if (month_status) {
      query += ` AND m.month_status = '${month_status}'`;
    }
  
    // Add ORDER BY clause
    query += " ORDER BY m.month_number ASC";
  
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
  
Bulan.delete = (uid, result) => {
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
Bulan.detailBulan = async (uid, result) => {
  let query =
    "SELECT * from months where id = '" +
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

module.exports = Bulan;

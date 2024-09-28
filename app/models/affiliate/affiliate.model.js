const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Affiliate = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.major_name = data.major_name;
  this.major_status = data.major_status || 'ON'; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Affiliate.create = (newAffiliate, result) => {
    console.log(newAffiliate);
    
  db.query("INSERT INTO affiliate SET ?", newAffiliate, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Affiliate: ", { id: res.insertId, ...newAffiliate });
    result(null, { id: res.insertId, ...newAffiliate });
  });
};

Affiliate.update = (newAffiliate, result) => {
    console.log(newAffiliate);
    
  db.query(
    "UPDATE major SET ? WHERE id = ?",
    [newAffiliate, newAffiliate.id],
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
      console.log("Updated Affiliate: ", { id: newAffiliate.id, ...newAffiliate });
      result(null, { id: newAffiliate.uid, ...newAffiliate });
    }
  );
};

Affiliate.listAffiliate = (full_name, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, a.*, u.full_name, s.school_name  FROM affiliate a, users u, school s WHERE a.user_id=u.id and u.school_id=s.id";

  if (full_name) {
    query += ` AND m.full_name like '%${full_name}%'`;
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
Affiliate.delete = (uid, result) => {
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
Affiliate.detailAffiliate = async (uid, result) => {
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

module.exports = Affiliate;

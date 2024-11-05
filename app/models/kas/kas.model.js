const db = require("../../config/db.config");
// constructor
const Kas = function (data) {
  this.id = data.uid;
  this.unit_id = data.unit_id;
  this.school_id = data.school_id;
  this.class_name = data.class_name;
  this.class_desc = data.class_desc;
  this.class_status = data.class_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Kas.create = (newUsers, result) => {
  db.query("INSERT INTO kas SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Kas: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Kas.update = (newUsers, result) => {
  db.query(
    "UPDATE kas SET ? WHERE id = ?",
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

Kas.listKas = (deskripsi, school_id, type, result) => {
  let query =
    `SELECT ROW_NUMBER() OVER () AS no, k.*, u.full_name  FROM kas k, users u WHERE k.user_id=u.id`;

  if (deskripsi) {
    query += ` AND k.deskripsi like '%${deskripsi}%'`;
  }
  if (school_id) {
    query += ` AND k.school_id = '${school_id}'`;
  }
  if (type) {
    query += ` AND k.type = '${type}'`;
  }
  query += ` order by created_at desc`;


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
Kas.delete = (uid, result) => {
  let query = `DELETE FROM kas WHERE id = '${uid}'`;
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
Kas.detailKas = async (uid, result) => {
  let query =
    "SELECT * from kas where id = '" +
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

module.exports = Kas;

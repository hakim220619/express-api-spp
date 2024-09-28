const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Unit = function (data) {
  this.id = data.uid;
};

Unit.create = (newData, result) => {
    console.log(newData);
    
  db.query("INSERT INTO unit SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Unit: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

Unit.update = (newData, result) => {
    console.log(newData);
    
  db.query(
    "UPDATE unit SET ? WHERE id = ?",
    [newData, newData.id],
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
      console.log("Updated User: ", { id: newData.id, ...newData });
      result(null, { id: newData.uid, ...newData });
    }
  );
};

Unit.listUnit = (unit_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.*  FROM unit u WHERE 1=1";

  if (unit_name) {
    query += ` AND u.unit_name like '%${unit_name}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
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
Unit.delete = (uid, result) => {
  let query = `DELETE FROM unit WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted Unit with ID ${uid}`);
    result(null, res);
  });
};
Unit.detailUnit = async (uid, result) => {
  let query =
    "SELECT * from unit where id = '" +
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

module.exports = Unit;

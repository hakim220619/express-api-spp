const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Holiday = function (data) {
  this.id = data.uid;
};

Holiday.createHoliday = (newUsers, result) => {
  db.query("INSERT INTO holidays SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Holiday: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Holiday.update = (newUsers, result) => {
  db.query(
    "UPDATE holidays SET ? WHERE id = ?",
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

Holiday.listHoliday = (holiday_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, holidays.*  FROM holidays WHERE 1=1";

  if (holiday_name) {
    query += ` AND holiday_name like '%${holiday_name}%'`;
  }
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND status = '${status}'`;
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
Holiday.deleteHoliday = (id, result) => {
  let query = `DELETE FROM holidays WHERE id = '${id}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted user with ID ${id}`);
    result(null, res);
  });
};
Holiday.detailHoliday = async (uid, result) => {
  let query =
    "SELECT * from holidays where id = '" +
    uid +
    "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("holidays: ", res);
    result(null, res[0]);
  });
};

module.exports = Holiday;

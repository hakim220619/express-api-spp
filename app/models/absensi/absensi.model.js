const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Absensi = function (data) {
  this.id = data.uid;
};

Absensi.createAbsensi = (newUsers, result) => {
    console.log(newUsers);
    
  db.query("INSERT INTO attendance SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // console.log("created Absensi: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Absensi.update = (newUsers, result) => {
  db.query(
    "UPDATE class SET ? WHERE id = ?",
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

Absensi.listAbsensi = (unit_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, c.*, u.unit_name  FROM class c, unit u WHERE c.unit_id=u.id";

  if (unit_name) {
    query += ` AND u.unit_name like '%${unit_name}%'`;
  }
  if (school_id) {
    query += ` AND c.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND c.status = '${status}'`;
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

Absensi.listActivities = (activity_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, activities.* FROM activities where 1=1 ";

  if (activity_name) {
    query += ` AND activity_name like '%${activity_name}%'`;
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

Absensi.createActivities = (newData, result) => {
  db.query("INSERT INTO activities SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Absensi: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

Absensi.updateActivities = (newUsers, result) => {
  db.query(
    "UPDATE activities SET ? WHERE id = ?",
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

Absensi.deleteActivities = (uid, result) => {
  let query = `DELETE FROM activities WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted activities with ID ${uid}`);
    result(null, res);
  });
};


Absensi.detailActivities = async (id, result) => {
  let query = "SELECT * from activities where id = '" + id + "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Activities: ", res);
    result(null, res[0]);
  });
};

module.exports = Absensi;

const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Subjects = function (data) {
  this.id = data.uid;
};

Subjects.createsubjects = (newUsers, result) => {
  db.query("INSERT INTO subjects SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Subjects: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Subjects.updateSubjects = (newUsers, result) => {
  db.query(
    "UPDATE subjects SET ? WHERE id = ?",
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

Subjects.listSubjects = (subject_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, s.*, u.full_name, un.unit_name, c.class_name  FROM subjects s, users u, unit un, class c WHERE s.user_id=u.id AND s.unit_id=un.id AND s.class_id=c.id";

  if (subject_name) {
    query += ` AND s.subject_name like '%${subject_name}%'`;
  }
  if (school_id) {
    query += ` AND s.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND s.status = '${status}'`;
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
Subjects.deleteSubjects = (id, result) => {
  let query = `DELETE FROM subjects WHERE id = '${id}'`;
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
Subjects.detailSubjects = async (uid, result) => {
  let query =
    "SELECT * from subjects where id = '" +
    uid +
    "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Subjects: ", res);
    result(null, res[0]);
  });
};

module.exports = Subjects;

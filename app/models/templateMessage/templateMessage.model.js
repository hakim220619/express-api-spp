const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const TemplateMessage = function (data) {
  this.id = data.uid;
};

TemplateMessage.create = (newData, result) => {
  db.query("INSERT INTO template_message SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created TemplateMessage: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

TemplateMessage.update = (newUsers, result) => {
  db.query(
    "UPDATE template_message SET ? WHERE id = ?",
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

TemplateMessage.listTemplateMessage = (template_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, tm.* FROM template_message tm WHERE 1=1";

  if (template_name) {
    query += ` AND tm.template_name like '%${template_name}%'`;
  }
  if (school_id != 1) {
    query += ` AND tm.school_id = '${school_id}'`;
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
TemplateMessage.delete = (uid, result) => {
  let query = `DELETE FROM template_message WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted Data with ID ${uid}`);
    result(null, res);
  });
};
TemplateMessage.detailTemplateMessage = async (id, result) => {
  let query =
    "SELECT * from template_message where id = '" +
    id +
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

module.exports = TemplateMessage;

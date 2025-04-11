const db = require("../../config/db.config");
// constructor
const Menu = function (data) {
  this.class_status = data.class_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Menu.create = (newUsers, result) => {
  db.query("INSERT INTO menu_management SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Menu: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Menu.update = (newUsers, result) => {
  db.query(
    "UPDATE menu_management SET ? WHERE id = ?",
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

Menu.listMenu = (name, school_id, is_active, result) => {
  let query =
    `SELECT ROW_NUMBER() OVER () AS no, k.* FROM menu k where 1=1 `;

  if (name) {
    query += ` AND k.name like '%${name}%'`;
  }
  if (school_id) {
    query += ` AND k.school_id = '${school_id}'`;
  }
  if (is_active) {
    query += ` AND k.is_active = '${is_active}'`;
  }
  query += ` order by order_list asc`;


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
Menu.delete = (uid, result) => {
  let query = `DELETE FROM menu_management WHERE id = '${uid}'`;
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
Menu.detailMenu = async (uid, result) => {
  let query =
    "SELECT * from menu_management where id = '" +
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

module.exports = Menu;

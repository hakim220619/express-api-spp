const db = require("../../config/db.config");
// constructor
const Menu = function (data) {
  this.class_status = data.class_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};
Menu.create = (newData, result) => {
  // Check if a menu item with the same name and address already exists
  db.query("SELECT * FROM menu WHERE name = ? AND address = ?", [newData.name, newData.address], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // If a menu item with the same name and address already exists, respond with an error
    if (res.length > 0) {
      console.log("Menu item with the same name and address already exists.");
      result({ message: "Menu item with the same name and address already exists." }, null);
      return;
    }

    // If no duplicate found, proceed with the insertion
    db.query("INSERT INTO menu SET ?", newData, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      console.log("created Menu: ", { id: res.insertId, ...newData });
      result(null, { id: res.insertId, ...newData });
    });
  });
};

Menu.createMenuPermission = (newData, result) => {
  // Check if the record with the same school_id, menu_id, and role_id already exists
  db.query(
    "SELECT * FROM menu_permission WHERE school_id = ? AND menu_id = ? AND role_id = ?",
    [newData.school_id, newData.menu_id, newData.role_id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result({ message: "Error checking existing permissions." }, null);
        return;
      }

      // If record exists, return a response indicating it's a duplicate
      if (res.length > 0) {
        console.log("Duplicate entry found, not inserting.");
        result({ message: "Menu item with the same school_id, menu_id, and role_id already exists." }, null);
        return;
      }

      // If no existing record, proceed with the insert
      db.query("INSERT INTO menu_permission SET ?", newData, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result({ message: "Error inserting new permission." }, null);
          return;
        }

        console.log("created Menu: ", { id: res.insertId, ...newData });
        result(null, { id: res.insertId, ...newData });
      });
    }
  );
};



Menu.update = (newData, result) => {
  db.query(
    "UPDATE menu SET ? WHERE id = ?",
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

Menu.updateMenuPermission = (newData, result) => {
  db.query(
    "UPDATE menu_permission SET ? WHERE id = ?",
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

Menu.listMenu = (name, school_id, is_active, result) => {
  let query =
    `
SELECT ROW_NUMBER() OVER () AS no, 
       m.id, 
       mp.school_id, 
       m.parent_id, 
       m.name, 
       m.icon, 
       m.address, 
       m.order_list, 
       mp.role_id, 
       mp.created, 
       mp.updated, 
       mp.read, 
       mp.deleted, 
       mp.status  
FROM menu m
LEFT JOIN menu_permission mp ON m.id = mp.menu_id where 1=1 


    `;

  if (name) {
    query += ` AND m.name like '%${name}%'`;
  }
  if (school_id) {
    query += ` AND mp.school_id = '${school_id}'`;
  }
  if (is_active) {
    query += ` AND mp.status = '${is_active}'`;
  }
  query += ` order by m.order_list asc`;


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

Menu.listMenuPermission = (name, school_id, is_active, result) => {
  let query =
    `
SELECT ROW_NUMBER() OVER () AS no, 
      m.*, mn.name as menu_name, s.school_name, r.role_name
FROM menu_permission m, menu mn, school s, role r where m.menu_id=mn.id AND m.school_id=s.id AND m.role_id=r.id
    `;

  if (name) {
    query += ` AND mn.name like '%${name}%'`;
  }
  if (school_id) {
    query += ` AND m.school_id = '${school_id}'`;
  }
  if (is_active) {
    query += ` AND m.status = '${is_active}'`;
  }
  query += ` order by m.created_at asc`;


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
  let query = `DELETE FROM menu WHERE id = '${uid}'`;
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
Menu.deletePermission = (uid, result) => {
  let query = `DELETE FROM menu_permission WHERE id = '${uid}'`;
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
Menu.delete = (uid, result) => {
  let query = `DELETE FROM menu WHERE id = '${uid}'`;
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
    "SELECT * from menu where id = '" +
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

Menu.detailMenuPermission = async (uid, result) => {
  let query =
    "SELECT * from menu_permission where id = '" +
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

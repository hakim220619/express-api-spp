const db = require("../../config/db.config");
const fs = require('fs');
const path = require('path');
// constructor
const Cuti = function (data) {
  this.id = data.uid;
};

Cuti.createCuti = (newUsers, result) => {
  db.query("INSERT INTO cuti SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Cuti: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Cuti.updateCuti = (newUsers, result) => {
  db.query(
    "UPDATE cuti SET ? WHERE id = ?",
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

Cuti.listCuti = (unit_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, c.*, u.full_name, ct.cuti_name FROM cuti c, cuti_type ct, users u WHERE c.user_id=u.id AND c.cuti_type_id=ct.id";

  if (unit_name) {
    query += ` AND ct.cuti_name like '%${unit_name}%'`;
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


Cuti.detailCuti = async (id, result) => {
    let query = "SELECT ROW_NUMBER() OVER () AS no, c.*, u.full_name, ct.cuti_name FROM cuti c, cuti_type ct, users u WHERE c.user_id=u.id AND c.cuti_type_id=ct.id and c.id = '" + id + "'";
    db.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log("Cuti: ", res);
      result(null, res[0]);
    });
  };

Cuti.listjenisCuti = (unit_name, school_id, status, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, cuti_type.* FROM cuti_type WHERE 1=1";

  if (unit_name) {
    query += ` AND cuti_name like '%${unit_name}%'`;
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

Cuti.listActivities = (activity_name, school_id, status, result) => {
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

Cuti.createJenisCuti = (newData, result) => {
  db.query("INSERT INTO cuti_type SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Cuti: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

Cuti.updateJenisCuti = (newUsers, result) => {
  db.query(
    "UPDATE cuti_type SET ? WHERE id = ?",
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



Cuti.deleteCuti = (id, result) => {
  // Query untuk mengambil school_id dan nama gambar yang terkait dengan UID
  let selectQuery = `SELECT school_id, image FROM cuti WHERE id = '${id}'`;

  db.query(selectQuery, (err, res) => {
    if (err) {
      console.log("Error selecting data: ", err);
      result(err, null);
      return;
    }

    if (res.length === 0) {
      console.log("No record found with ID: ", id);
      result("No record found", null);
      return;
    }

    // Ambil school_id dan image dari hasil query
    const school_id = res[0].school_id;
    const image = res[0].image;
    
    // Path untuk gambar yang akan dihapus
    const imagePath = path.join('uploads', 'school', 'cuti', school_id.toString(), image);

    // Query untuk menghapus data dari database
    let deleteQuery = `DELETE FROM cuti WHERE id = '${id}'`;

    db.query(deleteQuery, (err, deleteRes) => {
      if (err) {
        console.log("Error deleting record: ", err);
        result(err, null);
        return;
      }

      // Cek jika file gambar ada dan menghapusnya
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting image: ", err);
        } else {
          console.log(`Deleted image: ${image}`);
        }
      });

      console.log(`Deleted activity with ID ${id}`);
      result(null, deleteRes);
    });
  });
};


Cuti.deleteJenisCuti = (uid, result) => {
  let query = `DELETE FROM cuti_type WHERE id = '${uid}'`;
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



Cuti.detailJenisCuti = async (id, result) => {
  let query = "SELECT * from cuti_type where id = '" + id + "'";
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

module.exports = Cuti;

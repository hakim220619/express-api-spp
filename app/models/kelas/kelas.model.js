const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Kelas = function (data) {
  this.id = data.uid;
  this.unit_id = data.unit_id;
  this.school_id = data.school_id;
  this.class_name = data.class_name;
  this.class_desc = data.class_desc;
  this.class_status = data.class_status || null; // Fallback to null if not provided
  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Kelas.create = (newUsers, result) => {
  db.query("INSERT INTO class SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Kelas: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Kelas.update = (newUsers, result) => {
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

Kelas.pindahKelasByUserId = (newData, result) => {

  const { unit_from, class_from, unit_to, class_to, students, updated_at } = newData;

  if (!students || !Array.isArray(students) || students.length === 0) {
    result({ kind: "no_students" }, null);
    return;
  }

  const promises = students.map((student) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET unit_id = ?, class_id = ?, updated_at = ? WHERE id = ?",
        [unit_to, class_to, updated_at, student.id],
        (err, res) => {
          if (err) {
            console.error("Error: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            // Not found User with the id
            reject({ kind: "not_found", id: student.id });
            return;
          }
          console.log("Updated User: ", { id: student.id, unit_to, class_to });
          resolve({ id: student.id, unit_to, class_to });
        }
      );
    });
  });

  Promise.allSettled(promises)
    .then((results) => {
      const successfulUpdates = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedUpdates = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (failedUpdates.length > 0) {
        console.error("Some updates failed: ", failedUpdates);
        result({ kind: "partial_failure", failedUpdates }, successfulUpdates);
        return;
      }

      console.log("All students updated successfully.", successfulUpdates);
      result(null, successfulUpdates);
    })
    .catch((error) => {
      console.error("Unexpected error: ", error);
      result(error, null);
    });
};

Kelas.lulusKembaliKelasByUserId = (newData, result) => {

  const { unit_from, status, unit_to, class_from, students, updated_at } = newData;

  if (!students || !Array.isArray(students) || students.length === 0) {
    result({ kind: "no_students" }, null);
    return;
  }

  const promises = students.map((student) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET unit_id = ?, class_id = ?, status = ?, updated_at = ? WHERE id = ?",
        [unit_from, class_from, status,  updated_at, student.id],
        (err, res) => {
          if (err) {
            console.error("Error: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            // Not found User with the id
            reject({ kind: "not_found", id: student.id });
            return;
          }
          console.log("Updated User: ", { id: student.id });
          resolve({ id: student.id });
        }
      );
    });
  });

  Promise.allSettled(promises)
    .then((results) => {
      const successfulUpdates = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedUpdates = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (failedUpdates.length > 0) {
        console.error("Some updates failed: ", failedUpdates);
        result({ kind: "partial_failure", failedUpdates }, successfulUpdates);
        return;
      }

      console.log("All students updated successfully.", successfulUpdates);
      result(null, successfulUpdates);
    })
    .catch((error) => {
      console.error("Unexpected error: ", error);
      result(error, null);
    });
};

Kelas.lulusKelasByUserId = (newData, result) => {
  console.log(newData);

  const { status, students, updated_at } = newData;

  if (!students || !Array.isArray(students) || students.length === 0) {
    result({ kind: "no_students" }, null);
    return;
  }

  const promises = students.map((student) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET  status = ?, updated_at = ? WHERE id = ?",
        [status, updated_at, student.id],
        (err, res) => {
          if (err) {
            console.error("Error: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            // Not found User with the id
            reject({ kind: "not_found", id: student.id });
            return;
          }
          console.log("Updated User: ", { id: student.id });
          resolve({ id: student.id });
        }
      );
    });
  });

  Promise.allSettled(promises)
    .then((results) => {
      const successfulUpdates = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedUpdates = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (failedUpdates.length > 0) {
        console.error("Some updates failed: ", failedUpdates);
        result({ kind: "partial_failure", failedUpdates }, successfulUpdates);
        return;
      }

      console.log("All students updated successfully.", successfulUpdates);
      result(null, successfulUpdates);
    })
    .catch((error) => {
      console.error("Unexpected error: ", error);
      result(error, null);
    });
};



Kelas.listKelas = (unit_name, school_id, status, result) => {
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

Kelas.listPindahKelas = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.id, u.full_name, c.class_name, c.id as class_id, u.status, un.unit_name, u.unit_id  FROM users u, class c, unit un WHERE u.class_id=c.id AND c.unit_id=un.id ";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
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
Kelas.delete = (uid, result) => {
  let query = `DELETE FROM class WHERE id = '${uid}'`;
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
Kelas.detailKelas = async (uid, result) => {
  let query =
    "SELECT * from class where id = '" +
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

module.exports = Kelas;

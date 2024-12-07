const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { format } = require('date-fns');
// constructor
const Absensi = function (data) {
  this.id = data.uid;
};


Absensi.createAbsensi = (newUsers, result) => {
  console.log("New Users Data:", newUsers);

  // Parse the user_id string into an actual array
  let userIds;
  try {
    userIds = JSON.parse(newUsers.user_id);
  } catch (error) {
    console.log("Error parsing user_id:", error);
    result(error, null);
    return;
  }

  // Get the current date in 'YYYY-MM-DD' format
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  // console.log("Current Date:", currentDate);

  // Loop through the userIds array and process attendance for each user
  userIds.forEach((userId) => {
    // Fetch user-specific status based on userId (assuming userId.status exists in user data)
    
    // Query to check if attendance already exists for the user on the current date
    const checkQuery = `
      SELECT * FROM attendance
      WHERE user_id = ? 
        AND activity_id = ? 
        AND type = ?
        AND DATE(created_at) = ?
    `;

    db.query(checkQuery, [userId.userId, newUsers.activity_id, newUsers.type, currentDate], (err, res) => {
      if (err) {
        console.error("Error checking attendance:", err);
        result(err, null);
        return;
      }

      // If attendance already exists, log and skip this user
      if (res.length > 0) {
        console.log(`Attendance already exists for user ${userId} on ${currentDate}. Skipping.`);
        return;
      }

      // Prepare the attendance data for insertion, use the dynamic userStatus
      const attendanceData = {
        school_id: newUsers.school_id,
        unit_id: newUsers.unit_id,
        user_id: userId.userId,
        activity_id: newUsers.activity_id,
        subject_id: newUsers.subject_id,
        type: newUsers.type,
        status: userId.status, // Use the user-specific status
        created_at: new Date(),
      };

      // Insert the new attendance record
      db.query("INSERT INTO attendance SET ?", attendanceData, (err, res) => {
        if (err) {
          console.error("Error inserting attendance:", err);
          result(err, null);
          return;
        }

        // Log successful insertion
        console.log("Created Absensi:", { id: res.insertId, ...attendanceData });
      });
    });
  });

  // Once all operations are complete, provide a success response
  console.log("Attendance creation process initiated for all users.");
  result(null, { message: "Attendance creation process started." });
};

module.exports = Absensi;




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
  let query = `SELECT 
    ROW_NUMBER() OVER () AS no, 
    a.*, 
    s.school_name, 
    u.unit_name, 
    us.full_name,
    ac.activity_name, 
    ss.subject_name
FROM 
    attendance a
JOIN
	users us ON a.user_id=us.id
JOIN 
    school s ON a.school_id = s.id
JOIN 
    unit u ON a.unit_id = u.id
LEFT JOIN 
    activities ac ON a.activity_id = ac.id
LEFT JOIN 
    subjects ss ON a.subject_id = ss.id
`;

  if (unit_name) {
    query += ` AND us.full_name like '%${unit_name}%'`;
  }
  if (school_id) {
    query += ` AND a.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND a.status = '${status}'`;
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


Absensi.listAbsensiKegiatanByUserId = (
  school_id,
  unit_id,
  class_id,
  activity_id,
  type,
  result
) => {
  let query = `
    SELECT 
      ROW_NUMBER() OVER () AS no, 
      u.id, 
      u.full_name, 
      un.unit_name, 
      c.class_name
    FROM 
      users u
    JOIN 
      unit un ON u.unit_id = un.id 
    JOIN 
      class c ON u.class_id = c.id
    WHERE 
      u.role = '160'
    AND NOT EXISTS (
      SELECT 1 
      FROM attendance a 
      WHERE a.user_id = u.id 
        AND a.school_id = u.school_id
        AND a.unit_id = u.unit_id
        AND a.activity_id = '${activity_id}'
        AND a.type = '${type}'
        AND DATE(a.created_at) = CURRENT_DATE
    )
  `;

  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (unit_id) {
    query += ` AND u.unit_id = '${unit_id}'`;
  }
  if (class_id) {
    query += ` AND u.class_id = '${class_id}'`;
  }

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Absensi.listAbsensiSubjectsByUserId = (
  school_id,
  unit_id,
  class_id,
  subject_id,
  type,
  result
) => {
  let query = `
    SELECT 
      ROW_NUMBER() OVER () AS no, 
      u.id, 
      u.full_name, 
      un.unit_name, 
      c.class_name
    FROM 
      users u
    JOIN 
      unit un ON u.unit_id = un.id 
    JOIN 
      class c ON u.class_id = c.id
    WHERE 
      u.role = '160'
    AND NOT EXISTS (
      SELECT 1 
      FROM attendance a 
      WHERE a.user_id = u.id 
        AND a.school_id = u.school_id
        AND a.unit_id = u.unit_id
        AND a.subject_id = '${subject_id}'
        AND a.type = '${type}'
        AND DATE(a.created_at) = CURRENT_DATE
    )
  `;

  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (unit_id) {
    query += ` AND u.unit_id = '${unit_id}'`;
  }
  if (class_id) {
    query += ` AND u.class_id = '${class_id}'`;
  }
console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
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

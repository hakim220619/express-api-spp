const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { format } = require("date-fns");
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
  const currentDate = format(new Date(), "yyyy-MM-dd");
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

    db.query(
      checkQuery,
      [userId.userId, newUsers.activity_id, newUsers.type, currentDate],
      (err, res) => {
        if (err) {
          console.error("Error checking attendance:", err);
          result(err, null);
          return;
        }

        // If attendance already exists, log and skip this user
        if (res.length > 0) {
          console.log(
            `Attendance already exists for user ${userId} on ${currentDate}. Skipping.`
          );
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
          console.log("Created Absensi:", {
            id: res.insertId,
            ...attendanceData,
          });
        });
      }
    );
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


Absensi.laporanAbsensiActivityByUserId = (
  full_name,
  school_id,
  unit_id,
  class_id,
  activity_id,
  selectedMonth,
  year,
  type,
  result
) => {
  // Mapping month names to their numeric equivalents
  const monthMapping = {
    'JANUARI': '01',
    'FEBRUARI': '02',
    'MARET': '03',
    'APRIL': '04',
    'MEI': '05',
    'JUNI': '06',
    'JULI': '07',
    'AGUSTUS': '08',
    'SEPTEMBER': '09',
    'OKTOBER': '10',
    'NOVEMBER': '11',
    'DESEMBER': '12'
  };

  // Convert selectedMonth from name to number
  const numericMonth = monthMapping[selectedMonth.toUpperCase()];

  let query = `
    SELECT
      ROW_NUMBER() OVER () AS no,
      u.id,
      u.full_name,
      un.unit_name,
      c.class_name,
      -- Dynamically adding columns for each day of the current month (1 to 31)
      MAX(CASE WHEN DAY(dt.date_column) = 1 THEN a.status ELSE NULL END) AS day_1,
      MAX(CASE WHEN DAY(dt.date_column) = 2 THEN a.status ELSE NULL END) AS day_2,
      MAX(CASE WHEN DAY(dt.date_column) = 3 THEN a.status ELSE NULL END) AS day_3,
      MAX(CASE WHEN DAY(dt.date_column) = 4 THEN a.status ELSE NULL END) AS day_4,
      MAX(CASE WHEN DAY(dt.date_column) = 5 THEN a.status ELSE NULL END) AS day_5,
      MAX(CASE WHEN DAY(dt.date_column) = 6 THEN a.status ELSE NULL END) AS day_6,
      MAX(CASE WHEN DAY(dt.date_column) = 7 THEN a.status ELSE NULL END) AS day_7,
      MAX(CASE WHEN DAY(dt.date_column) = 8 THEN a.status ELSE NULL END) AS day_8,
      MAX(CASE WHEN DAY(dt.date_column) = 9 THEN a.status ELSE NULL END) AS day_9,
      MAX(CASE WHEN DAY(dt.date_column) = 10 THEN a.status ELSE NULL END) AS day_10,
      MAX(CASE WHEN DAY(dt.date_column) = 11 THEN a.status ELSE NULL END) AS day_11,
      MAX(CASE WHEN DAY(dt.date_column) = 12 THEN a.status ELSE NULL END) AS day_12,
      MAX(CASE WHEN DAY(dt.date_column) = 13 THEN a.status ELSE NULL END) AS day_13,
      MAX(CASE WHEN DAY(dt.date_column) = 14 THEN a.status ELSE NULL END) AS day_14,
      MAX(CASE WHEN DAY(dt.date_column) = 15 THEN a.status ELSE NULL END) AS day_15,
      MAX(CASE WHEN DAY(dt.date_column) = 16 THEN a.status ELSE NULL END) AS day_16,
      MAX(CASE WHEN DAY(dt.date_column) = 17 THEN a.status ELSE NULL END) AS day_17,
      MAX(CASE WHEN DAY(dt.date_column) = 18 THEN a.status ELSE NULL END) AS day_18,
      MAX(CASE WHEN DAY(dt.date_column) = 19 THEN a.status ELSE NULL END) AS day_19,
      MAX(CASE WHEN DAY(dt.date_column) = 20 THEN a.status ELSE NULL END) AS day_20,
      MAX(CASE WHEN DAY(dt.date_column) = 21 THEN a.status ELSE NULL END) AS day_21,
      MAX(CASE WHEN DAY(dt.date_column) = 22 THEN a.status ELSE NULL END) AS day_22,
      MAX(CASE WHEN DAY(dt.date_column) = 23 THEN a.status ELSE NULL END) AS day_23,
      MAX(CASE WHEN DAY(dt.date_column) = 24 THEN a.status ELSE NULL END) AS day_24,
      MAX(CASE WHEN DAY(dt.date_column) = 25 THEN a.status ELSE NULL END) AS day_25,
      MAX(CASE WHEN DAY(dt.date_column) = 26 THEN a.status ELSE NULL END) AS day_26,
      MAX(CASE WHEN DAY(dt.date_column) = 27 THEN a.status ELSE NULL END) AS day_27,
      MAX(CASE WHEN DAY(dt.date_column) = 28 THEN a.status ELSE NULL END) AS day_28,
      MAX(CASE WHEN DAY(dt.date_column) = 29 THEN a.status ELSE NULL END) AS day_29,
      MAX(CASE WHEN DAY(dt.date_column) = 30 THEN a.status ELSE NULL END) AS day_30,
      MAX(CASE WHEN DAY(dt.date_column) = 31 THEN a.status ELSE NULL END) AS day_31
    FROM
      users u
    JOIN
      unit un ON u.unit_id = un.id
    JOIN
      class c ON u.class_id = c.id
    LEFT JOIN (
      SELECT 
        DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -31 DAY) AS date_column
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -30 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -29 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -28 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -27 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -26 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -25 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -24 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -23 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -22 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -21 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -20 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -19 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -18 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -17 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -16 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -15 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -14 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -13 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -12 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -11 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -10 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -9 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -8 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -7 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -6 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -5 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -4 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -3 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -2 DAY)
      UNION ALL
      SELECT LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')) AS date_column
    ) AS dt ON DAY(dt.date_column) BETWEEN 1 AND 31
    LEFT JOIN
      attendance a ON a.user_id = u.id 
      AND DATE(a.created_at) = DATE(dt.date_column)
      AND a.activity_id = '${activity_id}'  -- Filter by activity_id
    WHERE
      u.role = '160'
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
  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  query += ` GROUP BY
    u.id, u.full_name, un.unit_name, c.class_name`;

  // console.log(full_name);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Absensi.laporanAbsensiSubjectByUserId = (
  full_name,
  school_id,
  unit_id,
  class_id,
  subject_id,
  selectedMonth,
  year,
  type,
  result
) => {
  // Mapping month names to their numeric equivalents
  const monthMapping = {
    'JANUARI': '01',
    'FEBRUARI': '02',
    'MARET': '03',
    'APRIL': '04',
    'MEI': '05',
    'JUNI': '06',
    'JULI': '07',
    'AGUSTUS': '08',
    'SEPTEMBER': '09',
    'OKTOBER': '10',
    'NOVEMBER': '11',
    'DESEMBER': '12'
  };

  // Convert selectedMonth from name to number
  const numericMonth = monthMapping[selectedMonth.toUpperCase()];

  let query = `
    SELECT
      ROW_NUMBER() OVER () AS no,
      u.id,
      u.full_name,
      un.unit_name,
      c.class_name,
      -- Dynamically adding columns for each day of the current month (1 to 31)
      MAX(CASE WHEN DAY(dt.date_column) = 1 THEN a.status ELSE NULL END) AS day_1,
      MAX(CASE WHEN DAY(dt.date_column) = 2 THEN a.status ELSE NULL END) AS day_2,
      MAX(CASE WHEN DAY(dt.date_column) = 3 THEN a.status ELSE NULL END) AS day_3,
      MAX(CASE WHEN DAY(dt.date_column) = 4 THEN a.status ELSE NULL END) AS day_4,
      MAX(CASE WHEN DAY(dt.date_column) = 5 THEN a.status ELSE NULL END) AS day_5,
      MAX(CASE WHEN DAY(dt.date_column) = 6 THEN a.status ELSE NULL END) AS day_6,
      MAX(CASE WHEN DAY(dt.date_column) = 7 THEN a.status ELSE NULL END) AS day_7,
      MAX(CASE WHEN DAY(dt.date_column) = 8 THEN a.status ELSE NULL END) AS day_8,
      MAX(CASE WHEN DAY(dt.date_column) = 9 THEN a.status ELSE NULL END) AS day_9,
      MAX(CASE WHEN DAY(dt.date_column) = 10 THEN a.status ELSE NULL END) AS day_10,
      MAX(CASE WHEN DAY(dt.date_column) = 11 THEN a.status ELSE NULL END) AS day_11,
      MAX(CASE WHEN DAY(dt.date_column) = 12 THEN a.status ELSE NULL END) AS day_12,
      MAX(CASE WHEN DAY(dt.date_column) = 13 THEN a.status ELSE NULL END) AS day_13,
      MAX(CASE WHEN DAY(dt.date_column) = 14 THEN a.status ELSE NULL END) AS day_14,
      MAX(CASE WHEN DAY(dt.date_column) = 15 THEN a.status ELSE NULL END) AS day_15,
      MAX(CASE WHEN DAY(dt.date_column) = 16 THEN a.status ELSE NULL END) AS day_16,
      MAX(CASE WHEN DAY(dt.date_column) = 17 THEN a.status ELSE NULL END) AS day_17,
      MAX(CASE WHEN DAY(dt.date_column) = 18 THEN a.status ELSE NULL END) AS day_18,
      MAX(CASE WHEN DAY(dt.date_column) = 19 THEN a.status ELSE NULL END) AS day_19,
      MAX(CASE WHEN DAY(dt.date_column) = 20 THEN a.status ELSE NULL END) AS day_20,
      MAX(CASE WHEN DAY(dt.date_column) = 21 THEN a.status ELSE NULL END) AS day_21,
      MAX(CASE WHEN DAY(dt.date_column) = 22 THEN a.status ELSE NULL END) AS day_22,
      MAX(CASE WHEN DAY(dt.date_column) = 23 THEN a.status ELSE NULL END) AS day_23,
      MAX(CASE WHEN DAY(dt.date_column) = 24 THEN a.status ELSE NULL END) AS day_24,
      MAX(CASE WHEN DAY(dt.date_column) = 25 THEN a.status ELSE NULL END) AS day_25,
      MAX(CASE WHEN DAY(dt.date_column) = 26 THEN a.status ELSE NULL END) AS day_26,
      MAX(CASE WHEN DAY(dt.date_column) = 27 THEN a.status ELSE NULL END) AS day_27,
      MAX(CASE WHEN DAY(dt.date_column) = 28 THEN a.status ELSE NULL END) AS day_28,
      MAX(CASE WHEN DAY(dt.date_column) = 29 THEN a.status ELSE NULL END) AS day_29,
      MAX(CASE WHEN DAY(dt.date_column) = 30 THEN a.status ELSE NULL END) AS day_30,
      MAX(CASE WHEN DAY(dt.date_column) = 31 THEN a.status ELSE NULL END) AS day_31
    FROM
      users u
    JOIN
      unit un ON u.unit_id = un.id
    JOIN
      class c ON u.class_id = c.id
    LEFT JOIN (
      SELECT 
        DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -31 DAY) AS date_column
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -30 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -29 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -28 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -27 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -26 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -25 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -24 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -23 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -22 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -21 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -20 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -19 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -18 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -17 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -16 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -15 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -14 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -13 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -12 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -11 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -10 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -9 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -8 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -7 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -6 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -5 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -4 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -3 DAY)
      UNION ALL
      SELECT DATE_ADD(LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')), INTERVAL -2 DAY)
      UNION ALL
      SELECT LAST_DAY(STR_TO_DATE(CONCAT('01-', '${numericMonth}-${year}'), '%d-%m-%Y')) AS date_column
    ) AS dt ON DAY(dt.date_column) BETWEEN 1 AND 31
    LEFT JOIN
      attendance a ON a.user_id = u.id 
      AND DATE(a.created_at) = DATE(dt.date_column)
      AND a.subject_id = '${subject_id}'  -- Filter by activity_id
    WHERE
      u.role = '160'
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
  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  query += ` GROUP BY
    u.id, u.full_name, un.unit_name, c.class_name`;


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

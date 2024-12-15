const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { format } = require("date-fns");
// constructor
const Absensi = function (data) {
  this.id = data.uid;
};

Absensi.createAbsensiAktif = (newUsers, result) => {
  db.query("INSERT INTO setting_absensi SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
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



Absensi.updateAbsensi = (newUsers, result) => {
  console.log(newUsers);
  
  db.query(
    "UPDATE attendance SET ? WHERE id = ?",
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

Absensi.listAbsensi = (full_name, school_id, status, result) => {
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
    subjects ss ON a.subject_id = ss.id where 1=1 
`;

  if (full_name) {
    query += ` AND us.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND a.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND a.status = '${status}'`;
  }
query += ' ORDER BY a.created_at desc'

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

Absensi.listAbsensiAktif = (deskripsi, school_id, status, result) => {
  let query = `SELECT 
    ROW_NUMBER() OVER () AS no, 
    a.*, 
    s.school_name, 
    u.unit_name, 
    ac.activity_name, 
    ss.subject_name
FROM 
    setting_absensi a
JOIN 
    school s ON a.school_id = s.id
JOIN 
    unit u ON a.unit_id = u.id
LEFT JOIN 
    activities ac ON a.activity_id = ac.id
LEFT JOIN 
    subjects ss ON a.subject_id = ss.id where 1=1
`;

  if (deskripsi) {
    query += ` AND a.deskripsi like '%${deskripsi}%'`;
  }
  if (school_id) {
    query += ` AND a.school_id = '${school_id}'`;
  }
  if (status) {
    query += ` AND a.status = '${status}'`;
  }
// console.log(query);

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

Absensi.listAbsensiByUserId = (user_id, result) => {
  let query = `SELECT ac.activity_name, a.school_id, a.unit_id, a.user_id, a.activity_id, a.subject_id,  (a.created_at) as masuk,
       (SELECT ad.created_at 
        FROM attendance ad 
        WHERE ad.type = 'KELUAR' 
          AND ad.user_id = '${user_id}' 
          AND ad.activity_id = a.activity_id ) AS keluar 
FROM attendance a, activities ac
WHERE a.activity_id=ac.id
AND a.user_id = '${user_id}' 
  AND a.type = 'MASUK' 
  AND a.activity_id is NOT NULL
GROUP BY a.activity_id

UNION ALL

SELECT s.subject_name, a.school_id, a.unit_id, a.user_id, a.activity_id, a.subject_id, (a.created_at) as masuk,
       (SELECT ad.created_at 
        FROM attendance ad 
        WHERE ad.type = 'KELUAR' 
          AND ad.user_id = '${user_id}' 
          AND ad.subject_id = a.subject_id ) AS KELUAR 
FROM attendance a, subjects s
WHERE a.subject_id=s.id 
  AND	a.user_id = '${user_id}' 
  AND a.type = 'MASUK' 
  AND a.subject_id is NOT NULL
GROUP BY a.subject_id;


`;

  // if (deskripsi) {
  //   query += ` AND a.deskripsi like '%${deskripsi}%'`;
  // }
// console.log(query);

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
      MAX(CASE WHEN DAY(dt.date_column) = 1 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_1_M,
    MAX(CASE WHEN DAY(dt.date_column) = 1 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_1_K,
    MAX(CASE WHEN DAY(dt.date_column) = 2 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_2_M,
    MAX(CASE WHEN DAY(dt.date_column) = 2 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_2_K,
    MAX(CASE WHEN DAY(dt.date_column) = 3 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_3_M,
    MAX(CASE WHEN DAY(dt.date_column) = 3 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_3_K,
    MAX(CASE WHEN DAY(dt.date_column) = 4 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_4_M,
    MAX(CASE WHEN DAY(dt.date_column) = 4 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_4_K,
    MAX(CASE WHEN DAY(dt.date_column) = 5 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_5_M,
    MAX(CASE WHEN DAY(dt.date_column) = 5 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_5_K,
    MAX(CASE WHEN DAY(dt.date_column) = 6 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_6_M,
    MAX(CASE WHEN DAY(dt.date_column) = 6 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_6_K,
    MAX(CASE WHEN DAY(dt.date_column) = 7 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_7_M,
    MAX(CASE WHEN DAY(dt.date_column) = 7 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_7_K,
    MAX(CASE WHEN DAY(dt.date_column) = 8 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_8_M,
    MAX(CASE WHEN DAY(dt.date_column) = 8 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_8_K,
    MAX(CASE WHEN DAY(dt.date_column) = 9 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_9_M,
    MAX(CASE WHEN DAY(dt.date_column) = 9 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_9_K,
    MAX(CASE WHEN DAY(dt.date_column) = 10 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_10_M,
    MAX(CASE WHEN DAY(dt.date_column) = 10 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_10_K,
    MAX(CASE WHEN DAY(dt.date_column) = 11 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_11_M,
    MAX(CASE WHEN DAY(dt.date_column) = 11 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_11_K,
    MAX(CASE WHEN DAY(dt.date_column) = 12 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_12_M,
    MAX(CASE WHEN DAY(dt.date_column) = 12 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_12_K,
    MAX(CASE WHEN DAY(dt.date_column) = 13 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_13_M,
    MAX(CASE WHEN DAY(dt.date_column) = 13 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_13_K,
    MAX(CASE WHEN DAY(dt.date_column) = 14 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_14_M,
    MAX(CASE WHEN DAY(dt.date_column) = 14 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_14_K,
    MAX(CASE WHEN DAY(dt.date_column) = 15 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_15_M,
    MAX(CASE WHEN DAY(dt.date_column) = 15 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_15_K,
    MAX(CASE WHEN DAY(dt.date_column) = 16 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_16_M,
    MAX(CASE WHEN DAY(dt.date_column) = 16 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_16_K,
    MAX(CASE WHEN DAY(dt.date_column) = 17 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_17_M,
    MAX(CASE WHEN DAY(dt.date_column) = 17 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_17_K,
    MAX(CASE WHEN DAY(dt.date_column) = 18 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_18_M,
    MAX(CASE WHEN DAY(dt.date_column) = 18 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_18_K,
    MAX(CASE WHEN DAY(dt.date_column) = 19 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_19_M,
    MAX(CASE WHEN DAY(dt.date_column) = 19 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_19_K,
    MAX(CASE WHEN DAY(dt.date_column) = 20 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_20_M,
    MAX(CASE WHEN DAY(dt.date_column) = 20 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_20_K,
    MAX(CASE WHEN DAY(dt.date_column) = 21 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_21_M,
    MAX(CASE WHEN DAY(dt.date_column) = 21 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_21_K,
    MAX(CASE WHEN DAY(dt.date_column) = 22 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_22_M,
    MAX(CASE WHEN DAY(dt.date_column) = 22 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_22_K,
    MAX(CASE WHEN DAY(dt.date_column) = 23 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_23_M,
    MAX(CASE WHEN DAY(dt.date_column) = 23 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_23_K,
    MAX(CASE WHEN DAY(dt.date_column) = 24 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_24_M,
    MAX(CASE WHEN DAY(dt.date_column) = 24 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_24_K,
    MAX(CASE WHEN DAY(dt.date_column) = 25 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_25_M,
    MAX(CASE WHEN DAY(dt.date_column) = 25 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_25_K,
    MAX(CASE WHEN DAY(dt.date_column) = 26 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_26_M,
    MAX(CASE WHEN DAY(dt.date_column) = 26 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_26_K,
    MAX(CASE WHEN DAY(dt.date_column) = 27 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_27_M,
    MAX(CASE WHEN DAY(dt.date_column) = 27 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_27_K,
    MAX(CASE WHEN DAY(dt.date_column) = 28 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_28_M,
    MAX(CASE WHEN DAY(dt.date_column) = 28 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_28_K,
    MAX(CASE WHEN DAY(dt.date_column) = 29 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_29_M,
    MAX(CASE WHEN DAY(dt.date_column) = 29 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_29_K,
    MAX(CASE WHEN DAY(dt.date_column) = 30 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_30_M,
    MAX(CASE WHEN DAY(dt.date_column) = 30 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_30_K,
    MAX(CASE WHEN DAY(dt.date_column) = 31 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_31_M,
    MAX(CASE WHEN DAY(dt.date_column) = 31 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_31_K
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
      MAX(CASE WHEN DAY(dt.date_column) = 1 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_1_M,
    MAX(CASE WHEN DAY(dt.date_column) = 1 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_1_K,
    MAX(CASE WHEN DAY(dt.date_column) = 2 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_2_M,
    MAX(CASE WHEN DAY(dt.date_column) = 2 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_2_K,
    MAX(CASE WHEN DAY(dt.date_column) = 3 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_3_M,
    MAX(CASE WHEN DAY(dt.date_column) = 3 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_3_K,
    MAX(CASE WHEN DAY(dt.date_column) = 4 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_4_M,
    MAX(CASE WHEN DAY(dt.date_column) = 4 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_4_K,
    MAX(CASE WHEN DAY(dt.date_column) = 5 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_5_M,
    MAX(CASE WHEN DAY(dt.date_column) = 5 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_5_K,
    MAX(CASE WHEN DAY(dt.date_column) = 6 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_6_M,
    MAX(CASE WHEN DAY(dt.date_column) = 6 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_6_K,
    MAX(CASE WHEN DAY(dt.date_column) = 7 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_7_M,
    MAX(CASE WHEN DAY(dt.date_column) = 7 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_7_K,
    MAX(CASE WHEN DAY(dt.date_column) = 8 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_8_M,
    MAX(CASE WHEN DAY(dt.date_column) = 8 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_8_K,
    MAX(CASE WHEN DAY(dt.date_column) = 9 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_9_M,
    MAX(CASE WHEN DAY(dt.date_column) = 9 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_9_K,
    MAX(CASE WHEN DAY(dt.date_column) = 10 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_10_M,
    MAX(CASE WHEN DAY(dt.date_column) = 10 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_10_K,
    MAX(CASE WHEN DAY(dt.date_column) = 11 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_11_M,
    MAX(CASE WHEN DAY(dt.date_column) = 11 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_11_K,
    MAX(CASE WHEN DAY(dt.date_column) = 12 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_12_M,
    MAX(CASE WHEN DAY(dt.date_column) = 12 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_12_K,
    MAX(CASE WHEN DAY(dt.date_column) = 13 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_13_M,
    MAX(CASE WHEN DAY(dt.date_column) = 13 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_13_K,
    MAX(CASE WHEN DAY(dt.date_column) = 14 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_14_M,
    MAX(CASE WHEN DAY(dt.date_column) = 14 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_14_K,
    MAX(CASE WHEN DAY(dt.date_column) = 15 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_15_M,
    MAX(CASE WHEN DAY(dt.date_column) = 15 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_15_K,
    MAX(CASE WHEN DAY(dt.date_column) = 16 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_16_M,
    MAX(CASE WHEN DAY(dt.date_column) = 16 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_16_K,
    MAX(CASE WHEN DAY(dt.date_column) = 17 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_17_M,
    MAX(CASE WHEN DAY(dt.date_column) = 17 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_17_K,
    MAX(CASE WHEN DAY(dt.date_column) = 18 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_18_M,
    MAX(CASE WHEN DAY(dt.date_column) = 18 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_18_K,
    MAX(CASE WHEN DAY(dt.date_column) = 19 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_19_M,
    MAX(CASE WHEN DAY(dt.date_column) = 19 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_19_K,
    MAX(CASE WHEN DAY(dt.date_column) = 20 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_20_M,
    MAX(CASE WHEN DAY(dt.date_column) = 20 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_20_K,
    MAX(CASE WHEN DAY(dt.date_column) = 21 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_21_M,
    MAX(CASE WHEN DAY(dt.date_column) = 21 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_21_K,
    MAX(CASE WHEN DAY(dt.date_column) = 22 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_22_M,
    MAX(CASE WHEN DAY(dt.date_column) = 22 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_22_K,
    MAX(CASE WHEN DAY(dt.date_column) = 23 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_23_M,
    MAX(CASE WHEN DAY(dt.date_column) = 23 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_23_K,
    MAX(CASE WHEN DAY(dt.date_column) = 24 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_24_M,
    MAX(CASE WHEN DAY(dt.date_column) = 24 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_24_K,
    MAX(CASE WHEN DAY(dt.date_column) = 25 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_25_M,
    MAX(CASE WHEN DAY(dt.date_column) = 25 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_25_K,
    MAX(CASE WHEN DAY(dt.date_column) = 26 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_26_M,
    MAX(CASE WHEN DAY(dt.date_column) = 26 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_26_K,
    MAX(CASE WHEN DAY(dt.date_column) = 27 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_27_M,
    MAX(CASE WHEN DAY(dt.date_column) = 27 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_27_K,
    MAX(CASE WHEN DAY(dt.date_column) = 28 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_28_M,
    MAX(CASE WHEN DAY(dt.date_column) = 28 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_28_K,
    MAX(CASE WHEN DAY(dt.date_column) = 29 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_29_M,
    MAX(CASE WHEN DAY(dt.date_column) = 29 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_29_K,
    MAX(CASE WHEN DAY(dt.date_column) = 30 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_30_M,
    MAX(CASE WHEN DAY(dt.date_column) = 30 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_30_K,
    MAX(CASE WHEN DAY(dt.date_column) = 31 AND a.type = 'MASUK' THEN a.status ELSE NULL END) AS day_31_M,
    MAX(CASE WHEN DAY(dt.date_column) = 31 AND a.type = 'KELUAR' THEN a.status ELSE NULL END) AS day_31_K
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

    // console.log("created Absensi: ", { id: res.insertId, ...newData });
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
      // console.log("Updated User: ", { id: newUsers.id, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};

Absensi.deleteAbsensi = (uid, result) => {
  let query = `DELETE FROM attendance WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    // console.log(`Deleted activities with ID ${uid}`);
    result(null, res);
  });
};
Absensi.deleteActivities = (uid, result) => {
  let query = `DELETE FROM activities WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    // console.log(`Deleted activities with ID ${uid}`);
    result(null, res);
  });
};

Absensi.detailAbsensi = async (id, result) => {
  let query = "SELECT * from attendance where id = '" + id + "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("Activities: ", res);
    result(null, res[0]);
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

    // console.log("Activities: ", res);
    result(null, res[0]);
  });
};

module.exports = Absensi;

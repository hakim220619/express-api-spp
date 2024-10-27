const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Dashboard = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.user_id = data.user_id;
};

Dashboard.listPaymentByMonths = (sp_name, school_id, user_id, result) => {
  let query = `SELECT
    ROW_NUMBER() OVER () AS no,
    p.id,
    p.uid,
    p.user_id,
    p.school_id,
    p.setting_payment_uid,
    p.years,
    p.type,
    p.status,
    p.amount,
    u.full_name,
    c.class_name,
    m.major_name,
    sp.sp_name,
    ut.unit_name,
    p.unit_id,

    -- Aggregating amounts from the payment table
    SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) AS pending,
    SUM(CASE WHEN p.status = 'Verified' THEN p.amount ELSE 0 END) AS verified,
    SUM(CASE WHEN p.status = 'Paid' THEN p.amount ELSE 0 END) AS paid,

    -- Calculating status_lunas based on aggregated values in the payment table
    CASE
        WHEN SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) = 0
             AND SUM(CASE WHEN p.status = 'Verified' THEN p.amount ELSE 0 END) = 0 THEN 'Paid'
        WHEN SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) = 0 THEN 'Verified'
        ELSE 'Pending'
    END AS status_lunas,

    -- Subquery for detail_pending specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Pending' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Pending'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_pending,

    -- Subquery for detail_verified specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Verified'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_verified,

    -- Subquery for detail_paid specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Paid'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_paid,

    -- Adjusting status_lunas_detail based on the detail_paid and pending values
    CASE
        -- If detail_verified is not null, set status to 'Verified'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Verified'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) > 0 THEN 'Verified'

        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Pending' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Pending'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = 0
             AND COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                           FROM payment_detail pd
                           WHERE pd.user_id = p.user_id
                           AND pd.status = 'Verified'
                           AND pd.setting_payment_uid = p.setting_payment_uid
                           AND p.type = 'BEBAS'), 0) = 0
             AND COALESCE((SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
                           FROM payment_detail pd
                           WHERE pd.user_id = p.user_id
                           AND pd.status = 'Paid'
                           AND pd.setting_payment_uid = p.setting_payment_uid
                           AND p.type = 'BEBAS'), 0) = 0 THEN 'Pending'
        -- If detail_paid equals pending, set status to 'Paid'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Paid'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) THEN 'Paid'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Verified'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = 0 THEN 'Verified'
        ELSE 'Pending'
    END AS status_lunas_detail
FROM
    payment p
JOIN
    users u ON p.user_id = u.id
JOIN
    class c ON p.class_id = c.id
JOIN
    major m ON p.major_id = m.id
JOIN
    unit ut ON p.unit_id = ut.id
JOIN
    setting_payment sp ON p.setting_payment_uid = sp.uid `;

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }

  query += `GROUP BY p.setting_payment_uid ORDER BY p.type DESC`;

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

Dashboard.listPaymentByMonthsByAdmin = (
  sp_name,
  unit_id,
  school_id,
  user_id,
  result
) => {
  let query = `SELECT
    ROW_NUMBER() OVER () AS no,
    p.id,
    p.uid,
    p.user_id,
    p.school_id,
    p.setting_payment_uid,
    p.years,
    p.type,
    p.status,
    p.amount,
    u.full_name,
    c.class_name,
    m.major_name,
    sp.sp_name,
    ut.unit_name,
    p.unit_id,

    -- Aggregating amounts from the payment table
    SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) AS pending,
    SUM(CASE WHEN p.status = 'Verified' THEN p.amount ELSE 0 END) AS verified,
    SUM(CASE WHEN p.status = 'Paid' THEN p.amount ELSE 0 END) AS paid,

    -- Calculating status_lunas based on aggregated values in the payment table
    CASE
        WHEN SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) = 0
             AND SUM(CASE WHEN p.status = 'Verified' THEN p.amount ELSE 0 END) = 0 THEN 'Paid'
        WHEN SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) = 0 THEN 'Verified'
        ELSE 'Pending'
    END AS status_lunas,

    -- Subquery for detail_pending specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Pending' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Pending'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_pending,

    -- Subquery for detail_verified specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Verified'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_verified,

    -- Subquery for detail_paid specific to type 'BEBAS'
    (SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
     FROM payment_detail pd
     WHERE pd.user_id = p.user_id
     AND pd.status = 'Paid'
     AND pd.setting_payment_uid = p.setting_payment_uid
     AND p.type = 'BEBAS') AS detail_paid,

    -- Adjusting status_lunas_detail based on the detail_paid and pending values
    CASE
        -- If detail_verified is not null, set status to 'Verified'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Verified'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) > 0 THEN 'Verified'

        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Pending' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Pending'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = 0
             AND COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                           FROM payment_detail pd
                           WHERE pd.user_id = p.user_id
                           AND pd.status = 'Verified'
                           AND pd.setting_payment_uid = p.setting_payment_uid
                           AND p.type = 'BEBAS'), 0) = 0
             AND COALESCE((SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
                           FROM payment_detail pd
                           WHERE pd.user_id = p.user_id
                           AND pd.status = 'Paid'
                           AND pd.setting_payment_uid = p.setting_payment_uid
                           AND p.type = 'BEBAS'), 0) = 0 THEN 'Pending'
        -- If detail_paid equals pending, set status to 'Paid'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Paid' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Paid'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) THEN 'Paid'
        WHEN COALESCE((SELECT SUM(CASE WHEN pd.status = 'Verified' THEN pd.amount ELSE 0 END)
                       FROM payment_detail pd
                       WHERE pd.user_id = p.user_id
                       AND pd.status = 'Verified'
                       AND pd.setting_payment_uid = p.setting_payment_uid
                       AND p.type = 'BEBAS'), 0) = 0 THEN 'Verified'
        ELSE 'Pending'
    END AS status_lunas_detail
FROM
    payment p
JOIN
    users u ON p.user_id = u.id
JOIN
    class c ON p.class_id = c.id
JOIN
    major m ON p.major_id = m.id
JOIN
    unit ut ON p.unit_id = ut.id
JOIN
    setting_payment sp ON p.setting_payment_uid = sp.uid `;

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }
  if (unit_id) {
    query += ` AND p.unit_id = '${unit_id}'`;
  }

  query += `GROUP BY p.setting_payment_uid ORDER BY p.type DESC`;

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

Dashboard.getTotalPembayaranBulanan = async (schoolId, result) => {
  // Siapkan query dasar
  let query =
    `SELECT 
    SUM(amount) AS total_amount,
    school_id,
    IF(SUM(amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(updated_at) = MONTH(CURDATE()) AND YEAR(updated_at) = YEAR(CURDATE()) THEN amount ELSE 0 END) / SUM(amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(updated_at) = MONTH(CURDATE()) - 1 AND YEAR(updated_at) = YEAR(CURDATE()) THEN amount ELSE 0 END) / SUM(amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 hari sebelumnya
        COUNT(CASE WHEN DATE(updated_at) = CURDATE() THEN 1 ELSE NULL END)   -- Hari ini
    ) AS transactions_last_7_days
FROM 
    payment
WHERE 
    status = 'Paid'`;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += ` AND school_id = '${schoolId}'`;
  }

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalTunggakanBulananBySiswa = async (
  schoolId,
  user_id,
  result
) => {
  // Siapkan query dasar
  let query =
    "SELECT SUM(amount) as amount, school_id, user_id FROM payment WHERE status IN ('Pending', 'Verified') and type = 'BULANAN'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += ` AND school_id = '${schoolId}'`;
  }
  if (user_id) {
    query += ` AND user_id = '${user_id}'`;
  }
  console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res[0]);
  });
};
Dashboard.getTotalTunggakanFreeBySiswa = async (schoolId, user_id, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    pd.user_id,
    (  COALESCE((SELECT SUM(amount) FROM payment WHERE type='BEBAS' AND status='Pending' AND user_id = pd.user_id), 0) - SUM(pd.amount)) AS total_amount
FROM 
    payment_detail pd
WHERE 
    pd.status NOT IN ('Pending', 'Verified')`;

  if (user_id) {
    query += ` AND pd.user_id = '${user_id}'`;
  }
  query += `GROUP BY pd.user_id`;
  console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res[0]);
  });
};
Dashboard.getTotalPembayaranBebas = async (schoolId, result) => {
  // Siapkan query dasar
  let query =
    `SELECT 
    SUM(pd.amount) AS total_amount,
    p.school_id,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)   -- Hari ini
    ) AS transactions_last_7_days
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
WHERE 
    pd.status = 'Paid'`;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += " AND p.school_id = ?";
  }

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalPaymentThisDay = async (schoolId, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    SUM(pd.amount) AS amount,
    (SELECT SUM(pp.amount)
     FROM payment pp
     WHERE pp.status = 'Paid'
       AND pp.school_id = '${schoolId}'
       AND DATE(pp.updated_at) = CURDATE()) AS total_payment,
    p.school_id,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 day ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)                    -- Today
    ) AS transactions_last_7_days
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
WHERE 
    pd.status = 'Paid'
    AND DATE(pd.created_at) = CURDATE()
   
`;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += ` AND p.school_id = '${schoolId}'`;
  }
console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalPaymentThisWeek = async (schoolId, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    SUM(pd.amount) AS amount, 
    (SELECT SUM(pp.amount) 
     FROM payment pp 
     WHERE pp.status = 'Paid'
       AND pp.school_id = '${schoolId}' 
       AND YEARWEEK(pp.updated_at, 1) = YEARWEEK(CURDATE(), 1)) AS total_payment, 
    p.school_id,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 day ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)                    -- Today
    ) AS transactions_last_7_days
FROM 
    payment_detail pd 
JOIN 
    payment p ON pd.payment_id = p.uid 
WHERE 
    pd.status = 'Paid'
 `;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += `AND p.school_id = '${schoolId}' `;
  }
  query += `AND YEARWEEK(pd.created_at, 1) = YEARWEEK(CURDATE(), 1)`;
  // console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalPaymentThisMonth = async (schoolId, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    SUM(pd.amount) AS amount, 
    (SELECT SUM(pp.amount)  
     FROM payment pp  
     WHERE pp.status = 'Paid'    
       AND pp.school_id = '${schoolId}' 
       AND MONTH(pp.updated_at) = MONTH(CURDATE()) 
       AND YEAR(pp.updated_at) = YEAR(CURDATE())) AS total_payment, 
    p.school_id,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 day ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)                    -- Today
    ) AS transactions_last_7_days
FROM 
    payment_detail pd  
JOIN 
    payment p ON pd.payment_id = p.uid  
WHERE 
    pd.status = 'Paid' 
    AND MONTH(pd.created_at) = MONTH(CURDATE()) 
    AND YEAR(pd.created_at) = YEAR(CURDATE())
`;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += `AND p.school_id = '${schoolId}' `;
  }

  // console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalPaymentThisYears = async (schoolId, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    SUM(pd.amount) AS amount,
    (SELECT SUM(pp.amount)
     FROM payment pp
     WHERE pp.status = 'Paid'
       AND pp.school_id = '${schoolId}'
       AND YEAR(pp.updated_at) = YEAR(CURDATE())) AS total_payment,
    p.school_id,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 days ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 day ago
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)                    -- Today
    ) AS transactions_last_7_days
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
WHERE 
    pd.status = 'Paid'
    AND YEAR(pd.created_at) = YEAR(CURDATE())
`;

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += `AND p.school_id = '${schoolId}' `;
  }

  // console.log(query);

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
Dashboard.getTotalLoginMmLogs = async (schoolId, result) => {
  let query = `SELECT 
    CASE 
        WHEN TIME(created_at) < '12:00:00' THEN 'Sebelum 12 siang'
        WHEN TIME(created_at) > '12:00:00' THEN 'Sesudah 12 siang'
    END AS waktu,
    COUNT(*) AS total
FROM mm_logs
WHERE detail LIKE '%Login%'
`;

  if (schoolId) {
    query += `AND school_id = '${schoolId}' `;
  }
  query += `GROUP BY waktu`;

  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};
Dashboard.getTotalTunggakanBulanan = async (schoolId, result) => {
  let query =
   `SELECT 
    school_id,
    SUM(pd.amount) AS total_amount,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0, 
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)   -- Hari ini
    ) AS transactions_last_7_days
FROM 
    payment pd
WHERE 
    status IN ('Pending', 'Verified')`;
  if (schoolId) {
    query += ` AND pd.school_id = ${schoolId}`;
  }

  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};
Dashboard.getTotalTunggakanBebas = async (schoolId, result) => {
  let query = `SELECT 
    SUM(pd.amount) AS amount,
    p.school_id,
   IFNULL(
    (
        SELECT SUM(pp.amount) 
        FROM payment pp 
        WHERE pp.type = 'BEBAS' 
          AND pp.status = 'Pending' 
          AND pp.school_id = p.school_id
    ), 0
) AS total_payment,
    IF(SUM(pd.amount) = 0, 0,
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_this_month,
    IF(SUM(pd.amount) = 0, 0,
        ROUND(SUM(CASE WHEN MONTH(pd.created_at) = MONTH(CURDATE()) - 1 AND YEAR(pd.created_at) = YEAR(CURDATE()) THEN pd.amount ELSE 0 END) / SUM(pd.amount) * 100, 4)
    ) AS percent_last_month,
    JSON_ARRAY(
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 6 DAY THEN 1 ELSE NULL END),  -- 6 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 5 DAY THEN 1 ELSE NULL END),  -- 5 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 4 DAY THEN 1 ELSE NULL END),  -- 4 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 3 DAY THEN 1 ELSE NULL END),  -- 3 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 2 DAY THEN 1 ELSE NULL END),  -- 2 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE NULL END),  -- 1 hari sebelumnya
        COUNT(CASE WHEN DATE(pd.created_at) = CURDATE() THEN 1 ELSE NULL END)   -- Hari ini
    ) AS transactions_last_7_days
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
WHERE 
    pd.status = 'Paid'`;
  if (schoolId) {
    query += ` AND p.school_id = '${schoolId}'`;
  }
// console.log(query);

  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }
    
    result(null, res);
  });
};

Dashboard.getSaldoBySchool = async (schoolId, result) => {
  let query =
    "SELECT balance, id FROM school WHERE status = 'ON' AND id != '0'";

  if (schoolId) {
    query += " AND id = ?";
  }

  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    result(null, res[0]);
  });
};
Dashboard.getTransaksiAffiliateBySchool = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT COUNT(id) as total FROM payment_transactions WHERE 1=1 ";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += ` AND school_id = ${schoolId}`;
  }

  // Eksekusi query dengan atau tanpa parameter schoolId
  db.query(query, [schoolId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res[0]);
  });
};

module.exports = Dashboard;

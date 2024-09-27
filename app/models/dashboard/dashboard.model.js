const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Dashboard = function (data) {
  this.id = data.uid;
  this.school_id = data.school_id;
  this.user_id = data.user_id;
};


Dashboard.listPaymentByMonths = (sp_name, school_id, user_id, setting_payment_uid, result) => {
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
    setting_payment sp ON p.setting_payment_uid = sp.uid`;

  if (sp_name) {
    query += ` AND u.sp_name like '%${sp_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }

  query += `GROUP BY p.setting_payment_uid ORDER BY p.type DESC`;
  console.log(query);

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

module.exports = Dashboard;

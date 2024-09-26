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
    SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) AS pending,
    SUM(CASE WHEN p.status = 'Paid' THEN p.amount ELSE 0 END) AS paid,
    CASE 
        WHEN SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) = 0 THEN 'Pending' 
        ELSE 'Paid' 
    END AS status_lunas
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

module.exports = Dashboard;

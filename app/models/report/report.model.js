const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Report = function (data) {
  this.id = data.uid;
};

Report.listReport = (dataAll, result) => {
    console.log(dataAll.setting_payment_uid);
    
  let query =
    `SELECT ROW_NUMBER() OVER () AS no, p.id, p.unit_id, p.user_id, p.school_id, p.setting_payment_uid, p.years, p.type, p.amount, p.status, u.unit_name, p.month_id, m.month, sp.sp_name, us.full_name, s.school_name, s.address as school_address, 
c.class_name, mj.major_name, us.nisn, p.updated_at,
(select sum(af.amount) FROM affiliate af WHERE af.school_id = p.school_id) as affiliate,
(p.amount +  (select sum(af.amount) FROM affiliate af WHERE af.school_id = p.school_id)) as total_payment 
FROM payment p, school s, unit u, months m, users us, setting_payment sp, affiliate a, class c, major mj
WHERE p.school_id=s.id AND p.unit_id=u.id 
AND p.month_id=m.id 
AND p.setting_payment_uid=sp.uid 
and p.user_id=us.id 
AND p.school_id=a.school_id 
AND p.class_id=c.id
AND p.major_id=mj.id`;

  if (dataAll.user_id) {
    query += ` AND p.user_id like '%${dataAll.user_id}%'`;
  }
  if (dataAll.school_id) {
    query += ` AND p.school_id = '${dataAll.school_id}'`;
  }
  if (dataAll.user_id) {
    query += ` AND p.user_id = '${dataAll.user_id}'`;
  }
  if (dataAll.type) {
    query += ` AND p.type = '${dataAll.type}'`;
  }
  if (dataAll.years) {
    query += ` AND p.years = '${dataAll.years}'`;
  }
  if (dataAll.setting_payment_uid) {
    query += ` AND p.setting_payment_uid = '${dataAll.setting_payment_uid}'`;
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
Report.listReportFree = (dataAll, result) => {
    
  let query =
    `SELECT ROW_NUMBER() OVER () AS no, pd.*, p.unit_id, p.school_id, p.years, u.full_name, u.nisn, sp.sp_name, p.amount as amount_payment, ut.unit_name, s.school_name, c.class_name, m.major_name, s.address as school_address, (SELECT SUM(amount) as amount FROM affiliate WHERE school_id = u.school_id ) as affiliate
FROM payment_detail pd, payment p, users u, setting_payment sp, unit ut, school s, class c, major m
WHERE pd.payment_id=p.uid 
AND pd.user_id=u.id 
AND pd.setting_payment_uid=sp.uid 
AND p.unit_id=ut.id
AND p.school_id=s.id
AND p.class_id=c.id
AND p.major_id=m.id`;

  if (dataAll.user_id) {
    query += ` AND pd.user_id like '%${dataAll.user_id}%'`;
  }
  if (dataAll.school_id) {
    query += ` AND p.school_id = '${dataAll.school_id}'`;
  }
  if (dataAll.user_id) {
    query += ` AND pd.user_id = '${dataAll.user_id}'`;
  }
  if (dataAll.type) {
    query += ` AND pd.type = '${dataAll.type}'`;
  }
  if (dataAll.years) {
    query += ` AND p.years = '${dataAll.years}'`;
  }
  if (dataAll.setting_payment_uid) {
    query += ` AND pd.setting_payment_uid = '${dataAll.setting_payment_uid}'`;
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
Report.listReportDate = (dataAll, result) => {
    
  let query =
    `SELECT * FROM (
    SELECT 
    ROW_NUMBER() OVER () AS no, 
    p.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    p.setting_payment_uid, 
    p.years, 
    p.type, 
    p.amount, 
    p.status, 
    u.unit_name, 
    p.month_id, 
    m.month, 
    sp.sp_name, 
    us.full_name, 
    s.school_name, 
    s.address AS school_address, 
    c.class_name, 
    mj.major_name, 
    us.nisn, 
    (SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id) AS affiliate,
    (p.amount + COALESCE((SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id), 0)) AS total_payment,
    p.updated_at as date
FROM 
    payment p
JOIN 
    school s ON p.school_id = s.id 
JOIN 
    unit u ON p.unit_id = u.id 
JOIN 
    months m ON p.month_id = m.id 
JOIN 
    setting_payment sp ON p.setting_payment_uid = sp.uid 
JOIN 
    users us ON p.user_id = us.id 
LEFT JOIN 
    affiliate a ON p.school_id = a.school_id 
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major mj ON p.major_id = mj.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND DATE(p.updated_at) >= '${dataAll.date_first}' 
    AND DATE(p.updated_at) <= '${dataAll.date_last}'

UNION ALL

SELECT 
    ROW_NUMBER() OVER () AS no, 
    pd.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    pd.setting_payment_uid, 
    p.years, 
    pd.type, 
    pd.amount, 
    pd.status, 
    ut.unit_name, 
    p.month_id, 
    NULL AS month, 
    sp.sp_name, 
    u.full_name, 
    s.school_name, 
    s.address AS school_address,
    c.class_name, 
    m.major_name, 
    u.nisn, 
    NULL AS affiliate, 
    pd.amount AS total_payment,
    p.created_at as date
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
JOIN 
    users u ON pd.user_id = u.id 
JOIN 
    setting_payment sp ON pd.setting_payment_uid = sp.uid 
JOIN 
    unit ut ON p.unit_id = ut.id
JOIN 
    school s ON p.school_id = s.id
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major m ON p.major_id = m.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND DATE(pd.created_at) >= '${dataAll.date_first}' 
    AND DATE(pd.created_at) <= '${dataAll.date_last}'
    ) d WHERE full_name like '%${dataAll.full_name}%'
;
`;
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


Report.listReportClass = (dataAll, result) => {
    
  let query =
    `select * from (
    SELECT 
    ROW_NUMBER() OVER () AS no, 
    p.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    p.setting_payment_uid, 
    p.years, 
    p.type, 
    p.amount, 
    p.status, 
    u.unit_name, 
    p.month_id, 
    m.month, 
    sp.sp_name, 
    us.full_name, 
    s.school_name, 
    s.address AS school_address, 
    c.class_name, 
    mj.major_name, 
    us.nisn, 
    (SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id) AS affiliate,
    (p.amount + COALESCE((SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id), 0)) AS total_payment,
    p.updated_at as date
FROM 
    payment p
JOIN 
    school s ON p.school_id = s.id 
JOIN 
    unit u ON p.unit_id = u.id 
JOIN 
    months m ON p.month_id = m.id 
JOIN 
    setting_payment sp ON p.setting_payment_uid = sp.uid 
JOIN 
    users us ON p.user_id = us.id 
LEFT JOIN 
    affiliate a ON p.school_id = a.school_id 
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major mj ON p.major_id = mj.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND p.class_id = '${dataAll.class_id}'
UNION ALL

SELECT 
    ROW_NUMBER() OVER () AS no, 
    pd.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    pd.setting_payment_uid, 
    p.years, 
    pd.type, 
    pd.amount, 
    pd.status, 
    ut.unit_name, 
    p.month_id, 
    NULL AS month, 
    sp.sp_name, 
    u.full_name, 
    s.school_name, 
    s.address AS school_address,
    c.class_name, 
    m.major_name, 
    u.nisn, 
    NULL AS affiliate, 
    pd.amount AS total_payment,
    p.created_at as date
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
JOIN 
    users u ON pd.user_id = u.id 
JOIN 
    setting_payment sp ON pd.setting_payment_uid = sp.uid 
JOIN 
    unit ut ON p.unit_id = ut.id
JOIN 
    school s ON p.school_id = s.id
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major m ON p.major_id = m.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND p.class_id = '${dataAll.class_id}'
) d WHERE full_name like '%${dataAll.full_name}%'
`;
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

Report.listReportPaidorPending = (dataAll, result) => {
    
  let query =
    `select * from (
    SELECT 
    ROW_NUMBER() OVER () AS no, 
    p.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    p.setting_payment_uid, 
    p.years, 
    p.type, 
    p.amount, 
    p.status, 
    u.unit_name, 
    p.month_id, 
    m.month, 
    sp.sp_name, 
    us.full_name, 
    s.school_name, 
    s.address AS school_address, 
    c.class_name, 
    mj.major_name, 
    us.nisn, 
    (SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id) AS affiliate,
    (p.amount + COALESCE((SELECT SUM(af.amount) FROM affiliate af WHERE af.school_id = p.school_id), 0)) AS total_payment,
    p.updated_at as date
FROM 
    payment p
JOIN 
    school s ON p.school_id = s.id 
JOIN 
    unit u ON p.unit_id = u.id 
JOIN 
    months m ON p.month_id = m.id 
JOIN 
    setting_payment sp ON p.setting_payment_uid = sp.uid 
JOIN 
    users us ON p.user_id = us.id 
LEFT JOIN 
    affiliate a ON p.school_id = a.school_id 
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major mj ON p.major_id = mj.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND p.class_id = '${dataAll.class_id}'
UNION ALL

SELECT 
    ROW_NUMBER() OVER () AS no, 
    pd.id, 
    p.unit_id, 
    p.user_id, 
    p.school_id, 
    pd.setting_payment_uid, 
    p.years, 
    pd.type, 
    pd.amount, 
    pd.status, 
    ut.unit_name, 
    p.month_id, 
    NULL AS month, 
    sp.sp_name, 
    u.full_name, 
    s.school_name, 
    s.address AS school_address,
    c.class_name, 
    m.major_name, 
    u.nisn, 
    NULL AS affiliate, 
    pd.amount AS total_payment,
    p.created_at as date
FROM 
    payment_detail pd
JOIN 
    payment p ON pd.payment_id = p.uid
JOIN 
    users u ON pd.user_id = u.id 
JOIN 
    setting_payment sp ON pd.setting_payment_uid = sp.uid 
JOIN 
    unit ut ON p.unit_id = ut.id
JOIN 
    school s ON p.school_id = s.id
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major m ON p.major_id = m.id
WHERE 
    p.school_id = '${dataAll.school_id}'
    AND p.class_id = '${dataAll.class_id}'
) d WHERE full_name like '%${dataAll.full_name}%'
`;
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

module.exports = Report;

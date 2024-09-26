const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const Pembayaran = function (data) {
  this.user_id = data.user_id; // Generate UID if not provided
};
Pembayaran.listPembayaranPayByMonth = (
  month_name,
  school_id,
  user_id,
  id_payment,
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
    mt.month,
    mt.month_number
FROM 
    payment p
JOIN 
    users u ON p.user_id = u.id
JOIN 
    class c ON p.class_id = c.id
JOIN 
    major m ON p.major_id = m.id
JOIN 
    setting_payment sp ON p.setting_payment_uid = sp.uid
JOIN 
    months mt ON mt.id = p.month_id`;

  if (month_name) {
    query += ` AND u.month like '%${month_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }
  if (id_payment) {
    query += ` AND p.uid = '${id_payment}'`;
  }
  query += 'ORDER BY mt.month_number ASC'
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

module.exports = Pembayaran;

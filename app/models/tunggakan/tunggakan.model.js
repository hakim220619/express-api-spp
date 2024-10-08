const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { sendMessage, formatRupiah } = require("../../helpers/helper");
// constructor
const Tunggakan = function (data) {
  this.id = data.uid;
};

Tunggakan.listTunggakan = (dataAll, result) => {
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

  if (dataAll.sp_name) {
    query += ` AND sp.sp_name like '%${dataAll.sp_name}%'`;
  }
  if (dataAll.school_id) {
    query += ` AND p.school_id = '${dataAll.school_id}'`;
  }
  if (dataAll.user_id) {
    query += ` AND p.user_id = '${dataAll.user_id}'`;
  }
  if (dataAll.unit_id) {
    query += ` AND p.unit_id = '${dataAll.unit_id}'`;
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
Tunggakan.sendTunggakanSiswa = (dataAll, result) => {
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
    u.phone,
    c.class_name,
    m.major_name,
    sp.sp_name,
    ut.unit_name,
    p.unit_id,
    s.school_name,

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
    school s ON s.id = p.school_id
JOIN
    setting_payment sp ON p.setting_payment_uid = sp.uid `;

  if (dataAll.sp_name) {
    query += ` AND sp.sp_name like '%${dataAll.sp_name}%'`;
  }
  if (dataAll.school_id) {
    query += ` AND p.school_id = '${dataAll.school_id}'`;
  }
  if (dataAll.user_id) {
    query += ` AND p.user_id = '${dataAll.user_id}'`;
  }
  if (dataAll.unit_id) {
    query += ` AND p.unit_id = '${dataAll.unit_id}'`;
  }

  query += `GROUP BY p.setting_payment_uid ORDER BY p.type DESC`;
//   console.log(query);

db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
  
    let totalTunggakan = 0;  // Initialize totalTunggakan with let to accumulate the values
  
    // Loop through each row in the result set
    res.forEach(row => {
      totalTunggakan += row.pending - (row.detail_verified + row.detail_paid);  // Accumulate the value
    });
    db.query(
      `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
       FROM template_message tm, aplikasi a 
       WHERE tm.school_id=a.school_id 
       AND tm.deskripsi like '%sendTunggakanSiswa%'  
       AND tm.school_id = '${dataAll.school_id}'`,
      (err, queryRes) => {
        if (err) {
          console.error(
            "Error fetching template and WhatsApp details: ",
            err
          );
        } else {
          // Ambil url, token dan informasi pengirim dari query result
          const {
            urlWa: url,
            token_whatsapp: token,
            sender,
            message: template_message,
          } = queryRes[0];

          // Data yang ingin diganti dalam template_message
          const replacements = {
            nama_lengkap: res[0].full_name,
            kelas: res[0].class_name,
            total_pembayaran: formatRupiah(totalTunggakan),
            nama_sekolah: res[0].school_name,
          };

          // Fungsi untuk menggantikan setiap placeholder di template
          const formattedMessage = template_message.replace(
            /\$\{(\w+)\}/g,
            (_, key) => {
              return replacements[key] || "";
            }
          );

          console.log(formattedMessage);
          // Kirim pesan setelah semua pembayaran diperbarui
          sendMessage(url, token, res[0].phone, formattedMessage);
        }
      }
    );
    
    console.log('Total Tunggakan:', totalTunggakan);  // Log the total after processing all rows
  
    // Return the result after processing
    result(null, { res, totalTunggakan });  // Optionally return totalTunggakan with the result
  });
}  

module.exports = Tunggakan;

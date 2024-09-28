const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

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
    mt.month_number,
    u.email,
    u.nisn,
    u.phone,
    p.redirect_url,
    (select sum(af.amount) FROM affiliate af WHERE af.school_id = p.school_id) as affiliate,
    (p.amount +  (select sum(af.amount) FROM affiliate af WHERE af.school_id = p.school_id)) as total_payment
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
Pembayaran.listPembayaranPayByFree = (
  school_id,
  user_id,
  id_payment,
  setting_payment_uid,
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
    u.email,
    u.nisn,
    u.phone,
    p.redirect_url,
    sp.sp_name,
    (SELECT SUM(amount) as amount FROM affiliate WHERE school_id = p.school_id ) as affiliate
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

  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }
  if (id_payment) {
    query += ` AND p.uid = '${id_payment}'`;
  }
  if (setting_payment_uid) {
    query += ` AND p.setting_payment_uid = '${setting_payment_uid}'`;
  }
  console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("users: ", res);
    result(null, res[0]);
  });
};
Pembayaran.listPembayaranPayByFreeDetail = (
  sp_name,
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
    p.setting_payment_uid,
    p.type,
    p.status,
    p.amount,
    u.full_name,
    sp.sp_name,
    u.email,
    u.nisn,
    u.phone,
    p.redirect_url,
    p.metode_pembayaran,
    p.created_at,
    sp.sp_name,
    (SELECT SUM(amount) as amount FROM affiliate WHERE school_id = u.school_id ) as affiliate
FROM 
    payment_detail p
JOIN 
    users u ON p.user_id = u.id
JOIN 
    setting_payment sp ON p.setting_payment_uid = sp.uid`;

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }
  if (id_payment) {
    query += ` AND p.payment_id = '${id_payment}'`;
  }
  query += 'order by p.created_at asc'
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


Pembayaran.update = (newPayment, result) => {
  const { dataPayment } = newPayment; // Ekstrak dataPayment dari newPayment
  let completedUpdates = 0; // Untuk menghitung jumlah update yang sudah selesai
  let errors = []; // Untuk menyimpan error jika ada

  // Iterasi melalui setiap item dalam dataPayment
  dataPayment.forEach((paymentData) => {
    db.query(
      "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ?, updated_at = ? WHERE id = ?",
      [newPayment.order_id, 'Online', newPayment.redirect_url, 'Verified', new Date(),  paymentData.id],
      (err, res) => {
        if (err) {
          console.error("Error: ", err);
          errors.push({ id: paymentData.id, error: err });
        } else if (res.affectedRows == 0) {
          // Tidak ditemukan payment dengan id tersebut
          errors.push({ id: paymentData.id, error: "not_found" });
        } else {
          console.log("Updated Payment: ", { id: paymentData.id, ...paymentData });
        }

        // Periksa apakah semua update sudah selesai
        completedUpdates++;
        if (completedUpdates === dataPayment.length) {
          // Jika ada error, kembalikan error
          if (errors.length > 0) {
            result(errors, null);
          } else {
            result(null, { message: "All payments updated successfully" });
          }
        }
      }
    );
  });
};
Pembayaran.updateSuccess = (newPayment, result) => {
  const { dataPayment } = newPayment; // Ekstrak dataPayment dari newPayment
  let completedUpdates = 0; // Untuk menghitung jumlah update yang sudah selesai
  let errors = []; // Untuk menyimpan error jika ada

  // Iterasi melalui setiap item dalam dataPayment
  dataPayment.forEach((paymentData) => {
    db.query(
      "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ?, updated_at = ? WHERE id = ?",
      [newPayment.order_id, 'Online', newPayment.redirect_url, 'Paid', new Date(),  paymentData.id],
      (err, res) => {
        if (err) {
          console.error("Error: ", err);
          errors.push({ id: paymentData.id, error: err });
        } else if (res.affectedRows == 0) {
          // Tidak ditemukan payment dengan id tersebut
          errors.push({ id: paymentData.id, error: "not_found" });
        } else {
          console.log("Updated Payment: ", { id: paymentData.id, ...paymentData });
        }

        // Periksa apakah semua update sudah selesai
        completedUpdates++;
        if (completedUpdates === dataPayment.length) {
          // Jika ada error, kembalikan error
          if (errors.length > 0) {
            result(errors, null);
          } else {
            result(null, { message: "All payments updated successfully" });
          }
        }
      }
    );
  });
};

Pembayaran.updateFree = (newPayment, result) => {

  const data = newPayment.dataPayment
  const uid = `${uuidv4()}-${Date.now()}`;
  
  db.query(
    "INSERT INTO payment_detail (order_id, metode_pembayaran, redirect_url, status, created_at, uid, user_id, payment_id, setting_payment_uid, type, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      newPayment.order_id,           // order_id
      'Online',                      // metode_pembayaran
      newPayment.redirect_url,        // redirect_url
      'Verified',                    // status
      new Date(),                    // updated_at
      uid,                // new field uid
      data.user_id,            // new field user_id
      data.uid,         // new field payment_id
      data.setting_payment_uid,// new field setting_payment_uid
      data.type,               // new field type
      newPayment.total_amount            // new field amount
    ],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null); // Return error if there is one
      } else {
        console.log("Payment inserted successfully", { id: res.insertId, ...newPayment });
        result(null, { message: "Payment inserted successfully", id: res.insertId });
      }
    }
  );
};
Pembayaran.updateSuccessFree = (newPayment, result) => {

  const data = newPayment.dataPayment
  const uid = `${uuidv4()}-${Date.now()}`;
  
  db.query(
    "INSERT INTO payment_detail (order_id, metode_pembayaran, redirect_url, status, created_at, uid, user_id, payment_id, setting_payment_uid, type, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      newPayment.order_id,           // order_id
      'Online',                      // metode_pembayaran
      newPayment.redirect_url,        // redirect_url
      'Paid',                    // status
      new Date(),                    // updated_at
      uid,                // new field uid
      data.user_id,            // new field user_id
      data.uid,         // new field payment_id
      data.setting_payment_uid,// new field setting_payment_uid
      data.type,               // new field type
      newPayment.total_amount            // new field amount
    ],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null); // Return error if there is one
      } else {
        console.log("Payment inserted successfully", { id: res.insertId, ...newPayment });
        result(null, { message: "Payment inserted successfully", id: res.insertId });
      }
    }
  );
};



module.exports = Pembayaran;

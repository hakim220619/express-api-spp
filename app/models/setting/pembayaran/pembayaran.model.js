const db = require("../../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const SettingPembayaran = function (data) {
  this.user_id = data.user_id; // Generate UID if not provided
  this.uid = data.uid || `${uuidv4()}-${Date.now()}`; // Generate UID if not provided
  this.setting_payment_uid = data.setting_payment_uid || null; // Default to null if not provided
  this.school_id = data.school_id || null; // Default to null if not provided
  this.sp_name = data.sp_name ? data.sp_name.toUpperCase() : null; // Convert to uppercase if provided
  this.sp_desc = data.sp_desc ? data.sp_desc.toUpperCase() : null; // Convert to uppercase if provided
  this.years = data.years || null; // Default to null if not provided
  this.sp_type = data.sp_type || null; // Default to null if not provided
  this.amount = data.amount || null; // Default to null if not provided
  this.major_id = data.major_id || null; // Default to null if not provided
  this.class_id = data.class_id || null; // Default to null if not provided
  this.months = data.months || null; // Default to null if not provided
  this.sp_status = data.sp_status || null; // Default to null if not provided
  this.created_at = data.created_at || new Date(); // Use current date if not provided
  this.updated_at = data.updated_at || new Date(); // Use current date if not provided
};

SettingPembayaran.create = (newSettingPembayaran, result) => {
  const paymentData = {
    uid: newSettingPembayaran.uid,
    school_id: newSettingPembayaran.school_id,
    sp_name: newSettingPembayaran.sp_name?.toUpperCase() || null,
    sp_desc: newSettingPembayaran.sp_desc?.toUpperCase() || null,
    years: newSettingPembayaran.years || null,
    sp_type: newSettingPembayaran.sp_type || null,
    sp_status: newSettingPembayaran.sp_status || "ON",
    created_at: new Date(),
  };

  // Filter out undefined properties
  const insertData = {};
  Object.keys(paymentData).forEach((key) => {
    if (paymentData[key] !== undefined) {
      insertData[key] = paymentData[key];
    }
  });
  console.log(insertData);

  db.query("INSERT INTO setting_payment SET ?", insertData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...insertData });
  });
};

SettingPembayaran.createPaymentByMonth = (newSettingPembayaran, result) => {
  const query =
    "SELECT id, full_name, major_id, class_id FROM users WHERE major_id = ? AND class_id = ? AND school_id = ? AND role = '160'";

  db.query(
    query,
    [
      newSettingPembayaran.major_id,
      newSettingPembayaran.class_id,
      newSettingPembayaran.school_id,
    ],
    (err, users) => {
      if (err) {
        console.log("error fetching users: ", err);
        return result(err, null);
      }
      if (!users || users.length === 0) {
        return result({ message: "User tidak ada" }, null);
      }

      const monthsCount = newSettingPembayaran.months.length;
      const paymentQueries = [];

      users.forEach((user) => {
        for (let i = 0; i < monthsCount; i++) {
          const checkQuery =
            "SELECT id FROM payment WHERE user_id = ? AND school_id = ? AND setting_payment_uid = ? AND class_id = ? AND major_id = ?";
          db.query(
            checkQuery,
            [
              user.id,
              newSettingPembayaran.school_id,
              newSettingPembayaran.setting_payment_uid,
              newSettingPembayaran.class_id,
              newSettingPembayaran.major_id,
            ],
            (checkErr, existingPayments) => {
              if (checkErr) {
                console.log("error checking existing payment: ", checkErr);
                return result({ message: "error checking existing payment: ", checkErr}, null);
              }
              if (existingPayments.length === 0) {
                const paymentData = {
                  uid: newSettingPembayaran.uid,
                  setting_payment_uid: newSettingPembayaran.setting_payment_uid,
                  school_id: newSettingPembayaran.school_id,
                  user_id: user.id,
                  years: newSettingPembayaran.years,
                  type: newSettingPembayaran.sp_type,
                  major_id: newSettingPembayaran.major_id,
                  class_id: newSettingPembayaran.class_id,
                  status: "Pending",
                  created_at: newSettingPembayaran.created_at,
                  month_id: newSettingPembayaran.months[i].id,
                  amount: newSettingPembayaran.months[i].payment,
                };

                paymentQueries.push(
                  new Promise((resolve, reject) => {
                    db.query(
                      "INSERT INTO payment SET ?",
                      paymentData,
                      (insertErr, res) => {
                        if (insertErr) {
                          console.log("error inserting payment: ", insertErr);
                          reject(insertErr);
                        } else {
                          console.log("created payment: ", {
                            id: res.insertId,
                            ...paymentData,
                          });
                          resolve(res.insertId);
                        }
                      }
                    );
                  })
                );
              }
            }
          );
        }
      });

      Promise.all(paymentQueries)
        .then((insertIds) => {
          result(null, insertIds);
        })
        .catch((err) => {
          result(err, null);
        });
    }
  );
};
SettingPembayaran.createPaymentByStudent = (newSettingPembayaran, result) => {
  const query =
    "SELECT id, full_name, major_id, class_id FROM users WHERE id = ? AND major_id = ? AND class_id = ? AND school_id = ? AND role = '160'";

  db.query(
    query,
    [
      newSettingPembayaran.user_id,
      newSettingPembayaran.major_id,
      newSettingPembayaran.class_id,
      newSettingPembayaran.school_id,
    ],
    (err, users) => {
      if (err) {
        console.log("error fetching users: ", err);
        return result(err, null);
      }
      if (!users || users.length === 0) {
        return result({ message: "User tidak ada" }, null);
      }

      const monthsCount = newSettingPembayaran.months.length;
      const paymentQueries = [];

      users.forEach((user) => {
        for (let i = 0; i < monthsCount; i++) {
          const checkQuery =
            "SELECT id FROM payment WHERE user_id = ? AND school_id = ? AND setting_payment_uid = ? AND class_id = ? AND major_id = ?";
          db.query(
            checkQuery,
            [
              user.id,
              newSettingPembayaran.school_id,
              newSettingPembayaran.setting_payment_uid,
              newSettingPembayaran.class_id,
              newSettingPembayaran.major_id,
            ],
            (checkErr, existingPayments) => {
              if (checkErr) {
                console.log("error checking existing payment: ", checkErr);
                return result({ message: "error checking existing payment: ", checkErr }, null);
              }
              if (existingPayments.length === 0) {
                const paymentData = {
                  uid: newSettingPembayaran.uid,
                  setting_payment_uid: newSettingPembayaran.setting_payment_uid,
                  school_id: newSettingPembayaran.school_id,
                  user_id: user.id,  // Include user_id
                  years: newSettingPembayaran.years,
                  type: newSettingPembayaran.sp_type,
                  major_id: newSettingPembayaran.major_id,
                  class_id: newSettingPembayaran.class_id,
                  status: "Pending",
                  created_at: newSettingPembayaran.created_at,
                  month_id: newSettingPembayaran.months[i].id,
                  amount: newSettingPembayaran.months[i].payment,
                };

                paymentQueries.push(
                  new Promise((resolve, reject) => {
                    db.query(
                      "INSERT INTO payment SET ?",
                      paymentData,
                      (insertErr, res) => {
                        if (insertErr) {
                          console.log("error inserting payment: ", insertErr);
                          reject(insertErr);
                        } else {
                          console.log("created payment: ", {
                            id: res.insertId,
                            user_id: user.id,  // Include user_id in the result log
                            ...paymentData,
                          });
                          resolve({ id: res.insertId, user_id: user.id });  // Return user_id along with insertId
                        }
                      }
                    );
                  })
                );
              }
            }
          );
        }
      });

      Promise.all(paymentQueries)
        .then((insertIds) => {
          result(null, insertIds);
        })
        .catch((err) => {
          result(err, null);
        });
    }
  );
};


SettingPembayaran.listSettingPembayaran = (
  sp_name,
  school_id,
  years,
  sp_type,
  sp_status,
  result
) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, sp.*  FROM setting_payment sp WHERE 1=1";

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (school_id) {
    query += ` AND sp.school_id = '${school_id}'`;
  }
  if (years) {
    query += ` AND sp.years = '${years}'`;
  }
  if (sp_type) {
    query += ` AND sp.sp_type = '${sp_type}'`;
  }
  if (sp_status) {
    query += ` AND sp.sp_status = '${sp_status}'`;
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
SettingPembayaran.listSettingPembayaranDetail = (
  full_name,
  school_id,
  years,
  status,
  setting_payment_uid,
  result
) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, p.*, SUM(p.amount) as jumlah, u.full_name  FROM payment p, users u WHERE p.user_id=u.id AND p.status = 'Pending'";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (setting_payment_uid) {
    query += ` AND p.setting_payment_uid = '${setting_payment_uid}'`;
  }
  if (years) {
    query += ` AND p.years = '${years}'`;
  }
  if (status) {
    query += ` AND p.status = '${status}'`;
  }

  query += ` GROUP BY p.user_id, p.setting_payment_uid`;
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
SettingPembayaran.delete = (uid, result) => {
  let query = `DELETE FROM setting_payment WHERE uid = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted user with ID ${uid}`);
    result(null, res);
  });
};
SettingPembayaran.deleteDetail = (uid, setting_payment_uid, user_id, result) => {
  // Query untuk cek apakah ada status 'Paid' berdasarkan uid, setting_payment_uid, dan user_id
  let checkQuery = `
    SELECT COUNT(*) AS count 
    FROM payment 
    WHERE uid = '${uid}' 
    AND setting_payment_uid = '${setting_payment_uid}' 
    AND user_id = '${user_id}' 
    AND status != 'Pending'
  `;

  db.query(checkQuery, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result({
        success: false,
        message: "Terjadi kesalahan saat memeriksa status",
        error: err
      }, null);
      return;
    }

    if (res[0].count > 0) {
      // Jika ada data dengan status 'Paid'
      console.log(`Tidak bisa menghapus, ada pembayaran dengan status 'Paid'`);
      result({
        success: false,
        message: "Tidak bisa menghapus, ada pembayaran dengan status 'Paid'"
      }, null);
    } else {
      // Jika tidak ada data dengan status 'Paid', lakukan penghapusan
      let deleteQuery = `
        DELETE FROM payment 
        WHERE uid = '${uid}' 
        AND setting_payment_uid = '${setting_payment_uid}' 
        AND user_id = '${user_id}'
      `;
      db.query(deleteQuery, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result({
            success: false,
            message: "Terjadi kesalahan saat menghapus data",
            error: err
          }, null);
          return;
        }
        console.log(`Deleted payment with UID ${uid}, setting_payment_uid ${setting_payment_uid}, and user_id ${user_id}`);
        result(null, res);
      });
    }
  });
};



SettingPembayaran.detailSettingPembayaran = async (uid, result) => {
  let query = "SELECT * from setting_payment where uid = '" + uid + "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res[0]);
  });
};
SettingPembayaran.detailSettingPembayaran = async (uid, result) => {
  let query = "SELECT * from setting_payment where uid = '" + uid + "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res[0]);
  });
};
SettingPembayaran.detailSettingPembayaranByUid = async (uid, result) => {
  let query = "SELECT * from payment where uid = '" + uid + "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res[0]);
  });
};

module.exports = SettingPembayaran;

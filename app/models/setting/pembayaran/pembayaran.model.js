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

  db.query("INSERT INTO setting_payment SET ?", insertData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...insertData });
  });
};

SettingPembayaran.createPaymentByFree = (newSettingPembayaran, result) => {
  const query =
    "SELECT id, full_name, major_id, class_id FROM users WHERE unit_id = ? and major_id = ? AND class_id = ? AND school_id = ? AND role = '160'";

  db.query(
    query,
    [
      newSettingPembayaran.unit_id,
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

      const paymentQueries = [];

      users.forEach((user) => {
        const checkQuery =
          "SELECT id FROM payment WHERE unit_id = ? and user_id = ? AND school_id = ? AND setting_payment_uid = ? AND class_id = ? AND major_id = ?";
        db.query(
          checkQuery,
          [
            newSettingPembayaran.unit_id,
            user.id,
            newSettingPembayaran.school_id,
            newSettingPembayaran.setting_payment_uid,
            newSettingPembayaran.class_id,
            newSettingPembayaran.major_id,
          ],
          (checkErr, existingPayments) => {
            if (checkErr) {
              console.log("error checking existing payment: ", checkErr);
              return result(
                { message: "error checking existing payment: ", checkErr },
                null
              );
            }
            if (existingPayments.length === 0) {
              // Membuat UID unik dari kombinasi user.id, school_id, dan setting_payment_uid
              const uniqueUid = `${user.id}${newSettingPembayaran.school_id}${newSettingPembayaran.setting_payment_uid}`;

              const paymentData = {
                uid: uniqueUid, // Gunakan UID unik di sini
                setting_payment_uid: newSettingPembayaran.setting_payment_uid,
                unit_id: newSettingPembayaran.unit_id,
                school_id: newSettingPembayaran.school_id,
                user_id: user.id,
                years: newSettingPembayaran.years,
                type: newSettingPembayaran.sp_type,
                major_id: newSettingPembayaran.major_id,
                class_id: newSettingPembayaran.class_id,
                amount: newSettingPembayaran.amount,
                status: "Pending",
                created_at: newSettingPembayaran.created_at,
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

SettingPembayaran.createPaymentByMonth = (newSettingPembayaran, result) => {
  const monthsCount = newSettingPembayaran.months.length;
  console.log(monthsCount);

  // Menambahkan pengecekan jika jumlah bulan tidak sama dengan 12
  if (monthsCount !== 12) {
    return result({ message: "Jumlah bulan harus 12" }, null);
  }

  const query =
    "SELECT id, full_name, major_id, class_id, unit_id FROM users WHERE unit_id = ? and major_id = ? AND class_id = ? AND school_id = ? AND role = '160'";

  db.query(
    query,
    [
      newSettingPembayaran.unit_id,
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

      users.forEach((user) => {
        // Pengecekan pembayaran sebelum loop `for`
        const checkQuery =
          "SELECT id FROM payment WHERE unit_id = ? and user_id = ? AND school_id = ? AND setting_payment_uid = ? AND class_id = ? AND major_id = ?";
        db.query(
          checkQuery,
          [
            newSettingPembayaran.unit_id,
            user.id,
            newSettingPembayaran.school_id,
            newSettingPembayaran.setting_payment_uid,
            newSettingPembayaran.class_id,
            newSettingPembayaran.major_id,
          ],
          (checkErr, existingPayments) => {
            if (checkErr) {
              console.log("error checking existing payment: ", checkErr);
              return result(
                { message: "error checking existing payment: ", checkErr },
                null
              );
            }
            if (!existingPayments || existingPayments.length === 0) {
              for (let i = 0; i < monthsCount; i++) {
                const uniqueUid = `${user.id}${newSettingPembayaran.school_id}${newSettingPembayaran.setting_payment_uid}`; // Membuat UID dari kombinasi data
                const paymentData = {
                  unit_id: newSettingPembayaran.unit_id,
                  uid: uniqueUid,
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

                db.query("INSERT INTO payment SET ?", paymentData, (insertErr, res) => {
                  if (insertErr) {
                    console.log("error inserting payment: ", insertErr);
                    return result(insertErr, null);
                  } else {
                    console.log("created payment: ", { id: res.insertId, ...paymentData });
                  }
                });
              }
            }
          }
        );
      });

      result(null, { message: "Payments processed successfully" });
    }
  );
};


SettingPembayaran.createPaymentByStudent = (newSettingPembayaran, result) => {
  const query =
    "SELECT id, full_name, major_id, class_id FROM users WHERE unit_id = ? and id = ? AND major_id = ? AND class_id = ? AND school_id = ? AND role = '160'";

  db.query(
    query,
    [
      newSettingPembayaran.unit_id,
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

      // Tambahkan pengecekan jika monthsCount tidak sama dengan 12
      if (monthsCount !== 12) {
        return result(
          { message: "Jumlah bulan tidak valid. Harus 12 bulan." },
          null
        );
      }

      users.forEach((user) => {
        const checkQuery =
          "SELECT id FROM payment WHERE unit_id = ? and user_id = ? AND school_id = ? AND setting_payment_uid = ? AND class_id = ? AND major_id = ?";

        db.query(
          checkQuery,
          [
            newSettingPembayaran.unit_id,
            user.id,
            newSettingPembayaran.school_id,
            newSettingPembayaran.setting_payment_uid,
            newSettingPembayaran.class_id,
            newSettingPembayaran.major_id,
          ],
          (checkErr, existingPayments) => {
            if (checkErr) {
              console.log("error checking existing payment: ", checkErr);
              return result(
                { message: "error checking existing payment: ", checkErr },
                null
              );
            }

            if (existingPayments.length === 0) {
              // Loop untuk setiap bulan
              for (let i = 0; i < monthsCount; i++) {
                const paymentData = {
                  unit_id: newSettingPembayaran.unit_id,
                  uid: newSettingPembayaran.uid,
                  setting_payment_uid: newSettingPembayaran.setting_payment_uid,
                  school_id: newSettingPembayaran.school_id,
                  user_id: user.id, // Include user_id
                  years: newSettingPembayaran.years,
                  type: newSettingPembayaran.sp_type,
                  major_id: newSettingPembayaran.major_id,
                  class_id: newSettingPembayaran.class_id,
                  status: "Pending",
                  created_at: newSettingPembayaran.created_at,
                  month_id: newSettingPembayaran.months[i].id,
                  amount: newSettingPembayaran.months[i].payment,
                };

                db.query("INSERT INTO payment SET ?", paymentData, (insertErr, res) => {
                  if (insertErr) {
                    console.log("error inserting payment: ", insertErr);
                    return result(insertErr, null);
                  } else {
                    console.log("created payment: ", {
                      id: res.insertId,
                      user_id: user.id, // Include user_id in the result log
                      ...paymentData,
                    });
                  }
                });
              }
            }
          }
        );
      });

      result(null, { message: "Payments are being processed" });
    }
  );
};


SettingPembayaran.updateSettingPaymentByMonth = (
  newSettingPembayaran,
  result
) => {
  const monthsCount = newSettingPembayaran.months.length;
  const paymentQueries = [];

  // Loop through the months in the newSettingPembayaran object
  for (let i = 0; i < monthsCount; i++) {
    const updateQuery =
      "UPDATE payment SET amount = ? WHERE uid = ? AND setting_payment_uid = ? AND school_id = ? AND month_id = ?";

    paymentQueries.push(
      new Promise((resolve, reject) => {
        db.query(
          updateQuery,
          [
            newSettingPembayaran.months[i].payment, // Updated amount for the month
            newSettingPembayaran.uid, // Based on the uid
            newSettingPembayaran.setting_payment_uid, // Based on setting_payment_uid
            newSettingPembayaran.school_id, // Based on school_id
            newSettingPembayaran.months[i].id, // Based on month_id
          ],
          (updateErr, res) => {
            if (updateErr) {
              console.log("Error updating payment: ", updateErr);
              reject(updateErr);
            } else {
              console.log("Updated payment:", {
                uid: newSettingPembayaran.uid,
                amount: newSettingPembayaran.months[i].payment,
                month_id: newSettingPembayaran.months[i].id,
              });
              resolve({
                uid: newSettingPembayaran.uid,
                amount: newSettingPembayaran.months[i].payment,
                month_id: newSettingPembayaran.months[i].id,
              });
            }
          }
        );
      })
    );
  }

  // Use Promise.all to wait for all queries to complete
  Promise.all(paymentQueries)
    .then((results) => {
      result(null, results); // Return results if all promises resolve successfully
    })
    .catch((err) => {
      result(err, null); // Return error if any promise is rejected
    });
};
SettingPembayaran.updateSettingPaymentByFree = (
  newSettingPembayaran,
  result
) => {
  const updateQuery =
    "UPDATE payment SET amount = ? WHERE uid = ? AND setting_payment_uid = ? AND school_id = ?";

  // Buat promise untuk query update
  const updatePayment = new Promise((resolve, reject) => {
    db.query(
      updateQuery,
      [
        newSettingPembayaran.amount, // Jumlah yang diperbarui
        newSettingPembayaran.uid, // Berdasarkan uid
        newSettingPembayaran.setting_payment_uid, // Berdasarkan setting_payment_uid
        newSettingPembayaran.school_id, // Berdasarkan school_id
      ],
      (updateErr, res) => {
        if (updateErr) {
          console.error("Error updating payment: ", updateErr);
          return reject(updateErr); // Kembalikan reject promise jika terjadi error
        }

        console.log("Payment updated for UID:", newSettingPembayaran.uid);
        resolve({ uid: newSettingPembayaran.uid });
      }
    );
  });

  // Jalankan semua query dengan Promise.all
  Promise.all([updatePayment])
    .then((results) => {
      result(null, results); // Jika sukses, kembalikan hasilnya
    })
    .catch((err) => {
      result(err, null); // Jika ada error, kembalikan error
    });
};

SettingPembayaran.createPaymentByFreeStudent = (
  newSettingPembayaran,
  result
) => {
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

      const paymentQueries = [];

      users.forEach((user) => {
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
              return result(
                { message: "error checking existing payment: ", checkErr },
                null
              );
            }
            console.log(existingPayments.length);

            if (existingPayments.length === 0) {
              const paymentData = {
                unit_id: newSettingPembayaran.unit_id,
                uid: newSettingPembayaran.uid,
                setting_payment_uid: newSettingPembayaran.setting_payment_uid,
                school_id: newSettingPembayaran.school_id,
                user_id: user.id, // Include user_id
                years: newSettingPembayaran.years,
                type: newSettingPembayaran.sp_type,
                major_id: newSettingPembayaran.major_id,
                class_id: newSettingPembayaran.class_id,
                amount: newSettingPembayaran.amount,
                status: "Pending",
                created_at: newSettingPembayaran.created_at,
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
                          user_id: user.id, // Include user_id in the result log
                          ...paymentData,
                        });
                        resolve({ id: res.insertId, user_id: user.id }); // Return user_id along with insertId
                      }
                    }
                  );
                })
              );
            }
          }
        );
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
  unit_name,
  school_id,
  years,
  sp_type,
  unit_id,
  result
) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, sp.*, u.unit_name  FROM setting_payment sp, unit u WHERE sp.unit_id=u.id";

  if (unit_name) {
    query += ` AND u.unit_name like '%${unit_name}%'`;
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
  if (unit_id) {
    query += ` AND sp.unit_id = '${unit_id}'`;
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
SettingPembayaran.listSettingPembayaranDetail = (
  full_name,
  school_id,
  clas,
  major,
  setting_payment_uid,
  unit_id,
  result
) => {
  let query = `SELECT ROW_NUMBER() OVER () AS no, p.*, SUM(p.amount) as jumlah, u.full_name, c.class_name, m.major_name, ut.unit_name, COUNT(p.id) as total_pembayaran, 
        CASE 
        WHEN p.type = 'BEBAS' THEN 
            (SELECT SUM(pd.amount) 
             FROM payment_detail pd 
             WHERE pd.status IN ('Paid', 'Verified') 
               AND pd.user_id = p.user_id 
             AND pd.payment_id=p.uid
               AND pd.setting_payment_uid = p.setting_payment_uid)
        ELSE 0 
    END as jml_paydetail  FROM payment p, users u, class c, major m, unit ut WHERE p.user_id=u.id AND p.class_id=c.id AND p.major_id=m.id AND p.unit_id=ut.id AND p.status = 'Pending'`;

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND p.school_id = '${school_id}'`;
  }
  if (setting_payment_uid) {
    query += ` AND p.setting_payment_uid = '${setting_payment_uid}'`;
  }
  if (clas) {
    query += ` AND p.class_id = '${clas}'`;
  }
  if (major) {
    query += ` AND p.major_id = '${major}'`;
  }
  if (unit_id) {
    query += ` AND p.unit_id = '${unit_id}'`;
  }

  query += ` GROUP BY p.user_id, p.setting_payment_uid`;
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
SettingPembayaran.deleteDetail = (
  uid,
  setting_payment_uid,
  user_id,
  result
) => {
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
      result(
        {
          success: false,
          message: "Terjadi kesalahan saat memeriksa status",
          error: err,
        },
        null
      );
      return;
    }

    if (res[0].count > 0) {
      // Jika ada data dengan status 'Paid'
      console.log(`Tidak bisa menghapus, ada pembayaran dengan status 'Paid'`);
      result(
        {
          success: false,
          message: "Tidak bisa menghapus, ada pembayaran dengan status 'Paid'",
        },
        null
      );
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
          result(
            {
              success: false,
              message: "Terjadi kesalahan saat menghapus data",
              error: err,
            },
            null
          );
          return;
        }
        console.log(
          `Deleted payment with UID ${uid}, setting_payment_uid ${setting_payment_uid}, and user_id ${user_id}`
        );
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
  let query =
    "SELECT p.*, sp.sp_name, sp.sp_type, c.class_name, m.major_name, mm.month from payment p, setting_payment sp, class c, major m, months mm where p.setting_payment_uid=sp.uid AND p.class_id=c.id AND p.major_id=m.id AND p.month_id=mm.id and p.status = 'Pending' and p.uid = '" +
    uid +
    "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};
SettingPembayaran.detailSettingPembayaranByUidFree = async (uid, result) => {
  let query =
    "SELECT p.*, sp.sp_name, sp.sp_type, c.class_name, m.major_name from payment p, setting_payment sp, class c, major m where p.setting_payment_uid=sp.uid AND p.class_id=c.id AND p.major_id=m.id AND p.month_id IS NULL AND p.status = 'Pending' and p.uid = '" +
    uid +
    "'";
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

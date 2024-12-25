const db = require("../../config/db.config");
const axios = require("axios");
const crypto = require("crypto"); // Import crypto untuk membuat token yang aman

const {
  sendMessage,
  formatRupiah,
  insertMmLogs,
  insertKas,
} = require("../../helpers/helper");

const General = function (data) {};

General.findUsersByUid = async (uid, result) => {
  let query =
    "SELECT u.id, u.religion, u.work, u.member_id, u.company_id, c.company_name, u.uid, u.nik,  u.member_id, u.fullName, u.email, u.date_of_birth, u.address, u.phone_number, u.status, u.password, u.role, u.created_at, r.role_name, u.marital_status, u.place_of_birth, u.no_identity, u.gender, u.identity_type FROM users u, role r, company c WHERE u.role=r.id and u.company_id=c.id and u.uid = '" +
    uid +
    "'";

  //   console.log(uid);
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    //   console.log("users: ", res);
    result(null, res[0]);
  });
};
General.getstatus = async (result) => {
  let query = "SELECT * from status where active = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getSchool = async (result) => {
  let query = "SELECT * from school where status = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getAplikasiBySchool = async (school_id, result) => {
  let query = `SELECT * from aplikasi where school_id = '${school_id}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getUsersAffiliate = async (result) => {
  let query =
    "SELECT u.id, u.full_name, s.school_name, u.school_id from users u, school s where u.school_id=s.id AND u.role = '180'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getRole = async (result) => {
  let query = "SELECT * from role where role_status = 'ON'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getTypePayment = async (result) => {
  let query = "SELECT * from type_payment";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getUnit = async (result) => {
  let query = "SELECT * from unit";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getYears = async (result) => {
  let query = "SELECT * from years";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getListPayment = async (result) => {
  let query = "SELECT * from setting_payment";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};


General.getActivityBySchoolId = async (school_id, result) => {
  let query = "SELECT * from mm_logs where 1=1";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  query += `order by created_at desc`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};

General.getStatus = async (school_id, jenis, result) => {
  let query = "SELECT * from status where 1=1";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  if (jenis) {
    query += ` AND jenis = '${jenis}'`;
  }
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};

General.getTeacher = async (school_id, result) => {
  let query = "SELECT * from users where 1=1 ";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  query += `AND role = '240'`;
  query += `order by created_at desc`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};

General.getActivities = async (school_id, result) => {
  
  let query = "SELECT * from activities where 1=1 ";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
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
General.getSubjects = async (school_id, result) => {
  let query = "SELECT s.*, c.class_name from subjects s, class c where s.class_id=c.id ";
  if (school_id) {
    query += ` AND s.school_id = '${school_id}'`;
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


General.getListPpdbActive = async (school_id, result) => {
  let query =
    "SELECT sp.*, s.school_name, u.unit_name from setting_ppdb sp, school s, unit u where sp.school_id=s.id AND sp.unit_id=u.id ";
  if (school_id) {
    query += ` AND sp.school_id = '${school_id}'`;
  }
  query += `order by sp.created_at desc`;
  // console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("role: ", res);
    result(null, res);
  });
};
General.getDataAbsensiFromToken = async (token, result) => {
  let query = `
    SELECT sa.*, a.logo, s.address, a.owner, u.unit_name, ac.activity_name, 
           ac.start_time_in, ac.end_time_in, ac.start_time_out, ac.end_time_out
    FROM setting_absensi sa
    INNER JOIN aplikasi a ON sa.school_id = a.school_id
    INNER JOIN school s ON sa.school_id = s.id
    INNER JOIN unit u ON sa.unit_id = u.id
    INNER JOIN activities ac ON sa.activity_id = ac.id
  `;
  
  if (token) {
    query += ` WHERE sa.token = '${token}'`;
  }

  db.query(query, (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Check if the result is empty
    if (res.length === 0) {
      console.log("No data found, checking alternate query...");
      
      // Try the alternate query with subjects
      let fallbackQuery = `
        SELECT sa.*, a.logo, s.address, a.owner, u.unit_name, sb.subject_name, 
               sb.start_time_in, sb.end_time_in, sb.start_time_out, sb.end_time_out
        FROM setting_absensi sa
        INNER JOIN aplikasi a ON sa.school_id = a.school_id
        INNER JOIN school s ON sa.school_id = s.id
        INNER JOIN unit u ON sa.unit_id = u.id
        INNER JOIN subjects sb ON sa.subject_id = sb.id
        WHERE sa.token = '${token}'
      `;
      

      db.query(fallbackQuery, (err, res) => {
        if (err) {
          console.log("Error in fallback query: ", err);
          result(null, err);
          return;
        }
        
        // Return the result of the fallback query
        if (res.length === 0) {
          console.log("No data found in fallback query.");
        }
        result(null, res[0] );
      });
    } else {
      // If data found, return the result
      result(null, res[0]);
    }
  });
};



General.getListBalanceByUserId = async (school_id, user_id, result) => {
  let query =
    "select saldo from users where 1=1 ";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND id = '${user_id}'`;
  }
  // console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res[0]);
  });
};
General.getRiwayatToUpByUserId = async (school_id, user_id, result) => {
  let query =
    "select * from transactions where 1=1 ";
  if (school_id) {
    query += ` AND school_id = '${school_id}'`;
  }
  if (user_id) {
    query += ` AND user_id = '${user_id}'`;
  }
  // console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

General.forgetPassword = async (emailOrWhatsapp, result) => {
  if (!emailOrWhatsapp) {
    result(null, {
      message: "Invalid input: email or phone number is required",
    });
    return;
  }

  const Newtoken = crypto.randomBytes(60).toString("hex"); // 30 bytes menghasilkan 60 karakter hex
  const createdAt = new Date();

  // Jika input adalah nomor telepon dan dimulai dengan '08', ubah ke format internasional '62'
  if (!emailOrWhatsapp.includes("@") && emailOrWhatsapp.startsWith("08")) {
    emailOrWhatsapp = "62" + emailOrWhatsapp.slice(1);
  }

  // Query untuk memeriksa apakah email atau nomor telepon ada di tabel users
  let checkQuery;
  let checkValues;

  if (emailOrWhatsapp.includes("@")) {
    // Jika input adalah email
    checkQuery = `SELECT u.full_name, u.role, u.email, u.phone, u.school_id, s.school_name FROM users u, school s WHERE u.school_id=s.id and  u.email = ?`;
    checkValues = [emailOrWhatsapp];
  } else {
    // Jika input adalah nomor telepon
    checkQuery = `SELECT u.full_name, u.role, u.phone, u.school_id, s.school_name FROM users u, school s WHERE u.school_id=s.id and u.phone = ?`;
    checkValues = [emailOrWhatsapp];
  }

  // Mengeksekusi query untuk memeriksa apakah user ada
  db.query(checkQuery, checkValues, (checkErr, checkRes) => {
    if (checkErr) {
      console.log("Error checking user: ", checkErr);
      result({
        error: true,
        message: "Error checking user",
        details: checkErr,
      });
      return;
    }

    // Jika user tidak ditemukan
    if (checkRes.length === 0) {
      result({ error: true, message: "User not found" });
      return;
    }

    // Jika user ditemukan, lanjutkan untuk menyimpan token reset password
    let insertQuery;
    let values;

    if (emailOrWhatsapp.includes("@")) {
      insertQuery = `INSERT INTO password_reset_tokens (email, token, created_at) VALUES (?, ?, ?)`;
      values = [emailOrWhatsapp, Newtoken, createdAt];
    } else {
      insertQuery = `INSERT INTO password_reset_tokens (phone, token, created_at) VALUES (?, ?, ?)`;
      values = [emailOrWhatsapp, Newtoken, createdAt];
    }

    // Eksekusi query untuk menyimpan token
    db.query(insertQuery, values, (insertErr, insertRes) => {
      if (insertErr) {
        console.log("Error inserting token: ", insertErr);
        result(null, insertErr);
        return;
      }
      db.query(
        `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
             FROM template_message tm, aplikasi a 
             WHERE tm.school_id=a.school_id 
             AND tm.deskripsi like '%sendTokenForgotPassword%'  
             AND tm.school_id = '${checkRes[0].school_id}'`,
        (err, queryRes) => {
          if (err) {
            console.error(
              "Error fetching template and WhatsApp details: ",
              err
            );
          } else {
            console.log(checkRes[0].school_id);

            // Ambil url, token dan informasi pengirim dari query result
            const {
              urlWa: url,
              token_whatsapp: token,
              sender,
              message: template_message,
            } = queryRes[0];

            // Data yang ingin diganti dalam template_message
            let replacements = {
              nama_sekolah: checkRes[0].school_name,
              token: Newtoken,
              baseUrl:
                process.env.NODE_ENV === "production"
                  ? "https://ypphbanjarbaru.sppapp.com"
                  : "http://localhost:3001",
            };

            // Fungsi untuk menggantikan setiap placeholder di template
            const formattedMessage = template_message.replace(
              /\$\{(\w+)\}/g,
              (_, key) => replacements[key] || ""
            );

            // Output hasil format pesan untuk debugging
            // console.log(formattedMessage);

            // Mengirim pesan setelah semua data pembayaran diperbarui
            sendMessage(url, token, checkRes[0].phone, formattedMessage);
          }
        }
      );
      // Token berhasil disimpan
      result(null, { message: "Password reset token created", Newtoken });
    });
  });
};

const bcrypt = require("bcrypt"); // Jika ingin menggunakan bcrypt untuk enkripsi password

General.resetNewPassword = async (id, newPassword, result) => {
  try {
    // Query untuk memeriksa token dan mendapatkan email atau phone
    const tokenQuery =
      "SELECT email, phone FROM password_reset_tokens WHERE token = ?";

    // Mengeksekusi query untuk mendapatkan email/phone berdasarkan token
    db.query(tokenQuery, [id], (tokenErr, tokenRes) => {
      if (tokenErr) {
        console.log("Error: ", tokenErr);
        return result({
          error: true,
          message: "An error occurred",
          details: tokenErr,
        });
      }

      if (tokenRes.length === 0) {
        return result({ error: true, message: "Invalid or expired token" });
      }

      const { email, phone } = tokenRes[0];

      // Query untuk memeriksa apakah user dengan email atau phone ini ada
      const checkQuery = "SELECT * FROM users WHERE email = ? OR phone = ?";
      db.query(checkQuery, [email, phone], (checkErr, checkRes) => {
        if (checkErr) {
          console.log("Error: ", checkErr);
          return result({
            error: true,
            message: "An error occurred",
            details: checkErr,
          });
        }

        if (checkRes.length === 0) {
          return result({ error: true, message: "User not found" });
        }

        // Enkripsi password (opsional)
        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.log("Error: ", hashErr);
            return result({
              error: true,
              message: "An error occurred",
              details: hashErr,
            });
          }

          // Jika user ditemukan, reset password
          const updateQuery =
            "UPDATE users SET password = ? WHERE email = ? OR phone = ?";
          db.query(
            updateQuery,
            [hashedPassword, email, phone],
            (updateErr, updateRes) => {
              if (updateErr) {
                console.log("Error: ", updateErr);
                return result({
                  error: true,
                  message: "An error occurred",
                  details: updateErr,
                });
              }

              return result(null, {
                success: true,
                message: "Password reset successful",
              });
            }
          );
        });
      });
    });
  } catch (error) {
    console.log("Error: ", error);
    return result({
      error: true,
      message: "An error occurred",
      details: error,
    });
  }
};

General.newPasswordAll = async (id, newPassword, result) => {
  try {
    // Asumsikan `id` adalah user ID yang unik, jadi pertama kita dapatkan `email` atau `phone` berdasarkan `id`.
    const getUserQuery = "SELECT * FROM users WHERE uid = ?";
    db.query(getUserQuery, id, (getUserErr, getUserRes) => {
      if (getUserErr) {
        console.log("Error: ", getUserErr);
        return result({
          error: true,
          message: "An error occurred",
          details: getUserErr,
        });
      }

      if (getUserRes.length === 0) {
        return result({ error: true, message: "User not found" });
      }

      // Enkripsi password (opsional)
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.log("Error: ", hashErr);
          return result({
            error: true,
            message: "An error occurred while hashing password",
            details: hashErr,
          });
        }

        // Jika user ditemukan, reset password
        const updateQuery = "UPDATE users SET password = ? WHERE uid = ?";
        db.query(updateQuery, [hashedPassword, id], (updateErr, updateRes) => {
          if (updateErr) {
            console.log("Error: ", updateErr);
            return result({
              error: true,
              message: "An error occurred during password update",
              details: updateErr,
            });
          }

          return result(null, {
            success: true,
            message: "Password reset successful",
          });
        });
      });
    });
  } catch (err) {
    console.log("Unexpected error: ", err);
    return result({
      error: true,
      message: "An unexpected error occurred",
      details: err,
    });
  }
};

General.cekPin = async (user_id, school_id, pin, result) => {
  try {
    // Query untuk mengambil PIN yang sudah di-hash dari database
    const getUserQuery = "SELECT pin FROM users WHERE id = ? AND school_id = ?";
    db.query(getUserQuery, [user_id, school_id], async (getUserErr, getUserRes) => {
      if (getUserErr) {
        console.log("Error: ", getUserErr);
        return result({
          error: true,
          message: "An error occurred",
          details: getUserErr,
        });
      }

      // Jika user tidak ditemukan
      if (getUserRes.length === 0) {
        return result({ error: true, message: "User not found" });
      }

      // Ambil hash PIN dari database
      const storedHashPin = getUserRes[0].pin;

      // Verifikasi PIN yang dimasukkan dengan hash yang ada di database
      bcrypt.compare(pin, storedHashPin, (compareErr, isMatch) => {
        if (compareErr) {
          console.log("Error comparing PIN: ", compareErr);
          return result({
            error: true,
            message: "An error occurred while verifying the PIN",
            details: compareErr,
          });
        }

        if (!isMatch) {
          return result({ error: true, message: "Masukan PIN dengan benar!" });
        }

        // Jika PIN cocok, maka user berhasil diverifikasi
        return result(null, { error: false, message: "PIN is correct" });
      });
    });
  } catch (err) {
    console.log("Unexpected error: ", err);
    return result({
      error: true,
      message: "An unexpected error occurred",
      details: err,
    });
  }
};

General.newPin = async (user_id, school_id, pin, current_pin, result) => {
  try {
    // Query untuk mengecek apakah user sudah memiliki PIN yang terdaftar
    const checkUserPinQuery = "SELECT pin FROM users WHERE id = ? AND school_id = ?";
    db.query(checkUserPinQuery, [user_id, school_id], async (checkErr, checkRes) => {
      if (checkErr) {
        console.log("Error: ", checkErr);
        return result({
          error: true,
          message: "An error occurred while checking PIN",
          details: checkErr,
        });
      }

      // Jika user tidak ditemukan
      if (checkRes.length === 0) {
        return result({ error: true, message: "User not found" });
      }

      // Ambil PIN yang terdaftar di database
      const storedPin = checkRes[0].pin;

      // Cek apakah PIN saat ini sesuai dengan PIN yang terdaftar
      const isCurrentPinCorrect = await bcrypt.compare(current_pin, storedPin);
      if (!isCurrentPinCorrect) {
        return result({
          error: true,
          message: "Current PIN is incorrect. Please enter the correct PIN.",
        });
      }

      // Hash PIN baru yang dimasukkan
      const hashedPin = await bcrypt.hash(pin, 10);

      // Update PIN di database
      const updatePinQuery = "UPDATE users SET pin = ? WHERE id = ? AND school_id = ?";
      db.query(updatePinQuery, [hashedPin, user_id, school_id], (updateErr, updateRes) => {
        if (updateErr) {
          console.log("Error updating PIN: ", updateErr);
          return result({
            error: true,
            message: "An error occurred while updating the PIN",
            details: updateErr,
          });
        }

        // Jika update berhasil
        return result(null, {
          error: false,
          message: "PIN successfully updated",
        });
      });
    });
  } catch (err) {
    console.log("Unexpected error: ", err);
    return result({
      error: true,
      message: "An unexpected error occurred",
      details: err,
    });
  }
};
General.resetPin = async (user_id, school_id, result) => {
  try {
    // Query untuk mengecek apakah user sudah memiliki PIN yang terdaftar
    const checkUserPinQuery = "SELECT pin FROM users WHERE id = ? AND school_id = ?";
    db.query(checkUserPinQuery, [user_id, school_id], async (checkErr, checkRes) => {
      if (checkErr) {
        console.log("Error: ", checkErr);
        return result({
          error: true,
          message: "An error occurred while checking PIN",
          details: checkErr,
        });
      }

      // Jika user tidak ditemukan
      if (checkRes.length === 0) {
        return result({ error: true, message: "User not found" });
      }

      // Menggunakan PIN default "123456"
      const defaultPin = "123456";

      // Hash PIN default "123456"
      const hashedPin = await bcrypt.hash(defaultPin, 10);

      // Update PIN di database
      const updatePinQuery = "UPDATE users SET pin = ? WHERE id = ? AND school_id = ?";
      db.query(updatePinQuery, [hashedPin, user_id, school_id], (updateErr, updateRes) => {
        if (updateErr) {
          console.log("Error updating PIN: ", updateErr);
          return result({
            error: true,
            message: "An error occurred while updating the PIN",
            details: updateErr,
          });
        }

        // Jika update berhasil
        return result(null, {
          error: false,
          message: "PIN successfully updated to default '123456'",
        });
      });
    });
  } catch (err) {
    console.log("Unexpected error: ", err);
    return result({
      error: true,
      message: "An unexpected error occurred",
      details: err,
    });
  }
};







General.sendMessages = async (message, phone, school_id) => {
  try {
    let failedMessages = [];
    let successMessages = [];

    const query = `
      SELECT a.urlWa, a.token_whatsapp, a.sender 
      FROM aplikasi a 
      WHERE a.school_id = '${school_id}'`;

    const queryRes = await new Promise((resolve, reject) => {
      db.query(query, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    if (queryRes && queryRes.length > 0) {
      const { urlWa: url, token_whatsapp: token, sender } = queryRes[0];

      try {
        await sendMessage(url, token, phone, message);

        console.log(`Pesan berhasil dikirim ke: ${phone}, Message: ${message}`);

        const logData = {
          school_id: school_id,
          user_id: 1,
          activity: "sendMessageBroadcast",
          detail: `Pesan berhasil dikirim ke: ${phone}, Message: ${message}`,
          action: "Insert",
          status: 1,
        };

        insertMmLogs(logData);
        successMessages.push(phone);
      } catch (sendError) {
        console.error(
          `Gagal mengirim pesan ke: ${phone}, Error: ${sendError.message}`
        );

        const logData = {
          school_id: school_id,
          user_id: 1,
          activity: "sendMessageTagihan",
          detail: `Gagal mengirim pesan ke: ${phone}, Error: ${sendError.message}`,
          action: "Insert",
          status: 2,
        };

        insertMmLogs(logData);
        failedMessages.push(phone);
      }
    } else {
      console.error(
        "Tidak ada template pesan atau data WhatsApp yang ditemukan."
      );
      failedMessages.push(phone);
    }

    return {
      status: failedMessages.length > 0 ? "failed" : "success",
      message:
        failedMessages.length > 0
          ? "Beberapa pesan gagal dikirim."
          : "Semua pesan berhasil terkirim!",
      failed: failedMessages,
      success: successMessages,
    };
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengirim pesan.",
      error: err.message,
    };
  }
};

General.sendMessageBroadcast = async (
  dataUsers,
  message,
  school_id,
  result
) => {
  try {
    let failedMessages = [];
    let successMessages = [];

    for (const user of dataUsers) {
      try {
        // Asumsikan sendMessage adalah fungsi async untuk mengirim pesan
        const query = `
          SELECT a.urlWa, a.token_whatsapp, a.sender 
          FROM aplikasi a 
          WHERE a.school_id = '${school_id}'`;

        // Query ke database
        const queryRes = await new Promise((resolve, reject) => {
          db.query(query, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });

        if (queryRes && queryRes.length > 0) {
          // Ambil url, token, dan informasi pengirim dari query result
          const { urlWa: url, token_whatsapp: token, sender } = queryRes[0];                                                            

          // Mengirim pesan setelah semua data pembayaran diperbarui
          try {
            await sendMessage(url, token, user.phone, message); // await untuk memastikan error ditangkap

            console.log(
              `Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`
            );

            const logData = {
              school_id: school_id,
              user_id: user.id,
              activity: "sendMessageBroadcast",
              detail: `Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`,
              action: "Insert",
              status: 1,
            };

            // Insert log into mm_logs
            insertMmLogs(logData);
            successMessages.push(user.phone); // Menyimpan pesan yang berhasil
          } catch (sendError) {
            console.error(
              `Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`
            );

            const logData = {
              school_id: school_id,
              user_id: user.id,
              activity: "sendMessageBroadcast",
              detail: `Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`,
              action: "Insert",
              status: 2,
            };

            // Insert log into mm_logs
            insertMmLogs(logData);
            failedMessages.push(user.phone); // Menyimpan pesan yang gagal
          }
        } else {
          console.error(
            "Tidak ada template pesan atau data WhatsApp yang ditemukan."
          );
          failedMessages.push(user.phone); // Menyimpan pesan yang gagal
        }
      } catch (error) {
        console.error(
          `Error saat memproses user ${user.phone}: ${error.message}`
        );

        const logData = {
          school_id: school_id,
          user_id: user.id,
          activity: "sendMessageBroadcast",
          detail: `Gagal memproses user ${user.phone}, Error: ${error.message}`,
          action: "Insert",
          status: 2,
        };

        // Insert log into mm_logs
        insertMmLogs(logData);
        failedMessages.push(user.phone); // Menyimpan pesan yang gagal
      }
    }

    // Kembalikan respons JSON berdasarkan status pengiriman
    if (failedMessages.length > 0) {
      result(null, {
        status: "failed",
        message: "Beberapa pesan gagal dikirim.",
        failed: failedMessages,
        success: successMessages,
      });
    } else {
      result(null, {
        status: "success",
        message: "Semua pesan berhasil terkirim!",
        success: successMessages,
      });
    }
  } catch (err) {
    // Jika ada kesalahan global
    console.error("Terjadi kesalahan:", err);
    result({
      status: "error",
      message: "Terjadi kesalahan saat mengirim pesan.",
      error: err.message,
    });
  }
};

General.getDetailClassMajorUsers = async (school_id, result) => {
  let query = `
    -- Fetch data for classes and count the number of users in each class
    SELECT
      'Total Siswa per Kelas' AS header,
      'Siswa Tahun Ini' AS onetitle,
      'Jumlah Siswa & Kelas' AS title,
      '/images/cards/apple-watch-green-lg.png' AS img,
      JSON_OBJECTAGG(c.class_name, CAST(c.class_count AS CHAR)) AS details
    FROM (
      SELECT 
        class.class_name, 
        COUNT(u.id) AS class_count
      FROM class
      LEFT JOIN users u ON u.class_id = class.id AND u.role = '160'
      WHERE class.school_id = ?
      GROUP BY class.class_name
    ) c

    UNION ALL

    -- Fetch data for majors and count the number of users in each major
    SELECT
      'Total Siswa per Jurusan' AS header,
      'Siswa Tahun Ini' AS onetitle,
      'Jumlah Siswa & Jurusan' AS title,
      '/images/cards/apple-iphone-x-lg.png' AS img,
      JSON_OBJECTAGG(m.major_name, CAST(m.major_count AS CHAR)) AS details
    FROM (
      SELECT 
        major.major_name, 
        COUNT(u.id) AS major_count
      FROM major
      LEFT JOIN users u ON u.major_id = major.id AND u.role = '160'
      WHERE major.school_id = ?
      GROUP BY major.major_name
    ) m

    UNION ALL

    -- Fetch data for all users with role = 160
    SELECT
      'Total Seluruh Siswa' AS header,
      'Siswa Tahun Ini' AS onetitle,
      'Seluruh Siswa' AS title,
      '/images/cards/ps4-joystick-lg.png' AS img,
      JSON_OBJECTAGG('Total Users', CAST(u.users_count AS CHAR)) AS details
    FROM (
      SELECT COUNT(id) AS users_count
      FROM users
      WHERE role = '160'
      AND school_id = ?
    ) u;
  `;

  // Execute the query, passing the school_id in three places (for the three queries)
  db.query(query, [school_id, school_id, school_id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

const mysql = require("mysql2/promise"); // Ensure mysql2/promise is imported
const { ur } = require("@faker-js/faker");
require("dotenv").config();
General.cekTransaksiSuccesMidtrans = async (school_id, result) => {
  try {
    const query = `
    SELECT * FROM (
SELECT 
    p.id, 
    p.school_id, 
    p.order_id, 
    p.redirect_url, 
    p.user_id, 
    p.setting_payment_uid, 
    p.metode_pembayaran, 
    p.type, 
    p.amount, 
    p.years,
    u.full_name, 
    u.phone, 
    s.school_name, 
    st.sp_name, 
    m.month, 
    c.class_name
FROM 
    payment p
JOIN 
    users u ON p.user_id = u.id
JOIN 
    school s ON p.school_id = s.id
JOIN 
    setting_payment st ON p.setting_payment_uid = st.uid
JOIN 
    months m ON p.month_id = m.id
JOIN 
    class c ON p.class_id = c.id
WHERE 
    p.status = 'Verified'
    AND p.metode_pembayaran = 'Online'
    AND p.redirect_url IS NOT NULL
    AND p.school_id = '${school_id}'

UNION ALL

SELECT 
    pp.id, 
    pp.school_id, 
    p.order_id, 
    p.redirect_url, 
    p.user_id, 
    p.setting_payment_uid, 
    p.metode_pembayaran, 
    p.type, 
    p.amount, 
    pp.years, 
    u.full_name, 
    u.phone, 
    s.school_name, 
    st.sp_name, 
    NULL AS month,
    c.class_name
FROM 
    payment_detail p
JOIN 
    users u ON p.user_id = u.id
JOIN 
    payment pp ON p.payment_id = pp.uid
JOIN 
    school s ON pp.school_id = s.id
JOIN 
    setting_payment st ON p.setting_payment_uid = st.uid
JOIN 
    class c ON pp.class_id = c.id
WHERE 
    p.status = 'Verified'
    AND p.metode_pembayaran = 'Online'
    AND p.redirect_url IS NOT NULL
) a WHERE school_id = '${school_id}'`;
    // console.log(query);

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      console.log(rows.length);

      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }

      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );
      console.log(midtransServerKey);

      try {
        const paymentPromises = rows.map(async (payment, index) => {
          // console.log(payment.type);
          if (payment.type == "BULANAN") {
            try {
              let paymentConnection;
              const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

              // Make request to Midtrans API
              const response = await axios.get(url, {
                headers: {
                  Authorization: `Basic ${authHeader}`,
                  "Content-Type": "application/json",
                },
              });

              const dataResponse = response.data;
              paymentConnection = await pool.getConnection();

              // Start a transaction
              await paymentConnection.beginTransaction();
              if (dataResponse.transaction_status == "expire") {
                await paymentConnection.query(
                  "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ? WHERE order_id = ?",
                  ["", "", "", "Pending", dataResponse.order_id] // Adding order_id in the WHERE clause
                );
                console.log("succes update");
              }

              if (dataResponse.status_code == 200) {
                // Get a new connection for each payment processing

                // console.log(paymentConnection);
                // Check school balance
                const [schoolRes] = await paymentConnection.query(
                  "SELECT * FROM school WHERE id = ?",
                  [payment.school_id]
                );

                if (schoolRes.length === 0) {
                  throw new Error("School not found");
                }

                const balance = schoolRes[0].balance;
                // console.log(balance);

                if (balance <= 10000) {
                  throw new Error("Saldo tidak cukup");
                }
                // Get affiliate data
                const [getTotalAffiliate] = await paymentConnection.query(
                  "SELECT * FROM payment WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL and order_id = ?",
                  [payment.order_id] // Use appropriate user_id or school_id
                );
                // console.log(getTotalAffiliate);

                // Get affiliate data
                const [affiliateRes] = await paymentConnection.query(
                  "SELECT * FROM affiliate WHERE school_id = ?",
                  [payment.school_id] // Use appropriate user_id or school_id
                );
                let total_affiliate = 0;

                // Iterate through each affiliate record and sum the amount
                affiliateRes.forEach((affiliate) => {
                  total_affiliate +=
                    affiliate.amount * getTotalAffiliate.length; // Accumulate the amount
                });
                // console.log(total_affiliate);

                if (balance < total_affiliate) {
                  throw new Error("Saldo tidak cukup aff");
                }

                // console.log(affiliateRes);

                if (affiliateRes.length === 0) {
                  throw new Error("No affiliates found");
                }

                const newBalance = balance - total_affiliate;

                // // Update school balance
                await paymentConnection.query(
                  "UPDATE school SET balance = ? WHERE id = ?",
                  [newBalance, payment.school_id]
                );
                getTotalAffiliate.forEach((aff) => {
                  // Handle affiliate transactions
                  affiliateRes.map(async (affiliate) => {
                    const totalByAff =
                      affiliate.debit +
                      affiliate.amount * getTotalAffiliate.length; // Adjust as necessary

                    // Update the debit in the database
                    await paymentConnection.query(
                      "UPDATE affiliate SET debit = ? WHERE id = ?",
                      [totalByAff, affiliate.id]
                    );

                    // Insert the payment transaction
                    await paymentConnection.query(
                      "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      [
                        affiliate.user_id,
                        payment.school_id, // or the appropriate school_id
                        payment.id,
                        affiliate.amount,
                        "BULANAN",
                        "IN",
                        new Date(),
                      ]
                    );
                  });
                });

                paymentConnection.query(
                  "UPDATE payment SET status = ?, updated_at = ? WHERE order_id = ?",
                  ["Paid", new Date(), payment.order_id], // Use payment.order_id here
                  (error, results) => {
                    if (error) {
                      console.error("Error updating payment status:", error);
                      return;
                    }
                    console.log(
                      "Payment status updated successfully:",
                      results
                    );
                  }
                );

                // Wait for all affiliate transactions to complete
                // await Promise.all(transactionPromises);
                // Commit the transaction
                const kasData = {
                  school_id: payment.school_id,
                  user_id: payment.user_id,
                  deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                  type: "DEBIT",
                  amount: payment.amount + total_affiliate,
                  flag: 0,
                  years: payment.years,
                };

                await insertKas(kasData).then((response) => {
                  console.log(response);
                });

                // Log the transaction
                const logData = {
                  school_id: payment.school_id,
                  user_id: payment.user_id,
                  activity: "updatePaymentPendingByAdminFree",
                  detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                  action: "Update",
                  status: true,
                };

                await insertMmLogs(logData);
                console.log(
                  `Payment processed and status updated for order_id: ${payment.order_id}`
                );

                const filteredRows = rows.filter(
                  (row) => row.order_id === payment.order_id
                );
                let monthsList = [
                  ...new Set(filteredRows.map((row) => row.month)),
                ]; // Removes duplicates

                // Join the month names into a single string for message display
                const formattedMonths = monthsList.join(", ");
                if (index < 1) {
                  db.query(
                    `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                     FROM template_message tm, aplikasi a 
                     WHERE tm.school_id=a.school_id 
                     AND tm.deskripsi = 'cekTransaksiSuccesMidtrans'  
                     AND tm.school_id = '${school_id}'`,
                    async (err, queryRes) => {
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
                        // console.log(payment);

                        // Data yang ingin diganti dalam template_message
                        let replacements = {
                          nama_lengkap: payment.full_name,
                          nama_pembayaran: payment.sp_name,
                          bulan: formattedMonths, // Replaces bulan with the list of months
                          tahun: payment.years,
                          kelas: payment.class_name,
                          id_pembayaran: payment.order_id,
                          nama_sekolah: payment.school_name,
                          jenis_pembayaran_midtrans: "",
                          total_midtrans: formatRupiah(
                            dataResponse.gross_amount
                          ),
                        };

                        if (dataResponse.payment_type == "bank_transfer") {
                          replacements.jenis_pembayaran_midtrans =
                            dataResponse.va_numbers
                              ? dataResponse.va_numbers[0].bank
                              : "";
                        } else if (dataResponse.payment_type == "echannel") {
                          replacements.jenis_pembayaran_midtrans = "Mandiri";
                        } else if (dataResponse.payment_type == "qris") {
                          replacements.jenis_pembayaran_midtrans =
                            dataResponse.acquirer || "";
                        }

                        // Fungsi untuk menggantikan setiap placeholder di template
                        const formattedMessage = template_message.replace(
                          /\$\{(\w+)\}/g,
                          (_, key) => replacements[key] || ""
                        );

                        // Output hasil format pesan untuk debugging
                        console.log(formattedMessage);

                        // Mengirim pesan setelah semua data pembayaran diperbarui
                        sendMessage(
                          url,
                          token,
                          payment.phone,
                          formattedMessage
                        );

                        const logData = {
                          school_id: payment.school_id,
                          user_id: payment.user_id,
                          activity: "sendMessage",
                          detail: formattedMessage,
                          action: "Insert",
                          status: true,
                        };

                        await insertMmLogs(logData);
                      }
                    }
                  );
                }
              }
              await paymentConnection.commit();
            } catch (error) {
              // Rollback the transaction in case of error
              if (paymentConnection) await paymentConnection.rollback();
              console.error(
                `Error processing payment for order_id: ${payment.order_id}`,
                error.message
              );
            } finally {
              if (paymentConnection) paymentConnection.release(); // Release the paymentConnection back to the pool
            }
          } else {
            try {
              for (const payment of rows) {
                console.log(payment);

                const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;
                // console.log(url);

                // Make request to Midtrans API
                const response = await axios.get(url, {
                  headers: {
                    Authorization: `Basic ${authHeader}`,
                    "Content-Type": "application/json",
                  },
                });

                const dataResponse = response.data;
                const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
                const pool = mysql.createPool({
                  host: DB_HOST,
                  user: DB_USER,
                  password: DB_PASSWORD,
                  database: DB_NAME,
                  waitForConnections: true,
                  connectionLimit: 10,
                  queueLimit: 0,
                });
                // console.log(dataResponse);

                if (dataResponse.transaction_status == "expire") {
                  await paymentConnection.query(
                    "DELETE FROM `payment_detail` WHERE order_id = ?",
                    [dataResponse.order_id] // Adding order_id in the WHERE clause
                  );
                  console.log("succes update");
                }
                if (dataResponse.status_code == 200) {
                  // Get a new connection for each payment processing
                  const paymentConnection = await pool.getConnection();
                  // console.log(paymentConnection);

                  try {
                    // Start a transaction
                    await paymentConnection.beginTransaction();

                    // Check school balance
                    const [schoolRes] = await paymentConnection.query(
                      "SELECT * FROM school WHERE id = ?",
                      [payment.school_id]
                    );

                    if (schoolRes.length === 0) {
                      throw new Error("School not found");
                    }

                    const balance = schoolRes[0].balance;

                    if (balance <= 10000) {
                      throw new Error("Saldo tidak cukup");
                    }

                    // Get affiliate data
                    const [affiliateRes] = await paymentConnection.query(
                      "SELECT * FROM affiliate WHERE school_id = ?",
                      [payment.school_id]
                    );

                    let total_affiliate = 0;

                    // Iterate through each affiliate record and sum the amount
                    affiliateRes.forEach((affiliate) => {
                      total_affiliate += affiliate.amount;
                    });

                    if (balance < total_affiliate) {
                      throw new Error("Saldo tidak cukup aff");
                    }

                    if (affiliateRes.length === 0) {
                      throw new Error("No affiliates found");
                    }

                    const newBalance = balance - total_affiliate;

                    // Update school balance
                    await paymentConnection.query(
                      "UPDATE school SET balance = ? WHERE id = ?",
                      [newBalance, payment.school_id]
                    );

                    // Handle affiliate transactions
                    const transactionPromises = affiliateRes.map(
                      async (affiliate) => {
                        const totalByAff = affiliate.debit + affiliate.amount; // Adjust as necessary

                        // Update the debit in the database
                        await paymentConnection.query(
                          "UPDATE affiliate SET debit = ? WHERE id = ?",
                          [totalByAff, affiliate.id]
                        );

                        // Insert the payment transaction
                        await paymentConnection.query(
                          "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                          [
                            affiliate.user_id,
                            payment.school_id, // or the appropriate school_id
                            payment.id,
                            affiliate.amount,
                            "BULANAN",
                            "IN",
                            new Date(),
                          ]
                        );
                      }
                    );
                    db.query(
                      `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                       FROM template_message tm 
                       JOIN aplikasi a ON tm.school_id = a.school_id
                       WHERE tm.deskripsi LIKE '%cekTransaksiSuccesMidtransFree%'  
                       AND tm.school_id = ?`,
                      [school_id],
                      async (err, queryRes) => {
                        if (err) {
                          console.error(
                            "Error fetching template and WhatsApp details: ",
                            err
                          );
                        } else if (queryRes.length === 0) {
                          console.log(
                            "No template found for the given school_id"
                          );
                        } else {
                          // Ambil url, token, dan informasi pengirim dari hasil query
                          const {
                            urlWa: url,
                            token_whatsapp: token,
                            sender,
                            message: template_message,
                          } = queryRes[0];

                          // Memeriksa jenis pembayaran dan mengisi placeholder dengan data yang sesuai
                          let replacements = {
                            nama_lengkap: payment.full_name,
                            nama_pembayaran: payment.sp_name,
                            tahun: payment.years,
                            kelas: payment.class_name,
                            id_pembayaran: payment.order_id,
                            nama_sekolah: payment.school_name,
                            jenis_pembayaran_midtrans: "",
                            total_midtrans: formatRupiah(
                              dataResponse.gross_amount
                            ),
                          };

                          if (dataResponse.payment_type == "bank_transfer") {
                            replacements.jenis_pembayaran_midtrans =
                              dataResponse.va_numbers
                                ? dataResponse.va_numbers[0].bank
                                : "";
                          } else if (dataResponse.payment_type == "echannel") {
                            replacements.jenis_pembayaran_midtrans = "Mandiri";
                          } else if (dataResponse.payment_type == "qris") {
                            replacements.jenis_pembayaran_midtrans =
                              dataResponse.acquirer || "";
                          }

                          // Fungsi untuk menggantikan setiap placeholder di template
                          const formattedMessage = template_message.replace(
                            /\$\{(\w+)\}/g,
                            (_, key) => replacements[key] || ""
                          );

                          // Output hasil format pesan untuk debugging

                          // Mengirim pesan setelah semua data pembayaran diperbarui
                          sendMessage(
                            url,
                            token,
                            payment.phone,
                            formattedMessage
                          );
                          const logData = {
                            school_id: payment.school_id,
                            user_id: payment.user_id,
                            activity: "sendMessage",
                            detail: formattedMessage,
                            action: "Insert",
                            status: true,
                          };

                          await insertMmLogs(logData);
                        }
                      }
                    );
                    // Wait for all affiliate transactions to complete
                    await Promise.all(transactionPromises);

                    // Update payment status
                    await paymentConnection.query(
                      "UPDATE payment_detail SET status = ?, updated_at = ? WHERE order_id = ?",
                      ["Paid", new Date(), payment.order_id] // Use payment.order_id here
                    );
                    const kasData = {
                      school_id: payment.school_id,
                      user_id: payment.user_id,
                      deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                      type: "DEBIT",
                      amount: payment.amount + total_affiliate,
                      flag: 0,
                      years: payment.years,
                    };

                    await insertKas(kasData).then((response) => {
                      console.log(response);
                    });

                    // Log the transaction
                    const logData = {
                      school_id: payment.school_id,
                      user_id: payment.user_id,
                      activity: "updatePaymentPendingByAdminFree",
                      detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                      action: "Update",
                      status: true,
                    };

                    await insertMmLogs(logData);
                    // Commit the transaction
                    await paymentConnection.commit();
                    console.log(
                      `Payment processed and status updated for order_id: ${payment.order_id}`
                    );
                  } catch (error) {
                    console.error("Error processing payment:", error);
                    // Rollback the transaction if an error occurs
                    await paymentConnection.rollback();
                    result(error, null);
                  } finally {
                    // Release the connection back to the pool
                    paymentConnection.release();
                  }
                }
              }

              result(null, {
                success: true,
                message: "Transactions checked and updated successfully.",
              });
            } catch (err) {
              console.error("Error during payment check:", err);
              result(err, null);
            }
          }
        });

        // Wait for all payment promises to complete
        await Promise.all(paymentPromises);

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};

General.cekTransaksiPaymentSiswaBaru = async (school_id, result) => {
  try {
    const query = `SELECT p.*, s.school_name FROM calon_siswa p, school s WHERE p.school_id=s.id AND p.status_pembayaran = 'Pending' AND p.redirect_url IS NOT NULL AND p.school_id = '${school_id}' GROUP BY p.order_id ORDER BY p.created_at DESC`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      // console.log(rows.length);

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }

      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );
      try {
        const paymentPromises = rows.map(async (payment) => {
          console.log(payment);

          try {
            let paymentConnection;
            const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

            // Make request to Midtrans API
            const response = await axios.get(url, {
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/json",
              },
            });

            const dataResponse = response.data;

            paymentConnection = await pool.getConnection();

            // Start a transaction
            await paymentConnection.beginTransaction();
            if (dataResponse.transaction_status == "expire") {
              await paymentConnection.query(
                "UPDATE calon_siswa SET status_pembayaran = ? WHERE order_id = ?",
                ["Pending", dataResponse.order_id] // Adding order_id in the WHERE clause
              );
              console.log("succes update");
            }

            if (dataResponse.status_code == 200) {
              // Check school balance
              const [schoolRes] = await paymentConnection.query(
                "SELECT * FROM school WHERE id = ?",
                [school_id]
              );

              if (schoolRes.length === 0) {
                throw new Error("School not found");
              }

              const balance = schoolRes[0].balance;
              // console.log(balance);

              if (balance <= 10000) {
                throw new Error("Saldo tidak cukup");
              }

              // Get affiliate data
              const [affiliateRes] = await paymentConnection.query(
                "SELECT * FROM affiliate WHERE school_id = ?",
                [school_id] // Use appropriate user_id or school_id
              );
              let total_affiliate = 0;

              // Iterate through each affiliate record and sum the amount
              affiliateRes.forEach((affiliate) => {
                total_affiliate += affiliate.amount; // Accumulate the amount
              });
              // console.log(total_affiliate);

              if (balance < total_affiliate) {
                throw new Error("Saldo tidak cukup aff");
              }

              // console.log(affiliateRes);

              if (affiliateRes.length === 0) {
                throw new Error("No affiliates found");
              }

              const newBalance = balance - total_affiliate * rows.length;
              console.log(newBalance);

              // // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, school_id]
              );

              // Handle affiliate transactions
              affiliateRes.map(async (affiliate) => {
                const totalByAff =
                  affiliate.debit + affiliate.amount * rows.length; // Adjust as necessary

                // Update the debit in the database
                await paymentConnection.query(
                  "UPDATE affiliate SET debit = ? WHERE id = ?",
                  [totalByAff, affiliate.id]
                );

                // Insert the payment transaction
                await paymentConnection.query(
                  "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  [
                    affiliate.user_id,
                    school_id, // or the appropriate school_id
                    payment.id,
                    affiliate.amount,
                    "REGISTRASI",
                    "IN",
                    new Date(),
                  ]
                );
              });

              paymentConnection.query(
                "UPDATE calon_siswa SET status_pembayaran = ?, updated_at = ? WHERE order_id = ?",
                ["Paid", new Date(), payment.order_id], // Use payment.order_id here
                (error, results) => {
                  if (error) {
                    console.error("Error updating payment status:", error);
                    return;
                  }
                  console.log("Payment status updated successfully:", results);
                }
              );
              // Wait for all affiliate transactions to complete
              // await Promise.all(transactionPromises);
              // Commit the transaction
              const kasData = {
                school_id: school_id,
                user_id: payment.id,
                deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.id}, dengan id pembayaran registrasi: ${payment.no_registrasi}`,
                type: "DEBIT",
                amount:
                  dataAplikasi[0].nominal_register_siswa + total_affiliate,
                flag: 0,
                years: new Date().getFullYear(),
              };

              await insertKas(kasData).then((response) => {
                console.log(response);
              });

              // Log the transaction
              const logData = {
                school_id: school_id,
                user_id: payment.id,
                activity: "cekTransaksiPaymentSiswaBaru",
                detail: `Pembayaran berhasil oleh ID Users: ${payment.id}, dengan id pembayaran registrasi: ${payment.no_registrasi}`,
                action: "Update",
                status: true,
              };

              await insertMmLogs(logData);
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
              db.query(
                `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender
                     FROM template_message tm, aplikasi a
                     WHERE tm.school_id=a.school_id
                     AND tm.deskripsi = 'cekTransaksiPaymentSiswaBaru'
                     AND tm.school_id = '${school_id}'`,
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
                    let replacements = {
                      nama_lengkap: payment.full_name,
                      nama_pembayaran: "Registrasi Siswa Baru",
                      tahun: new Date().getFullYear(),
                      id_pembayaran: payment.order_id,
                      nama_sekolah: payment.school_name,
                      jenis_pembayaran_midtrans: "",
                      total_midtrans: formatRupiah(dataResponse.gross_amount),
                    };

                    if (dataResponse.payment_type == "bank_transfer") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.va_numbers
                          ? dataResponse.va_numbers[0].bank
                          : "";
                    } else if (dataResponse.payment_type == "echannel") {
                      replacements.jenis_pembayaran_midtrans = "Mandiri";
                    } else if (dataResponse.payment_type == "qris") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.acquirer || "";
                    }

                    // Fungsi untuk menggantikan setiap placeholder di template
                    const formattedMessage = template_message.replace(
                      /\$\{(\w+)\}/g,
                      (_, key) => replacements[key] || ""
                    );

                    // Output hasil format pesan untuk debugging
                    console.log(formattedMessage);

                    // Mengirim pesan setelah semua data pembayaran diperbarui
                    sendMessage(url, token, payment.phone, formattedMessage);
                  }
                }
              );
            }
            await paymentConnection.commit();
          } catch (error) {
            // Rollback the transaction in case of error
            if (paymentConnection) await paymentConnection.rollback();
            console.error(
              `Error processing payment for order_id: ${payment.order_id}`,
              error.message
            );
          } finally {
            if (paymentConnection) paymentConnection.release(); // Release the paymentConnection back to the pool
          }
        });

        // Wait for all payment promises to complete
        await Promise.all(paymentPromises);

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};
General.cekTransaksiSuccesMidtransByUserIdByMonth = async (userId, result) => {
  try {
    const query = `SELECT p.*, u.full_name, u.phone, s.school_name, st.sp_name, m.month, c.class_name
FROM payment p, users u, school s, setting_payment st, months m, class c
WHERE p.user_id=u.id 
AND p.school_id=s.id 
AND p.setting_payment_uid=st.uid 
AND p.month_id=m.id 
AND p.class_id=c.id
AND p.status = 'Verified' 
AND p.metode_pembayaran = 'Online' 
AND p.redirect_url IS NOT NULL 
and p.user_id = '${userId}'`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
// console.log(rows);

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }

      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [rows[0].school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      console.log(midtransServerKey);
      
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );
      try {
        const paymentPromises = rows.map(async (payment, index) => {
          // console.log(payment);

          let paymentConnection;
          try {
            const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

            // Make request to Midtrans API
            const response = await axios.get(url, {
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/json",
              },
            });

            const dataResponse = response.data;
            console.log(dataResponse);
            
            if (dataResponse.transaction_status == "expire") {
              await paymentConnection.query(
                "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ? WHERE order_id = ?",
                ["", "", "", "Pending", dataResponse.order_id] // Adding order_id in the WHERE clause
              );
              console.log("succes update");
            }

            if (dataResponse.status_code == 200) {
              // Get a new connection for each payment processing
              paymentConnection = await pool.getConnection();

              // Start a transaction
              await paymentConnection.beginTransaction();
              // console.log(paymentConnection);
              // Check school balance
              const [schoolRes] = await paymentConnection.query(
                "SELECT * FROM school WHERE id = ?",
                [payment.school_id]
              );

              if (schoolRes.length === 0) {
                throw new Error("School not found");
              }

              const balance = schoolRes[0].balance;
              // console.log(balance);

              if (balance <= 10000) {
                throw new Error("Saldo tidak cukup");
              }
              // Get affiliate data
              const [getTotalAffiliate] = await paymentConnection.query(
                "SELECT * FROM payment WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL and order_id = ?",
                [payment.order_id] // Use appropriate user_id or school_id
              );
              // console.log(getTotalAffiliate);

              // Get affiliate data
              const [affiliateRes] = await paymentConnection.query(
                "SELECT * FROM affiliate WHERE school_id = ?",
                [payment.school_id] // Use appropriate user_id or school_id
              );
              let total_affiliate = 0;

              // Iterate through each affiliate record and sum the amount
              affiliateRes.forEach((affiliate) => {
                total_affiliate += affiliate.amount * getTotalAffiliate.length; // Accumulate the amount
              });
              // console.log(total_affiliate);

              if (balance < total_affiliate) {
                throw new Error("Saldo tidak cukup aff");
              }

              // console.log(affiliateRes);

              if (affiliateRes.length === 0) {
                throw new Error("No affiliates found");
              }

              const newBalance = balance - total_affiliate;

              // // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );
              getTotalAffiliate.forEach((aff) => {
                // Handle affiliate transactions
                affiliateRes.map(async (affiliate) => {
                  const totalByAff =
                    affiliate.debit +
                    affiliate.amount * getTotalAffiliate.length; // Adjust as necessary

                  // Update the debit in the database
                  await paymentConnection.query(
                    "UPDATE affiliate SET debit = ? WHERE id = ?",
                    [totalByAff, affiliate.id]
                  );

                  // Insert the payment transaction
                  await paymentConnection.query(
                    "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                      affiliate.user_id,
                      payment.school_id, // or the appropriate school_id
                      payment.id,
                      affiliate.amount,
                      "BULANAN",
                      "IN",
                      new Date(),
                    ]
                  );
                });
              });

              paymentConnection.query(
                "UPDATE payment SET status = ?, updated_at = ? WHERE order_id = ?",
                ["Paid", new Date(), payment.order_id], // Use payment.order_id here
                (error, results) => {
                  if (error) {
                    console.error("Error updating payment status:", error);
                    return;
                  }
                  console.log("Payment status updated successfully:", results);
                }
              );

              const kasData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                type: "DEBIT",
                amount: payment.amount + total_affiliate,
                flag: 0,
                years: payment.years,
              };

              await insertKas(kasData).then((response) => {
                console.log(response);
              });

              // Log the transaction
              const logData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                activity: "updatePaymentPendingByAdminFree",
                detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                action: "Update",
                status: true,
              };

              await insertMmLogs(logData);
              // Commit the transaction
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
              // First, collect all months from the `rows` array where each row corresponds to a payment
              let monthsList = [...new Set(rows.map((row) => row.month))]; // Removes duplicates

              // Join the month names into a single string for message display
              const formattedMonths = monthsList.join(", ");
              if (index < 1) {
                db.query(
                  `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
     FROM template_message tm, aplikasi a 
     WHERE tm.school_id=a.school_id 
     AND tm.deskripsi like '%cekTransaksiSuccesMidtransByUserIdByMonth%'  
     AND tm.school_id = '${payment.school_id}'`,
                  async (err, queryRes) => {
                    if (err) {
                      console.error(
                        "Error fetching template and WhatsApp details: ",
                        err
                      );
                    } else {
                      const {
                        urlWa: url,
                        token_whatsapp: token,
                        sender,
                        message: template_message,
                      } = queryRes[0];

                      // Data to replace in template_message, including the formatted months
                      let replacements = {
                        nama_lengkap: payment.full_name,
                        nama_pembayaran: payment.sp_name,
                        bulan: formattedMonths, // Replaces bulan with the list of months
                        tahun: payment.years,
                        kelas: payment.class_name,
                        id_pembayaran: payment.order_id,
                        nama_sekolah: payment.school_name,
                        jenis_pembayaran_midtrans: "",
                        total_midtrans: formatRupiah(dataResponse.gross_amount),
                      };

                      // Determine payment type for `jenis_pembayaran_midtrans`
                      if (dataResponse.payment_type == "bank_transfer") {
                        replacements.jenis_pembayaran_midtrans =
                          dataResponse.va_numbers
                            ? dataResponse.va_numbers[0].bank
                            : "";
                      } else if (dataResponse.payment_type == "echannel") {
                        replacements.jenis_pembayaran_midtrans = "Mandiri";
                      } else if (dataResponse.payment_type == "qris") {
                        replacements.jenis_pembayaran_midtrans =
                          dataResponse.acquirer || "";
                      }

                      // Replace placeholders in the template
                      const formattedMessage = template_message.replace(
                        /\$\{(\w+)\}/g,
                        (_, key) => replacements[key] || ""
                      );

                      // Debugging output
                      console.log(formattedMessage);

                      // Send message with all payment details
                      sendMessage(url, token, payment.phone, formattedMessage);

                      const logData = {
                        school_id: payment.school_id,
                        user_id: payment.user_id,
                        activity: "SendMessage",
                        detail: formattedMessage,
                        action: "Insert",
                        status: true,
                      };

                      await insertMmLogs(logData);
                    }
                  }
                );
              }

              await paymentConnection.commit();
            }
          } catch (error) {
            // Rollback the transaction in case of error
            if (paymentConnection) await paymentConnection.rollback();
            console.error(
              `Error processing payment for order_id: ${payment.order_id}`,
              error.message
            );
          } finally {
            if (paymentConnection) paymentConnection.release(); // Release the paymentConnection back to the pool
          }
        });

        // Wait for all payment promises to complete
        await Promise.all(paymentPromises);

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};

General.cekTransaksiSuccesMidtransByUserIdFree = async (userId, result) => {
  try {
    const query = `SELECT pd.*, p.school_id, p.years, u.full_name, u.phone, s.school_name, st.sp_name, c.class_name
FROM payment_detail pd, payment p, users u, school s, setting_payment st, class c
WHERE pd.payment_id=p.uid 
AND pd.user_id=u.id 
AND p.school_id=s.id 
AND pd.setting_payment_uid=st.uid 
AND p.class_id=c.id
AND pd.status = 'Verified' 
AND pd.metode_pembayaran = 'Online' 
AND pd.redirect_url IS NOT NULL 
and pd.user_id = '${userId}'`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }
      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [rows[0].school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );

      try {
        const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
        const pool = mysql.createPool({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
        for (const payment of rows) {
          const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

          // Make request to Midtrans API
          const response = await axios.get(url, {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json",
            },
          });

          const dataResponse = response.data;
          // console.log(dataResponse);

          if (dataResponse.transaction_status == "expire") {
            await paymentConnection.query(
              "DELETE FROM `payment_detail` WHERE order_id = ?",
              [dataResponse.order_id] // Adding order_id in the WHERE clause
            );
            console.log("succes update");
          }

          if (dataResponse.status_code == 200) {
            // Get a new connection for each payment processing
            const paymentConnection = await pool.getConnection();
            // console.log(paymentConnection);

            try {
              // Start a transaction
              await paymentConnection.beginTransaction();
              console.log(payment);

              // Check school balance
              const [schoolRes] = await paymentConnection.query(
                "SELECT * FROM school WHERE id = ?",
                [payment.school_id]
              );

              if (schoolRes.length === 0) {
                throw new Error("School not found");
              }

              const balance = schoolRes[0].balance;

              if (balance <= 10000) {
                throw new Error("Saldo tidak cukup");
              }

              // Get affiliate data
              const [affiliateRes] = await paymentConnection.query(
                "SELECT * FROM affiliate WHERE school_id = ?",
                [payment.school_id]
              );

              let total_affiliate = 0;

              // Iterate through each affiliate record and sum the amount
              affiliateRes.forEach((affiliate) => {
                total_affiliate += affiliate.amount;
              });

              if (balance < total_affiliate) {
                throw new Error("Saldo tidak cukup aff");
              }

              if (affiliateRes.length === 0) {
                throw new Error("No affiliates found");
              }

              const newBalance = balance - total_affiliate;

              // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );

              // Handle affiliate transactions
              const transactionPromises = affiliateRes.map(
                async (affiliate) => {
                  const totalByAff = affiliate.debit + affiliate.amount; // Adjust as necessary

                  // Update the debit in the database
                  await paymentConnection.query(
                    "UPDATE affiliate SET debit = ? WHERE id = ?",
                    [totalByAff, affiliate.id]
                  );

                  // Insert the payment transaction
                  await paymentConnection.query(
                    "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                      affiliate.user_id,
                      payment.school_id, // or the appropriate school_id
                      payment.id,
                      affiliate.amount,
                      "BULANAN",
                      "IN",
                      new Date(),
                    ]
                  );
                }
              );

              // Wait for all affiliate transactions to complete
              await Promise.all(transactionPromises);

              // Update payment status
              await paymentConnection.query(
                "UPDATE payment_detail SET status = ?, updated_at = ? WHERE order_id = ?",
                ["Paid", new Date(), payment.order_id] // Use payment.order_id here
              );

              const kasData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                type: "DEBIT",
                amount: payment.amount + total_affiliate,
                flag: 0,
                years: payment.years,
              };

              await insertKas(kasData).then((response) => {
                console.log(response);
              });

              // Log the transaction
              const logData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                activity: "updatePaymentPendingByAdminFree",
                detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                action: "Update",
                status: true,
              };

              await insertMmLogs(logData);

              db.query(
                `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                 FROM template_message tm, aplikasi a 
                 WHERE tm.school_id=a.school_id 
                 AND tm.deskripsi like '%cekTransaksiSuccesMidtransByUserIdFree%'  
                 AND tm.school_id = '${payment.school_id}'`,
                async (err, queryRes) => {
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

                    // Memeriksa jenis pembayaran dan mengisi placeholder dengan data yang sesuai
                    let replacements = {
                      nama_lengkap: payment.full_name,
                      nama_pembayaran: payment.sp_name,
                      tahun: payment.years,
                      kelas: payment.class_name,
                      id_pembayaran: payment.order_id,
                      nama_sekolah: payment.school_name,
                      jenis_pembayaran_midtrans: "",
                      total_midtrans: formatRupiah(dataResponse.gross_amount),
                    };

                    if (dataResponse.payment_type == "bank_transfer") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.va_numbers
                          ? dataResponse.va_numbers[0].bank
                          : "";
                    } else if (dataResponse.payment_type == "echannel") {
                      replacements.jenis_pembayaran_midtrans = "Mandiri";
                    } else if (dataResponse.payment_type == "qris") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.acquirer || "";
                    }

                    // Fungsi untuk menggantikan setiap placeholder di template
                    const formattedMessage = template_message.replace(
                      /\$\{(\w+)\}/g,
                      (_, key) => replacements[key] || ""
                    );

                    // Output hasil format pesan untuk debugging
                    console.log(formattedMessage);

                    // Mengirim pesan setelah semua data pembayaran diperbarui
                    sendMessage(url, token, payment.phone, formattedMessage);

                    // Log the transaction
                    const logData = {
                      school_id: payment.school_id,
                      user_id: payment.user_id,
                      activity: "SendMessage",
                      detail: formattedMessage,
                      action: "Insert",
                      status: true,
                    };

                    await insertMmLogs(logData);
                  }
                }
              );
              // Commit the transaction
              await paymentConnection.commit();
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
            } catch (error) {
              console.error("Error processing payment:", error);
              // Rollback the transaction if an error occurs
              await paymentConnection.rollback();
              result(error, null);
            } finally {
              // Release the connection back to the pool
              paymentConnection.release();
            }
          }
        }

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};
General.cekTransaksiSuccesMidtransByUserIdTopUp = async (userId, result) => {
  try {
    const query = `SELECT ts.*, u.full_name, u.phone, s.school_name, c.class_name
FROM transactions ts, users u, school s, class c
WHERE ts.user_id=u.id 
AND ts.school_id=s.id
AND u.class_id=c.id
AND ts.status = 'Verified' 
AND ts.metode_pembayaran = 'Online' 
AND ts.redirect_url IS NOT NULL 
and ts.user_id = '${userId}'`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }
      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [rows[0].school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );

      try {
        const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
        const pool = mysql.createPool({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
        for (const payment of rows) {
          const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

          // Make request to Midtrans API
          const response = await axios.get(url, {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json",
            },
          });

          const dataResponse = response.data;
          // console.log(dataResponse);

          if (dataResponse.transaction_status == "expire") {
            await paymentConnection.query(
              "DELETE FROM transactions WHERE order_id = ?",
              [dataResponse.order_id] // Adding order_id in the WHERE clause
            );
            console.log("succes update");
          }

          if (dataResponse.status_code == 200) {
            // Get a new connection for each payment processing
            const paymentConnection = await pool.getConnection();
            // console.log(paymentConnection);

            try {
              // Start a transaction
              await paymentConnection.beginTransaction();
              console.log(payment);

              // Check school balance
              const [schoolRes] = await paymentConnection.query(
                "SELECT * FROM school WHERE id = ?",
                [payment.school_id]
              );

              if (schoolRes.length === 0) {
                throw new Error("School not found");
              }

              const balance = schoolRes[0].balance;

              if (balance <= 10000) {
                throw new Error("Saldo tidak cukup");
              }

              // Get affiliate data
              const [affiliateRes] = await paymentConnection.query(
                "SELECT * FROM affiliate WHERE school_id = ?",
                [payment.school_id]
              );

              let total_affiliate = 0;

              // Iterate through each affiliate record and sum the amount
              affiliateRes.forEach((affiliate) => {
                total_affiliate += affiliate.amount;
              });

              if (balance < total_affiliate) {
                throw new Error("Saldo tidak cukup aff");
              }

              if (affiliateRes.length === 0) {
                throw new Error("No affiliates found");
              }

              const newBalance = balance - total_affiliate;

              // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );

              // Handle affiliate transactions
              const transactionPromises = affiliateRes.map(
                async (affiliate) => {
                  const totalByAff = affiliate.debit + affiliate.amount; // Adjust as necessary

                  // Update the debit in the database
                  await paymentConnection.query(
                    "UPDATE affiliate SET debit = ? WHERE id = ?",
                    [totalByAff, affiliate.id]
                  );

                  // Insert the payment transaction
                  await paymentConnection.query(
                    "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                      affiliate.user_id,
                      payment.school_id, // or the appropriate school_id
                      payment.id,
                      affiliate.amount,
                      "BEBAS",
                      "IN",
                      new Date(),
                    ]
                  );
                }
              );

              // Wait for all affiliate transactions to complete
              await Promise.all(transactionPromises);

              // Update payment status
              await paymentConnection.query(
                "UPDATE transactions SET status = ?, updated_at = ? WHERE order_id = ?",
                ["Paid", new Date(), payment.order_id] // Use payment.order_id here
              );
              await paymentConnection.query(
                "UPDATE users SET saldo = COALESCE(saldo, 0) + ? WHERE id = ?",
                [payment.amount, payment.user_id] // Use payment.user_id here
              );
              
              
              const currentYear = new Date().getFullYear();
              const nextYear = currentYear + 1;
              
              // Update payment.years to reflect "currentYear/nextYear"
              years = `${currentYear}/${nextYear}`;
              const kasData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                deskripsi: `Top Up Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.invoice_number}`,
                type: "DEBIT",
                amount: payment.amount + total_affiliate,
                flag: 0,
                years: years,
              };

              await insertKas(kasData).then((response) => {
                console.log(response);
              });

              // Log the transaction
              const logData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                activity: "cekTransaksiSuccesMidtransByUserIdTopUp",
                detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.invoice_number}`,
                action: "Update",
                status: true,
              };

              await insertMmLogs(logData);

              db.query(
                `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                 FROM template_message tm, aplikasi a 
                 WHERE tm.school_id=a.school_id 
                 AND tm.deskripsi = 'cekTransaksiSuccesMidtransByUserIdTopUp'  
                 AND tm.school_id = '${payment.school_id}'`,
                async (err, queryRes) => {
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

                    // Memeriksa jenis pembayaran dan mengisi placeholder dengan data yang sesuai
                    let replacements = {
                      nama_lengkap: payment.full_name,
                      nama_pembayaran: 'Top Up',                     
                      kelas: payment.class_name,
                      id_pembayaran: payment.order_id,
                      nama_sekolah: payment.school_name,
                      jenis_pembayaran_midtrans: "",
                      total_midtrans: formatRupiah(dataResponse.gross_amount),
                    };

                    if (dataResponse.payment_type == "bank_transfer") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.va_numbers
                          ? dataResponse.va_numbers[0].bank
                          : "";
                    } else if (dataResponse.payment_type == "echannel") {
                      replacements.jenis_pembayaran_midtrans = "Mandiri";
                    } else if (dataResponse.payment_type == "qris") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.acquirer || "";
                    }

                    // Fungsi untuk menggantikan setiap placeholder di template
                    const formattedMessage = template_message.replace(
                      /\$\{(\w+)\}/g,
                      (_, key) => replacements[key] || ""
                    );

                    // Output hasil format pesan untuk debugging
                    console.log(formattedMessage);

                    // Mengirim pesan setelah semua data pembayaran diperbarui
                    sendMessage(url, token, payment.phone, formattedMessage);

                    // Log the transaction
                    const logData = {
                      school_id: payment.school_id,
                      user_id: payment.user_id,
                      activity: "SendMessage",
                      detail: formattedMessage,
                      action: "Insert",
                      status: true,
                    };

                    await insertMmLogs(logData);
                  }
                }
              );
              // Commit the transaction
              await paymentConnection.commit();
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
            } catch (error) {
              console.error("Error processing payment:", error);
              // Rollback the transaction if an error occurs
              await paymentConnection.rollback();
              result(error, null);
            } finally {
              // Release the connection back to the pool
              paymentConnection.release();
            }
          }
        }

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};

General.cekTransaksiSuccesMidtransFree = async (result) => {
  try {
    const query = `SELECT pd.*, p.school_id, p.years, u.full_name, u.phone, s.school_name, st.sp_name, c.class_name
FROM payment_detail pd, payment p, users u, school s, setting_payment st, class c
WHERE pd.payment_id=p.uid 
AND pd.user_id=u.id 
AND p.school_id=s.id 
AND pd.setting_payment_uid=st.uid 
AND p.class_id=c.id
AND pd.status = 'Verified' 
AND pd.metode_pembayaran = 'Online' 
AND pd.redirect_url IS NOT NULL`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      // console.log(rows);

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }
      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      const pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      let paymentConnection;
      paymentConnection = await pool.getConnection();

      const [dataAplikasi] = await paymentConnection.query(
        "SELECT * FROM aplikasi WHERE school_id = ?",
        [rows[0].school_id]
      );

      const midtransServerKey = dataAplikasi[0].serverKey;
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );

      try {
        for (const payment of rows) {
          const url = `${dataAplikasi[0].urlCekTransaksiMidtrans}/v2/${payment.order_id}/status`;

          // Make request to Midtrans API
          const response = await axios.get(url, {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json",
            },
          });

          const dataResponse = response.data;
          const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
          const pool = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
          });

          if (dataResponse.transaction_status == "expire") {
            await paymentConnection.query(
              "DELETE FROM `payment_detail` WHERE order_id = ?",
              [dataResponse.order_id] // Adding order_id in the WHERE clause
            );
            console.log("succes update");
          }
          if (dataResponse.status_code == 200) {
            // Get a new connection for each payment processing
            const paymentConnection = await pool.getConnection();
            // console.log(paymentConnection);

            try {
              // Start a transaction
              await paymentConnection.beginTransaction();

              // Check school balance
              const [schoolRes] = await paymentConnection.query(
                "SELECT * FROM school WHERE id = ?",
                [payment.school_id]
              );

              if (schoolRes.length === 0) {
                throw new Error("School not found");
              }

              const balance = schoolRes[0].balance;

              if (balance <= 10000) {
                throw new Error("Saldo tidak cukup");
              }

              // Get affiliate data
              const [affiliateRes] = await paymentConnection.query(
                "SELECT * FROM affiliate WHERE school_id = ?",
                [payment.school_id]
              );

              let total_affiliate = 0;

              // Iterate through each affiliate record and sum the amount
              affiliateRes.forEach((affiliate) => {
                total_affiliate += affiliate.amount;
              });

              if (balance < total_affiliate) {
                throw new Error("Saldo tidak cukup aff");
              }

              if (affiliateRes.length === 0) {
                throw new Error("No affiliates found");
              }

              const newBalance = balance - total_affiliate;

              // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );

              // Handle affiliate transactions
              const transactionPromises = affiliateRes.map(
                async (affiliate) => {
                  const totalByAff = affiliate.debit + affiliate.amount; // Adjust as necessary

                  // Update the debit in the database
                  await paymentConnection.query(
                    "UPDATE affiliate SET debit = ? WHERE id = ?",
                    [totalByAff, affiliate.id]
                  );

                  // Insert the payment transaction
                  await paymentConnection.query(
                    "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                      affiliate.user_id,
                      payment.school_id, // or the appropriate school_id
                      payment.id,
                      affiliate.amount,
                      "BULANAN",
                      "IN",
                      new Date(),
                    ]
                  );
                }
              );
              db.query(
                `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                 FROM template_message tm 
                 JOIN aplikasi a ON tm.school_id = a.school_id
                 WHERE tm.deskripsi LIKE '%cekTransaksiSuccesMidtransFree%'  
                 AND tm.school_id = ?`,
                [payment.school_id],
                (err, queryRes) => {
                  if (err) {
                    console.error(
                      "Error fetching template and WhatsApp details: ",
                      err
                    );
                  } else if (queryRes.length === 0) {
                    console.log("No template found for the given school_id");
                  } else {
                    // Ambil url, token, dan informasi pengirim dari hasil query
                    const {
                      urlWa: url,
                      token_whatsapp: token,
                      sender,
                      message: template_message,
                    } = queryRes[0];

                    // Memeriksa jenis pembayaran dan mengisi placeholder dengan data yang sesuai
                    let replacements = {
                      nama_lengkap: payment.full_name,
                      nama_pembayaran: payment.sp_name,
                      tahun: payment.years,
                      kelas: payment.class_name,
                      id_pembayaran: payment.order_id,
                      nama_sekolah: payment.school_name,
                      jenis_pembayaran_midtrans: "",
                      total_midtrans: formatRupiah(dataResponse.gross_amount),
                    };

                    if (dataResponse.payment_type == "bank_transfer") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.va_numbers
                          ? dataResponse.va_numbers[0].bank
                          : "";
                    } else if (dataResponse.payment_type == "echannel") {
                      replacements.jenis_pembayaran_midtrans = "Mandiri";
                    } else if (dataResponse.payment_type == "qris") {
                      replacements.jenis_pembayaran_midtrans =
                        dataResponse.acquirer || "";
                    }

                    // Fungsi untuk menggantikan setiap placeholder di template
                    const formattedMessage = template_message.replace(
                      /\$\{(\w+)\}/g,
                      (_, key) => replacements[key] || ""
                    );

                    // Output hasil format pesan untuk debugging

                    // Mengirim pesan setelah semua data pembayaran diperbarui
                    sendMessage(url, token, payment.phone, formattedMessage);
                  }
                }
              );
              // Wait for all affiliate transactions to complete
              await Promise.all(transactionPromises);

              // Update payment status
              await paymentConnection.query(
                "UPDATE payment_detail SET status = ?, updated_at = ? WHERE order_id = ?",
                ["Paid", new Date(), payment.order_id] // Use payment.order_id here
              );
              const kasData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                deskripsi: `Kas Masuk Berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                type: "DEBIT",
                amount: payment.amount + total_affiliate,
                flag: 0,
                years: payment.years,
              };

              await insertKas(kasData).then((response) => {
                console.log(response);
              });

              // Log the transaction
              const logData = {
                school_id: payment.school_id,
                user_id: payment.user_id,
                activity: "updatePaymentPendingByAdminFree",
                detail: `Pembayaran berhasil oleh ID Users: ${payment.user_id}, dengan id pembayaran bulanan: ${payment.id}`,
                action: "Update",
                status: true,
              };

              await insertMmLogs(logData);
              // Commit the transaction
              await paymentConnection.commit();
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
            } catch (error) {
              console.error("Error processing payment:", error);
              // Rollback the transaction if an error occurs
              await paymentConnection.rollback();
              result(error, null);
            } finally {
              // Release the connection back to the pool
              paymentConnection.release();
            }
          }
        }

        result(null, {
          success: true,
          message: "Transactions checked and updated successfully.",
        });
      } catch (err) {
        console.error("Error during payment check:", err);
        result(err, null);
      }
    });
  } catch (err) {
    console.error("Error during payment check:", err);
    result(err, null);
  }
};

General.getMajors = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM major WHERE major_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += " AND school_id = ?";
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
General.getClass = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM class WHERE class_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  if (schoolId) {
    query += " AND school_id = ?";
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
General.getDataMaster = async (schoolId, result) => {
  // Siapkan query dasar
  let query = `SELECT 
    COUNT(id) AS stats,
    'tabler:school' AS icon, 
    'Sekolah' AS title,
    'primary' AS color
FROM unit 
WHERE unit_status = 'ON' AND school_id = '${schoolId}'

UNION ALL

SELECT 
    COUNT(id) AS stats,
    'tabler:building-pavilion' AS icon, 
    'Kelas' AS title,
    'secondary' AS color
FROM class 
WHERE class_status = 'ON' AND school_id = '${schoolId}'

UNION ALL

SELECT 
    COUNT(id) AS stats,
    'tabler:building-skyscraper' AS icon, 
    'Jurusan' AS title,
    'info' AS color
FROM major 
WHERE major_status = 'ON' AND school_id = '${schoolId}'

UNION ALL

SELECT 
    COUNT(id) AS stats,
    'tabler:user-heart' AS icon, 
    'Siswa' AS title,
    'success' AS color
FROM users 
WHERE STATUS = 'ON' AND role = '160' AND school_id = '${schoolId}'

UNION ALL

SELECT 
    COUNT(id) AS stats,
    'tabler:users' AS icon, 
    'Admin' AS title,
    'warning' AS color
FROM users 
WHERE STATUS = 'ON' AND role != '160' AND school_id = '${schoolId}'

UNION ALL

SELECT 
    COUNT(id) AS stats,
    'tabler:users-group' AS icon, 
    'Siswa Baru' AS title,
    'error' AS color
FROM calon_siswa 
WHERE STATUS = 'Registered' AND school_id = '${schoolId}'
 `;

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
General.getMonths = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM months WHERE month_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  const params = [];
  if (schoolId) {
    query += ` AND school_id = '${schoolId}'`;
    params.push(schoolId);
  }

  // Urutkan hasil berdasarkan month_number
  query += " ORDER BY month_number ASC";

  // Eksekusi query dengan parameter yang sesuai
  db.query(query, params, (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Kembalikan hasil query
    result(null, res);
  });
};
General.rolePermissions = async (school_id, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM role_permission WHERE 1=1";
  if (school_id) {
    query += ` and school_id = '${school_id}'`;
  }
  // Eksekusi query
  db.query(query, (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Siapkan objek untuk menyimpan role permissions
    const rolePermissions = {};

    // Loop melalui hasil query untuk membangun rolePermissions
    res.forEach((row) => {
      const path = row.path; // Assuming 'path' is the column name for the route
      const roleId = row.role; // Assuming 'role' is the column name for role identifier

      // Masukkan ke dalam rolePermissions
      // Gunakan array untuk mendukung beberapa role di masa depan
      if (!rolePermissions[path]) {
        rolePermissions[path] = [];
      }
      rolePermissions[path].push(roleId); // Push roleId into the array
    });

    // Kembalikan hasil query dalam format JSON
    result(null, JSON.stringify(rolePermissions)); // Convert to JSON string
  });
};
General.getMenuActive = async (school_id, result) => {
  // Siapkan query dasar
  let query = `
    SELECT id, id_menu, school_id, title, icon, path, role, status, created_at, updated_at
    FROM role_permission
    WHERE 1=1
  `;

  // Jika school_id disediakan, tambahkan ke query dengan parameter
  if (school_id) {
    query += ` AND school_id = ?`;
  }

  console.log(query);

  // Eksekusi query dengan parameter
  db.query(query, [school_id], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    // Siapkan objek untuk menyimpan menu utama dan anak-anaknya
    const menus = [];

    // Pisahkan antara menu utama (id_menu = null) dan submenu (id_menu != null)
    const mainMenu = {};
    const subMenu = [];

    // Loop untuk memisahkan menu utama dan submenu berdasarkan id_menu
    res.forEach((row) => {
      // Jika id_menu NULL, maka ini adalah menu utama
      if (row.id_menu === null) {
        mainMenu[row.id] = {
          id: row.id,
          school_id: row.school_id,
          title: row.title,
          icon: row.icon || "NULL", // Jika icon tidak ada, tampilkan NULL
          path: row.path || "none", // Jika path tidak ada, tampilkan 'none'
          role: row.role,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at || "NULL", // Jika updated_at NULL, tampilkan NULL
          children: [], // Inisialisasi array children untuk menu utama
        };
      } else {
        // Jika id_menu ada, maka ini adalah submenu
        subMenu.push({
          id: row.id,
          school_id: row.school_id,
          title: row.title,
          icon: row.icon || "NULL",
          path: row.path,
          role: row.role,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at || "NULL",
          parent_id: row.id_menu, // Simpan id_menu untuk relasi dengan menu utama
        });
      }
    });

    // Assign submenus ke parent menu berdasarkan id_menu
    subMenu.forEach((submenu) => {
      if (mainMenu[submenu.parent_id]) {
        mainMenu[submenu.parent_id].children.push(submenu); // Tambahkan submenu ke children
      }
    });

    // Konversi mainMenu ke array dan simpan di menus
    Object.keys(mainMenu).forEach((key) => {
      menus.push(mainMenu[key]);
    });

    // Kembalikan hasil dalam format JSON
    result(null, menus); // Kembalikan dalam bentuk array
  });
};

General.cekFunction = async (schoolId, result) => {
  const affiliateQuery = `SELECT SUM(amount) as amount FROM affiliate WHERE user_id = ?`;
  db.query(affiliateQuery, [20064], (affiliateErr, affiliateRows) => {
    if (affiliateErr) {
      console.log("Error fetching affiliate amount: ", affiliateErr);
    } else {
      if (affiliateRows.length > 0) {
        const affiliateAmount = affiliateRows[0].amount;
        console.log(`Affiliate amount for order_id : ${affiliateAmount}`);
      } else {
        console.log(`No affiliate record found for order_id: `);
      }
    }
  });
};

module.exports = General;

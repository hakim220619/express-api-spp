const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");
const {
  sendMessage,
  formatRupiah,
  insertMmLogs,
  insertKas,
} = require("../../helpers/helper");

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
    p.updated_at,
    u.full_name,
    u.nisn,
    c.class_name,
    m.major_name,
    sp.sp_name,
    mt.month,
    mt.month_number,
    u.email,
    u.nisn,
    u.phone,
    p.redirect_url,
    s.school_name,
    s.address as school_address,
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
    months mt ON mt.id = p.month_id
JOIN 
    school s ON s.id = p.school_id`;

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
  query += "ORDER BY mt.month_number ASC";
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
    s.school_name,
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
    school s ON p.school_id = s.id
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
  // console.log(query);

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
    p.updated_at,
    u.full_name,
    sp.sp_name,
    u.email,
    u.nisn,
    u.phone,
    pm.years,
    p.redirect_url,
    p.metode_pembayaran,
    p.created_at,
    sp.sp_name,
    s.school_name,
    s.address as school_address,
    c.class_name,
    m.major_name,
    (SELECT SUM(amount) as amount FROM affiliate WHERE school_id = u.school_id ) as affiliate
FROM
    payment_detail p
JOIN
    payment pm ON pm.uid = p.payment_id
JOIN
    users u ON p.user_id = u.id
JOIN
    school s ON s.id = pm.school_id
JOIN
    class c ON c.id = u.class_id
JOIN
	major m ON m.id = u.major_id
JOIN
    setting_payment sp ON p.setting_payment_uid = sp.uid `;

  if (sp_name) {
    query += ` AND sp.sp_name like '%${sp_name}%'`;
  }
  if (user_id) {
    query += ` AND p.user_id = '${user_id}'`;
  }
  if (id_payment) {
    query += ` AND p.payment_id = '${id_payment}'`;
  }
  query += "order by p.created_at asc";
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

Pembayaran.updatePaymentPendingAdmin = (newPayment, result) => {
  const { dataPayment, dataUsers, redirect_url, total_amount } = newPayment; // Ekstrak dataPayment dari newPayment
  let completedUpdates = 0; // Untuk menghitung jumlah update yang sudah selesai
  let errors = []; // Untuk menyimpan error jika ada
  let totalMonth = ""; // Untuk menjumlahkan bulan dari dataPayment
  let totalPayment = 0; // Untuk menjumlahkan total pembayaran dari dataPayment
// console.log(dataPayment);

  // Iterasi melalui setiap item dalam dataPayment
  dataPayment.forEach((paymentData) => {
    // console.log(paymentData);
    
    db.query(
      "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ?, updated_at = ? WHERE id = ?",
      [
        newPayment.order_id,
        "Online",
        newPayment.redirect_url,
        "Verified",
        new Date(),
        paymentData.id,
      ],
      (err, res) => {
        if (err) {
          console.error("Error: ", err);
          errors.push({ id: paymentData.id, error: err });
        } else if (res.affectedRows == 0) {
          // Tidak ditemukan payment dengan id tersebut
          errors.push({ id: paymentData.id, error: "not_found" });
        } else {
          console.log("Updated Payment: ", {
            id: paymentData.id,
            ...paymentData,
          });

          // Tambahkan bulan dan total pembayaran
          totalMonth += `${paymentData.month}, `;
          totalPayment += paymentData.total_payment;
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

          // Hapus koma di akhir dari totalMonth jika ada
          totalMonth = totalMonth.replace(/,\s*$/, "");

          // Lakukan query SELECT sebelum mengirim pesan

          db.query(
            `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                   FROM template_message tm, aplikasi a 
                   WHERE tm.school_id=a.school_id 
                   AND tm.deskripsi like '%updatePaymentPendingAdmin%'  
                   AND tm.school_id = '${dataUsers.school_id}'`,
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

                // Data yang ingin diganti dalam template_message
                const replacements = {
                  nama_lengkap: dataUsers.full_name,
                  nama_pembayaran: dataUsers.sp_name,
                  bulan: totalMonth,
                  tahun: paymentData.years,
                  total_pembayaran: formatRupiah(totalPayment),
                  nama_sekolah: dataUsers.school_name,
                  url_pembayaran: redirect_url,
                };

                // Fungsi untuk menggantikan setiap placeholder di template
                const formattedMessage = template_message.replace(
                  /\$\{(\w+)\}/g,
                  (_, key) => {
                    return replacements[key] || "";
                  }
                );
                // Kirim pesan setelah semua pembayaran diperbarui
                sendMessage(url, token, dataUsers.phone, formattedMessage);
                const logData = {
                  school_id: dataUsers.school_id,
                  user_id: dataUsers.id,
                  activity: "SendMessage",
                  detail: formattedMessage,
                  action: "Insert",
                  status: true,
                };
                await insertMmLogs(logData);
              }
            }
          );
          // Kirim pesan setelah semua pembayaran diperbarui
        }
      }
    );
  });
};

const mysql = require("mysql2/promise"); // Import mysql2/promise
require("dotenv").config();

Pembayaran.updatePaymentPendingByAdmin = async (newPayment, result) => {
  const { dataPayment, dataUsers, total_affiliate } = newPayment;
  const errors = [];
  const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  let totalMonth = "";
  let totalPayment = 0;
  // Create MySQL connection pool
  const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();

    // Start a transaction at the very beginning
    await connection.beginTransaction();

    // Check school balance
    const [schoolRes] = await connection.query(
      "SELECT * FROM school WHERE id = ?",
      [dataUsers.school_id]
    );

    if (schoolRes.length === 0) {
      throw new Error("School not found");
    }

    const balance = schoolRes[0].balance;

    if (balance <= 10000 || balance < total_affiliate) {
      throw new Error("Saldo tidak cukup");
    }

    // Get affiliate data
    const [affiliateRes] = await connection.query(
      "SELECT * FROM affiliate WHERE school_id = ?",
      [dataUsers.school_id]
    );

    if (affiliateRes.length === 0) {
      throw new Error("No affiliates found");
    }

    const newBalance = balance - total_affiliate;

    // Update school balance
    await connection.query("UPDATE school SET balance = ? WHERE id = ?", [
      newBalance,
      dataUsers.school_id,
    ]);

    // Handle each payment in the same transaction
    const paymentPromises = dataPayment.map(async (paymentData) => {
      try {
        // Execute the query to update payment
        await connection.query(
          "UPDATE payment SET metode_pembayaran = ?, status = ?, updated_at = ?, updated_by = ? WHERE id = ?",
          ["Manual", "Paid", new Date(), newPayment.admin_id, paymentData.id]
        );

        const kasData = {
          school_id: dataUsers.school_id,
          user_id: newPayment.admin_id,
          deskripsi: `Kas Masuk Berhasil oleh ID Admin: ${newPayment.admin_id}, dengan id pembayaran bulanan: ${paymentData.id}`,
          type: "DEBIT",
          amount: paymentData.total_payment,
          flag: 0,
          years: paymentData.years,
        };

        await insertKas(kasData).then((response) => {
          console.log(response);
        });

        // Log the transaction
        const logData = {
          school_id: dataUsers.school_id,
          user_id: newPayment.admin_id,
          activity: "updatePaymentPendingByAdmin",
          detail: `Pembayaran berhasil oleh ID Admin: ${newPayment.admin_id}, dengan id pembayaran bulanan: ${paymentData.id}`,
          action: "Update",
          status: true,
        };
        await insertMmLogs(logData);

        // Get message template and send WhatsApp message
        totalMonth += `${paymentData.month}, `;
        totalPayment += paymentData.total_payment;

        // Handle affiliate transactions
        const transactionPromises = affiliateRes.map(async (affiliate) => {
          const totalByAff =
            affiliate.debit + affiliate.amount * dataPayment.length;

          // Update the debit in the database
          await connection.query(
            "UPDATE affiliate SET debit = ? WHERE id = ?",
            [totalByAff, affiliate.id]
          );

          // Insert the payment transaction
          await connection.query(
            "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              affiliate.user_id,
              dataUsers.school_id,
              paymentData.id,
              affiliate.amount,
              "BULANAN",
              "IN",
              new Date(),
            ]
          );
        });

        // Wait for all affiliate transactions to complete
        await Promise.all(transactionPromises);
      } catch (error) {
        errors.push({ id: paymentData.id, error: error.message });
      }
    });

    // Wait for all payment promises to complete
    await Promise.all(paymentPromises);
    totalMonth = totalMonth.replace(/,\s*$/, "");
    const [queryRes] = await connection.query(
      `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
       FROM template_message tm, aplikasi a 
       WHERE tm.school_id=a.school_id 
       AND tm.deskripsi = 'updatePaymentPendingByAdmin'  
       AND tm.school_id = ?`,
      [dataUsers.school_id]
    );

    if (queryRes.length > 0) {
      const {
        urlWa: url,
        token_whatsapp: token,
        sender,
        message: template_message,
      } = queryRes[0];

      // Data yang ingin diganti dalam template_message
      const replacements = {
        nama_lengkap: dataUsers.full_name,
        nama_pembayaran: dataUsers.sp_name,
        bulan: totalMonth,
        tahun: dataPayment[0].years,
        kelas: dataUsers.class_name,
        total_pembayaran: formatRupiah(totalPayment),
        nama_sekolah: dataUsers.school_name,
      };

      // Fungsi untuk menggantikan setiap placeholder di template
      const formattedMessage = template_message.replace(
        /\$\{(\w+)\}/g,
        (_, key) => {
          return replacements[key] || "";
        }
      );

      // Kirim pesan setelah semua pembayaran diperbarui
      await sendMessage(url, token, dataUsers.phone, formattedMessage);

      const logData = {
        school_id: dataUsers.school_id,
        user_id: newPayment.admin_id,
        activity: "SendMessage",
        detail: formattedMessage,
        action: "Insert",
        status: true,
      };
      await insertMmLogs(logData);
    }
    // Check results
    if (errors.length > 0) {
      // Rollback the transaction if there were errors
      await connection.rollback();
      return result(errors, null);
    }

    // Commit the transaction if everything was successful
    await connection.commit();
    return result(null, { message: "All payments updated successfully" });
  } catch (error) {
    // Rollback in case of any other error
    if (connection) await connection.rollback();
    return result([{ error: error.message }], null);
  } finally {
    if (connection) connection.release();
  }
};

Pembayaran.updateSuccess = async (newPayment, result) => {
  const { dataPayment, dataUsers, order_id, redirect_url } = newPayment; // Ekstrak dataPayment dari newPayment
  let completedUpdates = 0; // Untuk menghitung jumlah update yang sudah selesai
  let errors = []; // Untuk menyimpan error jika ada

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
  // Iterasi melalui setiap item dalam dataPayment
  dataPayment.forEach(async (paymentData, index) => {
    const [schoolRes] = await paymentConnection.query(
      "SELECT * FROM school WHERE id = ?",
      [dataUsers.school_id]
    );
    if (schoolRes.length === 0) {
      throw new Error("School not found");
    }

    const balance = schoolRes[0].balance;
    // console.log(balance);

    if (balance <= 10000) {
      throw new Error("Saldo tidak cukup");
    }
    // console.log(balance);

    const [affiliateRes] = await paymentConnection.query(
      "SELECT * FROM affiliate WHERE school_id = ?",
      [dataUsers.school_id] // Use appropriate user_id or school_id
    );
    let total_affiliate = 0;

    // Iterate through each affiliate record and sum the amount
    affiliateRes.forEach((affiliate) => {
      total_affiliate += affiliate.amount * dataPayment.length; // Accumulate the amount
    });

    if (balance < total_affiliate) {
      throw new Error("Saldo tidak cukup aff");
    }

    // console.log(affiliateRes);

    if (affiliateRes.length === 0) {
      throw new Error("No affiliates found");
    }

    const newBalance = balance - total_affiliate;
    // console.log(newBalance);

    await paymentConnection.query(
      "UPDATE school SET balance = ? WHERE id = ?",
      [newBalance, dataUsers.school_id]
    );

    // Handle affiliate transactions
    affiliateRes.map(async (affiliate) => {
      const totalByAff =
        affiliate.debit + affiliate.amount * dataPayment.length; // Adjust as necessary

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
          dataUsers.school_id, // or the appropriate school_id
          paymentData.id,
          affiliate.amount,
          "BULANAN",
          "IN",
          new Date(),
        ]
      );
    });

    const kasData = {
      school_id: dataUsers.school_id,
      user_id: dataUsers.user_id,
      deskripsi: `Kas Masuk Berhasil oleh ID Users: ${dataUsers.user_id}, dengan id pembayaran bulanan: ${paymentData.id}`,
      type: "DEBIT",
      amount: paymentData.total_payment + total_affiliate,
      flag: 0,
      years: paymentData.years,
    };

    await insertKas(kasData).then((response) => {
      console.log(response);
    });

    // Log the transaction
    const logData = {
      school_id: dataUsers.school_id,
      user_id: dataUsers.user_id,
      activity: "updatePaymentPendingByAdminFree",
      detail: `Pembayaran berhasil oleh ID Users: ${dataUsers.user_id}, dengan id pembayaran bulanan: ${paymentData.id}`,
      action: "Update",
      status: true,
    };

    await insertMmLogs(logData);
    // Commit the transaction

    let monthsList = [...new Set(dataPayment.map((row) => row.month))]; // Removes duplicates

    // Join the month names into a single string for message display
    const formattedMonths = monthsList.join(", ");
    
    if (index < 1) {
      db.query(
        `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
FROM template_message tm, aplikasi a 
WHERE tm.school_id=a.school_id 
AND tm.deskripsi like '%cekTransaksiSuccesMidtransByUserIdByMonth%'  
AND tm.school_id = '${dataUsers.school_id}'`,
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
              nama_lengkap: dataUsers.full_name,
              nama_pembayaran: dataUsers.sp_name,
              bulan: formattedMonths, // Replaces bulan with the list of months
              tahun: paymentData.years,
              kelas: dataUsers.class_name,
              id_pembayaran: order_id,
              nama_sekolah: dataUsers.school_name,
              jenis_pembayaran_midtrans: "Qris",
              total_midtrans: formatRupiah(
                paymentData.total_payment * dataPayment.length
              ),
            };

            // Replace placeholders in the template
            const formattedMessage = template_message.replace(
              /\$\{(\w+)\}/g,
              (_, key) => replacements[key] || ""
            );

            // Debugging output
            console.log(formattedMessage);

            // Send message with all payment details
            sendMessage(url, token, dataUsers.phone, formattedMessage);
            // Log the transaction
            const logData = {
              school_id: dataUsers.school_id,
              user_id: dataUsers.user_id,
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

    db.query(
      "UPDATE payment SET order_id = ?, metode_pembayaran = ?, redirect_url = ?, status = ?, updated_at = ? WHERE id = ?",
      [
        newPayment.order_id,
        "Online",
        newPayment.redirect_url,
        "Paid",
        new Date(),
        paymentData.id,
      ],
      (err, res) => {
        if (err) {
          console.error("Error: ", err);
          errors.push({ id: paymentData.id, error: err });
        } else if (res.affectedRows == 0) {
          // Tidak ditemukan payment dengan id tersebut
          errors.push({ id: paymentData.id, error: "not_found" });
        } else {
          console.log("Updated Payment: ", {
            id: paymentData.id,
            ...paymentData,
          });
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

Pembayaran.updatePaymentPendingByAdminFree = async (newPayment, result) => {
  const data = newPayment.dataPayment;
  const uid = `${uuidv4()}-${Date.now()}`;
  const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

  // Create MySQL connection pool
  const pool = mysql.createPool({
    host: DB_HOST, // Ganti dengan host Anda
    user: DB_USER, // Ganti dengan username Anda
    password: DB_PASSWORD, // Ganti dengan password Anda
    database: DB_NAME, // Ganti dengan nama database Anda
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  let connection;
  try {
    // Mendapatkan koneksi dari pool
    connection = await pool.getConnection();
    // Memulai transaksi
    await connection.beginTransaction();

    // Query untuk mengecek balance di tabel school berdasarkan school_id
    const [schoolRes] = await connection.query(
      "SELECT balance FROM school WHERE id = ?",
      [data.school_id]
    );

    if (schoolRes.length === 0) {
      throw new Error("School not found"); // Rollback jika school tidak ditemukan
    }

    const balance = schoolRes[0].balance;

    // Pengecekan balance
    if (balance <= 10000) {
      throw new Error("Saldo tidak cukup"); // Jika balance kurang dari 10000
    }

    if (balance < data["affiliate"]) {
      throw new Error("Insufficient balance"); // Jika balance tidak mencukupi
    }

    // Query untuk mengambil affiliate berdasarkan school_id
    const [affiliateRes] = await connection.query(
      "SELECT * FROM affiliate WHERE school_id = ?",
      [data.school_id]
    );

    if (affiliateRes.length === 0) {
      throw new Error("No affiliates found"); // Rollback jika tidak ada affiliate
    }

    // Update balance di tabel school
    const newBalance = balance - data["affiliate"];
    await connection.query("UPDATE school SET balance = ? WHERE id = ?", [
      newBalance,
      data.school_id,
    ]);

    // Insert ke tabel payment_transactions untuk setiap affiliate
    const insertPromises = affiliateRes.map(async (affiliate) => {
      const totalByAff = affiliate.debit + affiliate.amount;

      // Update affiliate's debit
      await connection.query("UPDATE affiliate SET debit = ? WHERE id = ?", [
        totalByAff,
        affiliate.id,
      ]);

      // Insert into payment_transactions
      return connection.query(
        "INSERT INTO payment_transactions (user_id, school_id, payment_id, amount, type, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          data.user_id, // user_id
          data.school_id, // school_id
          data.setting_payment_uid, // payment_id
          affiliate.amount, // amount dari affiliate
          "BEBAS", // type
          "IN", // state
          new Date(), // created_at
        ]
      );
    });
    // Tunggu semua transaksi selesai
    await Promise.all(insertPromises);

    // Insert ke payment_detail
    const [insertRes] = await connection.query(
      "INSERT INTO payment_detail (metode_pembayaran, status, created_at, uid, user_id, payment_id, setting_payment_uid, type, amount ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "Manual", // metode_pembayaran
        "Paid", // status
        new Date(), // created_at
        uid, // new field uid
        data.user_id, // new field user_id
        data.uid, // new field payment_id
        data.setting_payment_uid, // new field setting_payment_uid
        data.type, // new field type
        newPayment.total_amount, // new field amount
      ]
    );
    const kasData = {
      school_id: data.school_id,
      user_id: newPayment.admin_id,
      deskripsi: `Kas Masuk Berhasil oleh ID Admin: ${newPayment.admin_id}, dengan id pembayaran bulanan: ${data.id}`,
      type: "DEBIT",
      amount: newPayment.total_amount,
      flag: 0,
      years: data.years,
    };

    await insertKas(kasData).then((response) => {
      console.log(response);
    });

    // Log the transaction
    const logData = {
      school_id: data.school_id,
      user_id: newPayment.admin_id,
      activity: "updatePaymentPendingByAdminFree",
      detail: `Pembayaran berhasil oleh ID Admin: ${newPayment.admin_id}, dengan id pembayaran bulanan: ${data.id}`,
      action: "Update",
      status: true,
    };
    await insertMmLogs(logData);
    db.query(
      `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
       FROM template_message tm, aplikasi a 
       WHERE tm.school_id=a.school_id 
       AND tm.deskripsi = 'updatePaymentPendingByAdminFree'  
       AND tm.school_id = '${data.school_id}'`,
      async (err, queryRes) => {
        if (err) {
          console.error("Error fetching template and WhatsApp details: ", err);
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
            nama_lengkap: data.full_name,
            nama_pembayaran: data.sp_name,
            tahun: data.years,
            total_pembayaran: formatRupiah(
              newPayment.total_amount + data.affiliate
            ),
            nama_sekolah: data.school_name,
          };

          // Fungsi untuk menggantikan setiap placeholder di template
          const formattedMessage = template_message.replace(
            /\$\{(\w+)\}/g,
            (_, key) => {
              return replacements[key] || "";
            }
          );

          // Kirim pesan setelah semua pembayaran diperbarui
          sendMessage(url, token, data.phone, formattedMessage);

          const logData = {
            school_id: data.school_id,
            user_id: newPayment.admin_id,
            activity: "SendMessage",
            detail: formattedMessage,
            action: "Insert",
            status: true,
          };
          await insertMmLogs(logData);
        }
      }
    );

    // Commit transaksi jika semua query berhasil
    await connection.commit();

    console.log("Payment inserted successfully", {
      id: insertRes.insertId,
      ...newPayment,
    });
    result(null, {
      message: "Payment inserted successfully",
      id: insertRes.insertId,
      total_affiliate: data["affiliate"], // Menyertakan total affiliate di hasil
    });
  } catch (error) {
    console.error("Error during transaction: ", error);
    if (connection) await connection.rollback(); // Rollback jika ada error
    result({ message: error.message }, null); // Kembalikan pesan error
  } finally {
    if (connection) connection.release(); // Kembali ke pool koneksi
  }
};

Pembayaran.updateSiswaFree = (newPayment, result) => {
  console.log(newPayment);
  
  const data = newPayment.dataPayment;
  const uid = `${uuidv4()}-${Date.now()}`;

  db.query(
    "INSERT INTO payment_detail (order_id, metode_pembayaran, redirect_url, status, created_at, uid, user_id, payment_id, setting_payment_uid, type, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      newPayment.order_id, // order_id
      "Online", // metode_pembayaran
      newPayment.redirect_url, // redirect_url
      "Verified", // status
      new Date(), // updated_at
      uid, // new field uid
      data.user_id, // new field user_id
      data.uid, // new field payment_id
      data.setting_payment_uid, // new field setting_payment_uid
      data.type, // new field type
      newPayment.total_amount, // new field amount
    ],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null); // Return error if there is one
      } else {
        console.log("Payment inserted successfully", {
          id: res.insertId,
          ...newPayment,
        });
        db.query(
          `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
           FROM template_message tm, aplikasi a 
           WHERE tm.school_id=a.school_id 
           AND tm.deskripsi like '%updateSiswaFree%'  
           AND tm.school_id = '${data.school_id}'`,
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

              // Data yang ingin diganti dalam template_message
              const replacements = {
                nama_lengkap: data.full_name,
                id_pembayaran: newPayment.order_id,
                nama_pembayaran: data.sp_name,
                tahun: data.years,
                total_pembayaran: formatRupiah(
                  newPayment.total_amount + data.affiliate
                ),
                nama_sekolah: data.school_name,
                url_pembayaran: newPayment.redirect_url,
              };

              // Fungsi untuk menggantikan setiap placeholder di template
              const formattedMessage = template_message.replace(
                /\$\{(\w+)\}/g,
                (_, key) => {
                  return replacements[key] || "";
                }
              );

              // Kirim pesan setelah semua pembayaran diperbarui
              sendMessage(url, token, data.phone, formattedMessage);

              const logData = {
                school_id: data.school_id,
                user_id: data.user_id,
                activity: "SendMessage",
                detail: formattedMessage,
                action: "Insert",
                status: true,
              };
              await insertMmLogs(logData);
            }
          }
        );

        result(null, {
          message: "Payment inserted successfully",
          id: res.insertId,
        });
      }
    }
  );
};
Pembayaran.updateSuccessFree = async (newPayment, result) => {
  const { dataPayment, order_id, redirect_url, total_amount } = newPayment;
  const uid = `${uuidv4()}-${Date.now()}`;
  console.log(newPayment);

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

  const [schoolRes] = await paymentConnection.query(
    "SELECT * FROM school WHERE id = ?",
    [dataPayment.school_id]
  );
  if (schoolRes.length === 0) {
    throw new Error("School not found");
  }

  const balance = schoolRes[0].balance;
  // console.log(balance);

  if (balance <= 10000) {
    throw new Error("Saldo tidak cukup");
  }

  const [affiliateRes] = await paymentConnection.query(
    "SELECT * FROM affiliate WHERE school_id = ?",
    [dataPayment.school_id] // Use appropriate user_id or school_id
  );
  let total_affiliate = 0;

  // Iterate through each affiliate record and sum the amount
  affiliateRes.forEach((affiliate) => {
    total_affiliate += affiliate.amount; // Accumulate the amount
  });

  if (balance < total_affiliate) {
    throw new Error("Saldo tidak cukup aff");
  }

  // console.log(affiliateRes);

  if (affiliateRes.length === 0) {
    throw new Error("No affiliates found");
  }

  const newBalance = balance - total_affiliate;
  console.log(newBalance);

  await paymentConnection.query("UPDATE school SET balance = ? WHERE id = ?", [
    newBalance,
    dataPayment.school_id,
  ]);

  // Handle affiliate transactions
  affiliateRes.map(async (affiliate) => {
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
        dataPayment.school_id, // or the appropriate school_id
        dataPayment.id,
        affiliate.amount,
        "BULANAN",
        "IN",
        new Date(),
      ]
    );
  });

  const kasData = {
    school_id: dataPayment.school_id,
    user_id: dataPayment.user_id,
    deskripsi: `Kas Masuk Berhasil oleh ID Users: ${dataPayment.user_id}, dengan id pembayaran bulanan: ${dataPayment.id}`,
    type: "DEBIT",
    amount: total_amount + total_affiliate,
    flag: 0,
    years: dataPayment.years,
  };

  await insertKas(kasData).then((response) => {
    console.log(response);
  });

  // Log the transaction
  const logData = {
    school_id: dataPayment.school_id,
    user_id: dataPayment.user_id,
    activity: "updatePaymentPendingByAdminFree",
    detail: `Pembayaran berhasil oleh ID Users: ${dataPayment.user_id}, dengan id pembayaran bulanan: ${dataPayment.id}`,
    action: "Update",
    status: true,
  };

  await insertMmLogs(logData);

  db.query(
    `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
     FROM template_message tm, aplikasi a 
     WHERE tm.school_id=a.school_id 
     AND tm.deskripsi like '%cekTransaksiSuccesMidtransByUserIdFree%'  
     AND tm.school_id = '${dataPayment.school_id}'`,
    async (err, queryRes) => {
      if (err) {
        console.error("Error fetching template and WhatsApp details: ", err);
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
          nama_lengkap: dataPayment.full_name,
          nama_pembayaran: dataPayment.sp_name,
          tahun: dataPayment.years,
          kelas: dataPayment.class_name,
          id_pembayaran: order_id,
          nama_sekolah: dataPayment.school_name,
          jenis_pembayaran_midtrans: "Qris",
          total_midtrans: formatRupiah(total_amount),
        };

        // Fungsi untuk menggantikan setiap placeholder di template
        const formattedMessage = template_message.replace(
          /\$\{(\w+)\}/g,
          (_, key) => replacements[key] || ""
        );

        // Output hasil format pesan untuk debugging
        console.log(formattedMessage);

        // Mengirim pesan setelah semua data pembayaran diperbarui
        sendMessage(url, token, dataPayment.phone, formattedMessage);

        const logData = {
          school_id: dataPayment.school_id,
          user_id: dataPayment.user_id,
          activity: "SendMessage",
          detail: formattedMessage,
          action: "Insert",
          status: true,
        };
      
        await insertMmLogs(logData);
      }
    }
  );
  db.query(
    "INSERT INTO payment_detail (order_id, metode_pembayaran, redirect_url, status, created_at, uid, user_id, payment_id, setting_payment_uid, type, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      order_id, // order_id
      "Online", // metode_pembayaran
      redirect_url, // redirect_url
      "Paid", // status
      new Date(), // updated_at
      uid, // new field uid
      dataPayment.user_id, // new field user_id
      dataPayment.uid, // new field payment_id
      dataPayment.setting_payment_uid, // new field setting_payment_uid
      dataPayment.type, // new field type
      newPayment.total_amount, // new field amount
    ],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null); // Return error if there is one
      } else {
        console.log("Payment inserted successfully", {
          id: res.insertId,
          ...newPayment,
        });
        result(null, {
          message: "Payment inserted successfully",
          id: res.insertId,
        });
      }
    }
  );
};

module.exports = Pembayaran;

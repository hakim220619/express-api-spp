const db = require("../../config/db.config");
const axios = require("axios");

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

    console.log(res);
    result(null, res);
  });
};



const mysql = require("mysql2/promise"); // Ensure mysql2/promise is imported
require("dotenv").config();
General.cekTransaksiSuccesMidtrans = async (result) => {
  try {
    const query = `SELECT * FROM payment WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL GROUP BY order_id`;

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

      const midtransServerKey = "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k";
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );
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

      try {
        const paymentPromises = rows.map(async (payment) => {
          let paymentConnection;
          try {
            const url = `https://api.sandbox.midtrans.com/v2/${payment.order_id}/status`;

            // Make request to Midtrans API
            const response = await axios.get(url, {
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/json",
              },
            });

            const dataResponse = response.data;
            // console.log(dataResponse);
            // console.log(payment);

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
              console.log(payment);

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
                      payment.user_id, // or the appropriate school_id
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
              // Wait for all affiliate transactions to complete
              // await Promise.all(transactionPromises);
              // Commit the transaction
              await paymentConnection.commit();
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
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
General.cekTransaksiSuccesMidtransByUserIdByMonth = async (userId, result) => {
  try {
    const query = `SELECT * FROM payment WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL and user_id = ${userId} GROUP BY order_id`;

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

      const midtransServerKey = "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k";
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );
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

      try {
        const paymentPromises = rows.map(async (payment) => {
          let paymentConnection;
          try {
            const url = `https://api.sandbox.midtrans.com/v2/${payment.order_id}/status`;

            // Make request to Midtrans API
            const response = await axios.get(url, {
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/json",
              },
            });

            const dataResponse = response.data;
            // console.log(dataResponse);
            // console.log(payment);

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
              console.log(payment);

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
                      payment.user_id, // or the appropriate school_id
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
              // Wait for all affiliate transactions to complete
              // await Promise.all(transactionPromises);
              // Commit the transaction
              await paymentConnection.commit();
              console.log(
                `Payment processed and status updated for order_id: ${payment.order_id}`
              );
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

const MIDTRANS_SERVER_KEY =
  process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k"; // use environment variable for server key

General.cekTransaksiSuccesMidtransByUserIdFree = async (userId, result) => {
  try {
    const query = `SELECT pd.*, p.school_id FROM payment_detail pd, payment p WHERE pd.payment_id=p.uid AND pd.status = 'Verified' AND pd.metode_pembayaran = 'Online' AND pd.redirect_url IS NOT NULL and pd.user_id = '${userId}'`;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified
    db.query(query, async (err, rows) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log(rows);

      if (rows.length === 0) {
        console.log("No verified payments found.");
        result(null, {
          success: false,
          message: "No verified payments found.",
        });
        return;
      }

      const midtransServerKey = "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k";
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );

      try {
        for (const payment of rows) {
          const url = `https://api.sandbox.midtrans.com/v2/${payment.order_id}/status`;

          // Make request to Midtrans API
          const response = await axios.get(url, {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json",
            },
          });

          const dataResponse = response.data;
          // console.log(dataResponse);
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
              console.log(newBalance);

              // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );

              // Handle affiliate transactions
              const transactionPromises = affiliateRes.map(
                async (affiliate) => {
                  const totalByAff =
                    affiliate.debit + affiliate.amount; // Adjust as necessary

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
                      payment.user_id, // or the appropriate school_id
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
    const query = `SELECT pd.*, p.school_id FROM payment_detail pd, payment p WHERE pd.payment_id=p.uid AND pd.status = 'Verified' AND pd.metode_pembayaran = 'Online' AND pd.redirect_url IS NOT NULL`;

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

      const midtransServerKey = "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k";
      const authHeader = Buffer.from(midtransServerKey + ":").toString(
        "base64"
      );

      try {
        for (const payment of rows) {
          const url = `https://api.sandbox.midtrans.com/v2/${payment.order_id}/status`;

          // Make request to Midtrans API
          const response = await axios.get(url, {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json",
            },
          });

          const dataResponse = response.data;
          // console.log(dataResponse);
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
              console.log(newBalance);

              // Update school balance
              await paymentConnection.query(
                "UPDATE school SET balance = ? WHERE id = ?",
                [newBalance, payment.school_id]
              );

              // Handle affiliate transactions
              const transactionPromises = affiliateRes.map(
                async (affiliate) => {
                  const totalByAff =
                    affiliate.debit + affiliate.amount; // Adjust as necessary

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
                      payment.user_id, // or the appropriate school_id
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
General.getMonths = async (schoolId, result) => {
  // Siapkan query dasar
  let query = "SELECT * FROM months WHERE month_status = 'ON'";

  // Jika schoolId ada, tambahkan filter berdasarkan school_id
  const params = [];
  if (schoolId) {
    query += " AND school_id = ?";
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

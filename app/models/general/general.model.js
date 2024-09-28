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
General.cekTransaksiSuccesMidtrans = async (result) => {
  try {
    const query = `SELECT order_id, status, user_id FROM payment WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL GROUP BY order_id`;

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
          if (dataResponse.status_code == 200) {
            // If status_code is 200, update the payment status to 'Paid'
            const updateQuery = `UPDATE payment SET status = 'Paid' WHERE order_id = ?`;
            db.query(
              updateQuery,
              [payment.order_id],
              (updateErr, updateResult) => {
                if (updateErr) {
                  console.log("Error updating payment status: ", updateErr);
                } else {
                  console.log(
                    `Payment status updated for order_id: ${payment.order_id}`
                  );

                  // Fetch the affiliate amount after updating the payment status
                  const affiliateQuery = `SELECT amount, user_id FROM affiliate WHERE user_id = ?`;
                  db.query(
                    affiliateQuery,
                    [payment.user_id],
                    (affiliateErr, affiliateRows) => {
                      if (affiliateErr) {
                        console.log(
                          "Error fetching affiliate amount: ",
                          affiliateErr
                        );
                      } else {
                        if (affiliateRows.length > 0) {
                          const affiliateAmount = affiliateRows[0].amount;
                          console.log(
                            `Affiliate amount for order_id ${payment.order_id}: ${affiliateAmount}`
                          );
                        } else {
                          console.log(
                            `No affiliate record found for order_id: ${payment.order_id}`
                          );
                        }
                      }
                    }
                  );
                }
              }
            );
          }

          // Additional logic for handling different status codes can be added here
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

const MIDTRANS_SERVER_KEY =
  process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k"; // use environment variable for server key

General.cekTransaksiSuccesMidtransByUserId = async (userId, result) => {
  try {
    if (!userId) {
      return result(
        {
          success: false,
          message: "User ID is required.",
        },
        null
      );
    }

    const query = `
      SELECT order_id, status 
      FROM payment 
      WHERE status = 'Verified' 
      AND metode_pembayaran = 'Online' 
      AND redirect_url IS NOT NULL 
      AND user_id = ? 
      GROUP BY order_id
    `;

    // Fetch payment records where metode_pembayaran is Midtrans and status is Verified for a specific user_id
    const rows = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, rows) => {
        if (err) {
          console.error("Database query error: ", err);
          return reject(err);
        }
        resolve(rows);
      });
    });

    if (rows.length === 0) {
      console.log("No verified payments found for user_id:", userId);
      return result(null, {
        success: false,
        message: "No verified payments found for the given user.",
      });
    }

    const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    );

    for (const payment of rows) {
      const url = `https://api.sandbox.midtrans.com/v2/${payment.order_id}/status`;

      try {
        // Make request to Midtrans API
        const response = await axios.get(url, {
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/json",
          },
        });

        const dataResponse = response.data;
        console.log(`Response for order_id ${payment.order_id}:`, dataResponse);

        if (dataResponse.status_code == 200) {
          // If status_code is 200, update the payment status to 'Paid'
          const updateQuery = `UPDATE payment SET status = 'Paid' WHERE order_id = ?`;
          await new Promise((resolve, reject) => {
            db.query(updateQuery, [payment.order_id], (updateErr) => {
              if (updateErr) {
                console.error("Error updating payment status: ", updateErr);
                return reject(updateErr);
              }
              console.log(
                `Payment status updated for order_id: ${payment.order_id}`
              );
              resolve();
            });
          });
        }
      } catch (apiError) {
        console.error(
          `Error checking status for order_id ${payment.order_id}:`,
          apiError
        );
        // Continue to the next payment if there's an error with Midtrans API
      }
    }

    result(null, {
      success: true,
      message: "Transactions checked and updated successfully.",
    });
  } catch (error) {
    console.error("Error during transaction check:", error);
    result(error, null);
  }
};

General.cekTransaksiSuccesMidtransFree = async (result) => {
  try {
    const query = `SELECT order_id, status FROM payment_detail WHERE status = 'Verified' AND metode_pembayaran = 'Online' AND redirect_url IS NOT NULL GROUP BY order_id`;

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
          console.log(dataResponse);

          if (dataResponse.status_code == 200) {
            console.log(dataResponse);

            // If status_code is 200, update the payment status to 'Paid'
            const updateQuery = `UPDATE payment_detail SET status = 'Paid' WHERE order_id = ?`;
            db.query(
              updateQuery,
              [payment.order_id],
              (updateErr, updateResult) => {
                if (updateErr) {
                  console.log("Error updating payment status: ", updateErr);
                } else {
                  console.log(
                    `Payment status updated for order_id: ${payment.order_id}`
                  );
                }
              }
            );
          }

          // Additional logic for handling different status codes can be added here
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
        console.log(
          `Affiliate amount for order_id : ${affiliateAmount}`
        );
      } else {
        console.log(
          `No affiliate record found for order_id: `
        );
      }
    }
  });
};

module.exports = General;

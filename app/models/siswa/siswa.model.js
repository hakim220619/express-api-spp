const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
// constructor
const Siswa = function (data) {
  this.uid = data.uid;
  this.nisn = data.nisn;
  this.unit_id = data.unit_id;
  this.school_id = data.school_id || null; // Fallback to null if not provided

  // Email, fullName, and other essential fields
  this.email = data.email;
  this.full_name = data.full_name;
  this.date_of_birth = data.date_of_birth || null; // Handling case if dob is not provided
  this.address = data.address;
  this.phone = data.phone;
  this.role = data.role;
  this.major_id = data.major_id;
  this.class_id = data.class_id;

  // Password (conditionally set if available)
  if (data.password != undefined) {
    this.password = data.password;
  }
  this.image = data.image || null; // Handling case if image is not provided
  // Status (Active by default if not provided)
  this.status = data.status || "ON";

  // Timestamps and created/updated information
  this.created_at = data.created_at || new Date(); // Use current date if not provided
};

Siswa.create = (newUsers, result) => {
  db.query("INSERT INTO users SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Admin: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};
const axios = require("axios");

Siswa.registerSiswa = (newUsers, result) => {
  // Tentukan query dan parameter berdasarkan apakah ada unit_id atau tidak
  let queryUnit = `SELECT * FROM unit WHERE school_id = '${newUsers.school_id}' and `;

  console.log(newUsers.unit_name);

  if (newUsers.unit_id) {
    // Cek apakah newUsers.unit_id ada dan terdefinisi
    queryUnit += `id = '${newUsers.unit_id}'`;
  } else {
    queryUnit += `unit_name = '${newUsers.unit_name}'`;
  }


  // Eksekusi query untuk mendapatkan data unit
  db.query(queryUnit, (err, unitData) => {
    if (err) {
      console.log("Unit Query error: ", err);
      result(err, null);
      return;
    }

    if (unitData.length === 0) {
      console.log("Unit tidak ditemukan.");
      result({ message: "Unit tidak ditemukan" }, null);
      return;
    }

    // Tambahkan unit_id ke newUsers jika tidak ada, lalu hapus unit_name
    newUsers.unit_id = unitData[0].id;
    delete newUsers.unit_name;

    // Query untuk mendapatkan setting_payment berdasarkan school_id, unit_id, dan years
    db.query(
      `SELECT * FROM setting_ppdb WHERE school_id = ? AND unit_id = ? AND years = ?`,
      [newUsers.school_id, newUsers.unit_id, newUsers.years],
      (err, paymentSetting) => {
        if (err) {
          console.log("Payment Setting Query error: ", err);
          result(err, null);
          return;
        }

        if (paymentSetting.length === 0) {
          console.log("Setting pembayaran tidak ditemukan.");
          result({ message: "Setting pembayaran tidak ditemukan" }, null);
          return;
        }

        // Jika setting pembayaran ditemukan, lanjut ke proses insert calon_siswa
        db.query("INSERT INTO calon_siswa SET ?", newUsers, (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }

          // Lanjutkan dengan query aplikasi untuk mendapatkan konfigurasi Midtrans
          db.query(
            `SELECT urlCreateTransaksiMidtrans, serverKey 
             FROM aplikasi 
             WHERE school_id = ?`,
            [newUsers.school_id],
            (err, appData) => {
              if (err) {
                console.log("Query error: ", err);
                result(err, null);
                return;
              }

              db.query(
                `SELECT * FROM affiliate WHERE school_id = ?`,
                [newUsers.school_id],
                (err, affiliateData) => {
                  console.log(affiliateData);
                  
                  if (err) {
                    console.log("Affiliate Query error: ", err);
                    result(err, null);
                    return;
                  }

                  if (appData.length > 0) {
                    const midtransUrl = appData[0].urlCreateTransaksiMidtrans;
                    const serverKey = appData[0].serverKey;
                    const nominal =
                      paymentSetting[0].amount + affiliateData[0].amount;

                    const midtransPayload = {
                      transaction_details: {
                        order_id: `${newUsers.no_registrasi}-${Date.now()}`,
                        gross_amount: nominal,
                      },
                      credit_card: { secure: true },
                      customer_details: {
                        first_name: newUsers.full_name,
                        last_name: newUsers.no_registrasi,
                        email: newUsers.email,
                        phone: newUsers.phone,
                        billing_address: {
                          first_name: newUsers.full_name,
                          last_name: newUsers.no_registrasi,
                          address: `NISN: ${newUsers.phone}`,
                          country_code: "IDN",
                        },
                      },
                    };

                    axios
                      .post(midtransUrl, midtransPayload, {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Basic ${Buffer.from(
                            `${serverKey}:`
                          ).toString("base64")}`,
                        },
                      })
                      .then((response) => {
                        const transactionToken = response.data.token;
                        const redirectUrl = response.data.redirect_url;
                        const orderId =
                          midtransPayload.transaction_details.order_id;

                        db.query(
                          `UPDATE calon_siswa 
                               SET order_id = ?, redirect_url = ?, status_pembayaran = 'Pending' 
                               WHERE id = ?`,
                          [orderId, redirectUrl, res.insertId],
                          (err, updateRes) => {
                            if (err) {
                              console.log("Update error: ", err);
                              result(err, null);
                              return;
                            }

                            db.query(
                              `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
                                   FROM template_message tm, aplikasi a 
                                   WHERE tm.school_id=a.school_id 
                                   AND tm.deskripsi LIKE '%registrasiSiswa%'  
                                   AND tm.school_id = ?`,
                              [newUsers.school_id],
                              (err, queryRes) => {
                                if (err) {
                                  console.log("Query error: ", err);
                                  result(err, null);
                                  return;
                                }

                                if (queryRes.length > 0) {
                                  const {
                                    urlWa: url,
                                    token_whatsapp: token,
                                    sender,
                                    message: template_message,
                                  } = queryRes[0];

                                  const replacements = {
                                    nama_lengkap: newUsers.full_name,
                                    no_registrasi: newUsers.no_registrasi,
                                    nik: newUsers.nik,
                                    no_wa: newUsers.phone,
                                    tahun: newUsers.years,
                                    redirect_pembayaran: redirectUrl,
                                  };

                                  const formattedMessage =
                                    template_message.replace(
                                      /\$\{(\w+)\}/g,
                                      (_, key) => replacements[key] || ""
                                    );

                                  sendMessage(
                                    url,
                                    token,
                                    newUsers.phone,
                                    formattedMessage
                                  );
                                }

                                console.log("created Siswa: ", {
                                  id: res.insertId,
                                  ...newUsers,
                                });
                                result(null, {
                                  id: res.insertId,
                                  ...newUsers,
                                  midtransUrl: redirectUrl,
                                });
                              }
                            );
                          }
                        );
                      })
                      .catch((error) => {
                        console.log(
                          "Midtrans Error:",
                          error.response ? error.response.data : error.message
                        );
                        result(error, null);
                      });
                  } else {
                    console.log(
                      "No Midtrans configuration found for the school."
                    );
                    result({ message: "Midtrans configuration missing" }, null);
                  }
                }
              );
            }
          );
        });
      }
    );
  });
};

Siswa.update = (newUsers, result) => {
  console.log(newUsers);

  db.query(
    "UPDATE users SET ? WHERE uid = ?",
    [newUsers, newUsers.uid],
    (err, res) => {
      console.log(res);
      if (err) {
        console.error("Error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        // Not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      // console.log("Updated User: ", { id: newUsers.uid, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};

Siswa.listSiswa = (fullName, school_id, major, clas, unit_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, u.*, r.role_name, s.school_name, c.class_name, m.major_name, ut.unit_name, s.address as school_address FROM users u, role r, school s, class c, major m, unit ut WHERE u.role=r.id AND u.school_id=s.id AND u.class_id=c.id and u.major_id=m.id and u.unit_id=ut.id and u.role = '160'";

  if (fullName) {
    query += ` AND u.full_name like '%${fullName}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (major) {
    query += ` AND u.major_id = '${major}'`;
  }
  if (clas) {
    query += ` AND u.class_id = '${clas}'`;
  }
  if (unit_id) {
    query += ` AND u.unit_id = '${unit_id}'`;
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
Siswa.delete = (uid, result) => {
  let query = `DELETE FROM users WHERE uid = '${uid}'`;
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
Siswa.detailSiswa = async (uid, result) => {
  let query =
    "SELECT u.*, r.role_name, s.school_name FROM users u, role r, school s WHERE u.role=r.id AND u.school_id=s.id AND u.uid = '" +
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

const moment = require("moment");
const { sendMessage } = require("../../helpers/helper");

Siswa.uploadSiswa = async (dataAll, callback) => {
  try {
    const {
      school_id,
      "NAMA YAYASAN": namaYayasan,
      UNIT: unit,
      NISN: nisn,
      "NAMA LENGKAP": namaLengkap,
      EMAIL: email,
      "NO WA": noWa,
      "TANGGAL LAHIR": tanggalLahir,
      ALAMAT: alamat,
      KELAS: kelas,
      JURUSAN: jurusan,
    } = dataAll;

    const checkSchoolQuery = `SELECT * FROM unit WHERE school_id = ? AND unit_name LIKE ?`;
    const likeNamaYayasan = `%${unit}%`;

    const unitResult = await new Promise((resolve, reject) => {
      db.query(
        checkSchoolQuery,
        [school_id, likeNamaYayasan],
        (err, results) => {
          if (err) {
            console.error("Error checking school: ", err);
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    if (unitResult.length > 0) {
      const classQuery = `SELECT * FROM class WHERE school_id = ? AND class_name = ?`;
      const classResult = await new Promise((resolve, reject) => {
        db.query(classQuery, [school_id, kelas], (err, results) => {
          if (err) {
            console.error("Error checking class: ", err);
            return reject(err);
          }
          resolve(results);
        });
      });

      const majorQuery = `SELECT * FROM major WHERE school_id = ? AND major_name LIKE ?`;
      const likeJurusan = `%${jurusan}%`;
      const majorResult = await new Promise((resolve, reject) => {
        db.query(majorQuery, [school_id, likeJurusan], (err, results) => {
          if (err) {
            console.error("Error checking major: ", err);
            return reject(err);
          }
          resolve(results);
        });
      });

      const hashedPassword = await bcrypt.hash("12345678", 10); // Hash the password
      // const formattedDate = new Date(tanggalLahir).toLocaleDateString('en-CA');
      const formattedDate = moment(tanggalLahir).format("YYYY-MM-DD");

      const insertQuery = `INSERT INTO users (uid, school_id, unit_id, nisn, full_name, email, phone, date_of_birth, address, class_id, major_id, status, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await new Promise((resolve, reject) => {
        db.query(
          insertQuery,
          [
            uuidv4(),
            school_id,
            unitResult[0].id,
            nisn,
            namaLengkap,
            email,
            noWa,
            tanggalLahir,
            alamat,
            classResult.length > 0 ? classResult[0].id : null,
            majorResult.length > 0 ? majorResult[0].id : null,
            "ON",
            hashedPassword,
            160,
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting data: ", err);
              return reject(err);
            }
            resolve(result);
          }
        );
      });

      // Successful insertion response
      callback(null, {
        status: "success",
        message: "Data inserted successfully",
        data: {
          uid: uuidv4(),
          school_id,
          unit_id: unitResult[0].id,
          nisn,
          full_name: namaLengkap,
          email,
          phone: noWa,
          date_of_birth: tanggalLahir,
          address: alamat,
          class_id: classResult.length > 0 ? classResult[0].id : null,
          major_id: majorResult.length > 0 ? majorResult[0].id : null,
        },
      });
    } else {
      // No matching school found response
      callback(null, {
        status: "error",
        message: "No matching school found.",
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Error response
    callback(null, {
      status: "error",
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};

module.exports = Siswa;

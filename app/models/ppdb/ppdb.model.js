const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { sendMessage } = require("../../helpers/helper");
const { default: axios } = require("axios");
// constructor
const Ppdb = function (data) {
  this.id = data.uid;
};

Ppdb.createSettingPpdb = (newUsers, result) => {
  console.log(newUsers);

  db.query("INSERT INTO setting_ppdb SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created setting Ppdb: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Ppdb.sendDataSiswaBaruAll = (newUsers, result) => {
  const query = `
    INSERT INTO calon_siswa_detail SET ?
    ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    nick_name = VALUES(nick_name),
    gender = VALUES(gender),
    nik = VALUES(nik),
    nisn = VALUES(nisn),
    birth_place_date = VALUES(birth_place_date),
    birth_date = VALUES(birth_date),
    birth_cert_no = VALUES(birth_cert_no),
    address = VALUES(address),
    religion = VALUES(religion),
    rt = VALUES(rt),
    rw = VALUES(rw),
    dusun = VALUES(dusun),
    kecamatan = VALUES(kecamatan),
    school = VALUES(school),
    siblings = VALUES(siblings),
    transportation = VALUES(transportation),
    travel_hours = VALUES(travel_hours),
    travel_minutes = VALUES(travel_minutes),
    distance_in_km = VALUES(distance_in_km),
    distance_to_school = VALUES(distance_to_school),
    height = VALUES(height),
    weight = VALUES(weight),
    mobile_phone = VALUES(mobile_phone),
    phone = VALUES(phone),
    home_phone = VALUES(home_phone),
    email = VALUES(email),
    kps_number = VALUES(kps_number),
    kps_receiver = VALUES(kps_receiver),
    father_name = VALUES(father_name),
    father_nik = VALUES(father_nik),
    father_birth_year = VALUES(father_birth_year),
    father_education = VALUES(father_education),
    father_job = VALUES(father_job),
    father_income = VALUES(father_income),
    mother_name = VALUES(mother_name),
    mother_nik = VALUES(mother_nik),
    mother_birth_year = VALUES(mother_birth_year),
    mother_education = VALUES(mother_education),
    mother_job = VALUES(mother_job),
    mother_income = VALUES(mother_income),
    guardian_name = VALUES(guardian_name),
    guardian_nik = VALUES(guardian_nik),
    guardian_birth_year = VALUES(guardian_birth_year),
    guardian_education = VALUES(guardian_education),
    guardian_job = VALUES(guardian_job),
    guardian_income = VALUES(guardian_income),
    kartu_keluarga = VALUES(kartu_keluarga),
    akte_lahir = VALUES(akte_lahir),
    ktp_orangtua = VALUES(ktp_orangtua),
    ijasah = VALUES(ijasah),
    created_at = VALUES(created_at)
  `;

  db.query(query, [newUsers], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    const isUpdate = res.affectedRows > 1;

    if (isUpdate) {
      console.log("Updated calon_siswa_detail: ", {
        id: newUsers.cs_id,
        ...newUsers,
      });
      result(null, { id: newUsers.cs_id, ...newUsers });
    } else {
      console.log("Created calon_siswa_detail: ", {
        id: res.insertId || newUsers.cs_id,
        ...newUsers,
      });
      result(null, { id: res.insertId || newUsers.cs_id, ...newUsers });
    }
  });
};

Ppdb.update = (newUsers, result) => {
  db.query(
    "UPDATE calon_siswa SET ? WHERE id = ?",
    [newUsers, newUsers.id],
    (err, res) => {
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
      console.log("Updated User: ", { id: newUsers.id, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};
Ppdb.reviewAndMasukanBySiswa = (id, review, result) => {
  const query = "UPDATE calon_siswa SET review = ? WHERE id = ?";

  db.query(query, [review, id], (err, res) => {
    if (err) {
      console.error("Error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows === 0) {
      // Tidak ditemukan user dengan id tersebut
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Review berhasil diupdate: ", { id: id, review: review });
    result(null, { id: id, review: review });
  });
};

Ppdb.listPpdb = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, cs.*, u.unit_name, s.school_name  FROM calon_siswa cs, school s, unit u WHERE cs.school_id=s.id AND cs.unit_id=u.id";

  if (full_name) {
    query += ` AND cs.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND cs.school_id = '${school_id}'`;
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
Ppdb.listSettingPpdb = (unit_id, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, cs.*, u.unit_name, s.school_name  FROM setting_ppdb cs, school s, unit u WHERE cs.school_id=s.id AND cs.unit_id=u.id";

  if (unit_id) {
    query += ` AND cs.unit_id like '%${unit_id}%'`;
  }
  if (school_id) {
    query += ` AND cs.school_id = '${school_id}'`;
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
Ppdb.delete = (uid, result) => {
  let query = `DELETE FROM calon_siswa WHERE id = '${uid}'`;
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
const fs = require("fs");
const path = require("path");

Ppdb.deleteSettingPpdb = (uid, result) => {
  // Query untuk mengambil data berdasarkan ID
  let selectQuery = `SELECT school_id, image FROM setting_ppdb WHERE id = '${uid}'`;

  // Jalankan query SELECT
  db.query(selectQuery, (err, selectRes) => {
    if (err) {
      console.log("Select error: ", err);
      result(err, null);
      return;
    }

    if (selectRes.length === 0) {
      console.log(`No entry found with ID ${uid}`);
      result({ message: "No entry found" }, null);
      return;
    }

    // Dapatkan school_id dan filename dari hasil SELECT
    const { school_id, image } = selectRes[0];

    // Tentukan path file yang akan dihapus
    const filePath = path.resolve(
      "uploads",
      "school",
      "siswa_baru",
      school_id.toString(),
      image
    );

    // Hapus file gambar
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("File deletion error: ", err);
        // Tidak menghentikan proses meskipun ada kesalahan dalam penghapusan file
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });

    // Query untuk menghapus data dari database
    let deleteQuery = `DELETE FROM setting_ppdb WHERE id = '${uid}'`;

    // Jalankan query DELETE
    db.query(deleteQuery, (err, res) => {
      if (err) {
        console.log("Delete error: ", err);
        result(err, null);
        return;
      }

      console.log(`Deleted user with ID ${uid}`);
      result(null, res);
    });
  });
};

Ppdb.detailPpdb = async (id, result) => {
  let query = "SELECT * from calon_siswa where id = '" + id + "'";
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
Ppdb.detailSiswaBaru = async (id, result) => {
  // Step 1: Query personal_access_tokens to get uid based on the provided id
  let uidQuery = "SELECT * FROM personal_access_tokens WHERE token = ?";

  db.query(uidQuery, [id], (err, uidRes) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Check if uid was found
    if (uidRes.length === 0) {
      console.log("No uid found for the given id");
      result(null, { message: "No uid found for the given id" });
      return;
    }

    const tokenable_id = uidRes[0].tokenable_id;

    // Step 2: Now query calon_siswa using the found uid
    let query = "SELECT * FROM calon_siswa WHERE id = ?";

    db.query(query, [tokenable_id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("students: ", res);
      result(null, res[0]);
    });
  });
};
Ppdb.detailCalonSiswaBaru = async (id, result) => {
  // Step 1: Query personal_access_tokens to get uid based on the provided id
  let uidQuery = "SELECT * FROM personal_access_tokens WHERE token = ?";

  db.query(uidQuery, [id], (err, uidRes) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Check if uid was found
    if (uidRes.length === 0) {
      console.log("No uid found for the given id");
      result(null, { message: "No uid found for the given id" });
      return;
    }

    const tokenable_id = uidRes[0].tokenable_id;

    // Step 2: Now query calon_siswa using the found uid
    let query = "SELECT * FROM calon_siswa_detail WHERE cs_id = ?";

    db.query(query, [tokenable_id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("students: ", res);
      result(null, res[0]);
    });
  });
};

const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};

Ppdb.verifikasiSiswaBaru = async (id, result) => {
  try {
    // Step 1: Select the student by id to get date_of_birth and nik
    let selectQuery = "SELECT * FROM calon_siswa WHERE id = ?";

    db.query(selectQuery, [id], async (err, res) => {
      if (err) {
        console.log("Error while selecting student: ", err);
        result(null, err);
        return;
      }

      if (res.length === 0) {
        console.log("Student not found with id: ", id);
        result({ message: "Student not found" }, null);
        return;
      }

      // Step 2: Extract the date_of_birth and nik from the selected student
      const { date_of_birth, nik, school_id, phone } = res[0];

      // Step 3: Extract the year from date_of_birth
      const yearOfBirth = new Date(date_of_birth).getFullYear();
      const dob = new Date(date_of_birth);

      // Mengambil tahun, bulan, dan tanggal
      const tahun = dob.getFullYear();
      const bulan = dob.getMonth() + 1;
      const tanggal = dob.getDate();

      // Step 4: Get the highest username prefix (3-digit number) from the database
      let prefixQuery = `
        SELECT MAX(CAST(SUBSTRING(username, 1, 3) AS UNSIGNED)) AS maxPrefix 
        FROM calon_siswa
      `;

      db.query(prefixQuery, [], async (prefixErr, prefixRes) => {
        if (prefixErr) {
          console.log("Error while fetching max prefix: ", prefixErr);
          result(null, prefixErr);
          return;
        }

        // Jika tidak ada prefix, mulai dari 1; jika ada, tambahkan 1
        const nextPrefix = (prefixRes[0].maxPrefix || 0) + 1;
        const formattedPrefix = String(nextPrefix).padStart(3, "0"); // Contoh: 001, 002, ...
        const lastThreeDigitsNik = nik.slice(-3);
        // Step 5: Create the username using the prefix, year of birth, and nik
        const username = `${formattedPrefix}${yearOfBirth}${lastThreeDigitsNik}`;
        console.log(username);

        const randomPassword = generateRandomPassword();

        // Step 6: Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Step 7: Update username and hashed password for the student with the given id
        let updateQuery =
          "UPDATE calon_siswa SET username = ?, password = ?, status = ? WHERE id = ?";

        db.query(
          updateQuery,
          [username, hashedPassword, "Verification", id],
          (updateErr, updateRes) => {
            if (updateErr) {
              console.log("Error while updating student: ", updateErr);
              result(null, updateErr);
              return;
            }

            db.query(
              `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender 
               FROM template_message tm, aplikasi a 
               WHERE tm.school_id = a.school_id 
                 AND tm.deskripsi LIKE '%verifikasiSiswa%'  
                 AND tm.school_id = ?`,
              [school_id],
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

                  // Data to replace in the template message
                  const replacements = {
                    username: username,
                    password: randomPassword,
                    tanggal_lahir: tahun + "-" + bulan + "-" + tanggal,
                    nik: nik,
                  };

                  // Replace placeholders in the template_message
                  const formattedMessage = template_message.replace(
                    /\$\{(\w+)\}/g,
                    (_, key) => {
                      return replacements[key] || "";
                    }
                  );

                  // Send message after creating the payment
                  sendMessage(url, token, phone, formattedMessage);
                }
              }
            );

            // Optionally, return the updated student data or a success message
            result(null, {
              message: "Student updated successfully",
              id,
              username, // Return the newly created username
              password: randomPassword, // Return the hashed password
              date_of_birth,
              nik,
            });
          }
        );
      });
    });
  } catch (error) {
    console.log("Error in verification process: ", error);
    result(null, error);
  }
};

Ppdb.terimaSiswaBaru = async (id, result) => {
  try {
    // Step 1: Select the student by id to get date_of_birth and nik
    let selectQuery = "SELECT * FROM calon_siswa WHERE id = ?";

    db.query(selectQuery, [id], async (err, res) => {
      if (err) {
        console.log("Error while selecting student: ", err);
        result(null, err);
        return;
      }

      if (res.length === 0) {
        console.log("Student not found with id: ", id);
        result({ message: "Student not found" }, null);
        return;
      }
      // Step 7: Update username and hashed password for the student with the given id
      let updateQuery = "UPDATE calon_siswa SET status = ? WHERE id = ?";

      db.query(updateQuery, ["Accepted", id], (updateErr, updateRes) => {
        if (updateErr) {
          console.log("Error while updating student: ", updateErr);
          result(null, updateErr);
          return;
        }
        // db.query(
        //   `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender
        //    FROM template_message tm, aplikasi a
        //    WHERE tm.school_id=a.school_id
        //    AND tm.deskripsi LIKE '%verifikasiSiswa%'
        //    AND tm.school_id = ?`,
        //   [school_id],
        //   (err, queryRes) => {
        //     if (err) {
        //       console.log("Query error: ", err);
        //       result(err, null);
        //       return;
        //     }

        //     if (queryRes.length > 0) {
        //       const {
        //         urlWa: url,
        //         token_whatsapp: token,
        //         sender,
        //         message: template_message,
        //       } = queryRes[0];

        //       // Data to replace in the template message
        //       const replacements = {
        //         username: username,
        //         password: randomPassword,
        //         tanggal_lahir: tahun + '-' + bulan + '-' + tanggal,
        //         nik: nik,
        //       };

        //       // Replace placeholders in the template_message
        //       const formattedMessage = template_message.replace(
        //         /\$\{(\w+)\}/g,
        //         (_, key) => {
        //           return replacements[key] || "";
        //         }
        //       );
        //       // Send message after creating the payment
        //       sendMessage(url, token, phone, formattedMessage);
        //     }
        //   }
        // );
        // Optionally, return the updated student data or a success message
        result(null, {
          message: "Student updated successfully",
        });
      });
    });
  } catch (error) {
    console.log("Error in verification process: ", error);
    result(null, error);
  }
};
Ppdb.tolakSiswaBaru = async (id, result) => {
  try {
    // Step 1: Select the student by id to get date_of_birth and nik
    let selectQuery = "SELECT * FROM calon_siswa WHERE id = ?";

    db.query(selectQuery, [id], async (err, res) => {
      if (err) {
        console.log("Error while selecting student: ", err);
        result(null, err);
        return;
      }

      if (res.length === 0) {
        console.log("Student not found with id: ", id);
        result({ message: "Student not found" }, null);
        return;
      }
      // Step 7: Update username and hashed password for the student with the given id
      let updateQuery = "UPDATE calon_siswa SET status = ? WHERE id = ?";

      db.query(updateQuery, ["Rejected", id], (updateErr, updateRes) => {
        if (updateErr) {
          console.log("Error while updating student: ", updateErr);
          result(null, updateErr);
          return;
        }
        // db.query(
        //   `SELECT tm.*, a.urlWa, a.token_whatsapp, a.sender
        //    FROM template_message tm, aplikasi a
        //    WHERE tm.school_id=a.school_id
        //    AND tm.deskripsi LIKE '%verifikasiSiswa%'
        //    AND tm.school_id = ?`,
        //   [school_id],
        //   (err, queryRes) => {
        //     if (err) {
        //       console.log("Query error: ", err);
        //       result(err, null);
        //       return;
        //     }

        //     if (queryRes.length > 0) {
        //       const {
        //         urlWa: url,
        //         token_whatsapp: token,
        //         sender,
        //         message: template_message,
        //       } = queryRes[0];

        //       // Data to replace in the template message
        //       const replacements = {
        //         username: username,
        //         password: randomPassword,
        //         tanggal_lahir: tahun + '-' + bulan + '-' + tanggal,
        //         nik: nik,
        //       };

        //       // Replace placeholders in the template_message
        //       const formattedMessage = template_message.replace(
        //         /\$\{(\w+)\}/g,
        //         (_, key) => {
        //           return replacements[key] || "";
        //         }
        //       );
        //       // Send message after creating the payment
        //       sendMessage(url, token, phone, formattedMessage);
        //     }
        //   }
        // );
        // Optionally, return the updated student data or a success message
        result(null, {
          message: "Student updated successfully",
        });
      });
    });
  } catch (error) {
    console.log("Error in verification process: ", error);
    result(null, error);
  }
};

Ppdb.reloadPaymentSiswaBaru = (id, result) => {
  db.query("select * from calon_siswa where id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    const newUsers = res[0];

    // Fetch Midtrans URL and Server Key from the 'aplikasi' table
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

        // Fetch affiliate data based on school_id
        db.query(
          `SELECT * FROM affiliate WHERE school_id = ?`,
          [newUsers.school_id],
          (err, affiliateData) => {
            if (err) {
              console.log("Affiliate Query error: ", err);
              result(err, null);
              return;
            }

            if (appData.length > 0) {
              db.query(
                `SELECT amount 
                 FROM setting_ppdb 
                 WHERE school_id = ? AND unit_id = ? AND years = ?`,
                [newUsers.school_id, newUsers.unit_id, newUsers.years],
                (err, settingData) => {
                  if (err) {
                    console.log("Setting Query error: ", err);
                    result(err, null);
                    return;
                  }

                  const midtransUrl = appData[0].urlCreateTransaksiMidtrans;
                  const serverKey = appData[0].serverKey;
                  const nominal =
                    settingData[0]?.amount + affiliateData[0].amount;

                  // Create the request payload for Midtrans
                  const midtransPayload = {
                    transaction_details: {
                      order_id: `${newUsers.no_registrasi}-${Date.now()}`, // Unique order ID
                      gross_amount: nominal, // Amount from newUsers.nominal
                    },
                    credit_card: {
                      secure: true,
                    },
                    customer_details: {
                      first_name: newUsers.full_name, // Full name from newUsers
                      last_name: newUsers.no_registrasi, // Registration number
                      email: newUsers.email, // Add email if available
                      phone: newUsers.phone, // Phone number
                      billing_address: {
                        first_name: newUsers.full_name,
                        last_name: newUsers.no_registrasi,
                        address: `NISN: ${newUsers.phone}`, // Store NISN
                        country_code: "IDN", // Indonesia
                      },
                    },
                  };

                  // Axios configuration for the POST request
                  axios
                    .post(midtransUrl, midtransPayload, {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Basic ${Buffer.from(
                          `${serverKey}:`
                        ).toString("base64")}`, // Use the fetched server key
                      },
                    })
                    .then((response) => {
                      // Midtrans transaction created successfully
                      const transactionToken = response.data.token;
                      const redirectUrl = response.data.redirect_url;
                      const orderId =
                        midtransPayload.transaction_details.order_id;

                      // Update calon_siswa with order_id, redirect_url, and status
                      db.query(
                        `UPDATE calon_siswa 
                   SET order_id = ?, redirect_url = ?, status_pembayaran = 'Pending' 
                   WHERE id = ?`,
                        [orderId, redirectUrl, newUsers.id],
                        (err, updateRes) => {
                          if (err) {
                            console.log("Update error: ", err);
                            result(err, null);
                            return;
                          }

                          // Fetch template message and send WhatsApp message
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

                                // Data to replace in the template message
                                const replacements = {
                                  nama_lengkap: newUsers.full_name,
                                  no_registrasi: newUsers.no_registrasi,
                                  nik: newUsers.nik,
                                  no_wa: newUsers.phone,
                                  tahun: new Date().getFullYear(),
                                  redirect_pembayaran: redirectUrl, // Add Midtrans URL here
                                };

                                // Replace placeholders in the template_message
                                const formattedMessage =
                                  template_message.replace(
                                    /\$\{(\w+)\}/g,
                                    (_, key) => {
                                      return replacements[key] || "";
                                    }
                                  );

                                // Send message after creating the payment
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
                }
              );
            } else {
              console.log("No Midtrans configuration found for the school.");
              result({ message: "Midtrans configuration missing" }, null);
            }
          }
        );
      }
    );
  });
};

module.exports = Ppdb;

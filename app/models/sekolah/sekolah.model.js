const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Sekolah = function (data) {
  // Ensure 'uid' is used consistently instead of 'id'
  this.id = data.id;
  this.school_name = data.school_name;
  this.address = data.address;
  this.phone = data.phone;
  this.bank = data.bank || null; // Fallback to null if not provided
  this.account_name = data.account_name || null; // Fallback to null if not provided
  this.account_number = data.account_number || null; // Fallback to null if not provided
  this.status = data.status || "OFF"; // Default to 'OFF' if not provided
  this.type_payment = data.type_payment || null; // Fallback to null if not provided

  // Timestamps
  this.created_at = data.created_at || new Date(); // Use current date if not provided
  this.updated_at = data.updated_at || null; // Will be set during updates
};

Sekolah.create = (newUsers, result) => {
  // Mulai transaksi
  db.query("INSERT INTO school SET ?", newUsers, (err, res) => {
    if (err) {
      return db.rollback(() => {
        console.error("Error saat memasukkan ke tabel 'school':", err);
        result(err, null);
      });
    }

    const schoolId = res.insertId;
    console.log("Created School:", { id: schoolId, ...newUsers });

    // 2. Insert ke tabel 'aplikasi'
    const aplikasiData = {
      school_id: schoolId,
      // Tambahkan field lain yang diperlukan di sini
    };
    console.log("Aplikasi Data:", aplikasiData);
    db.query(
      "INSERT INTO aplikasi SET ?",
      aplikasiData,
      (errAplikasi, resAplikasi) => {
        if (errAplikasi) {
          return db.rollback(() => {
            console.error(
              "Error saat memasukkan ke tabel 'aplikasi':",
              errAplikasi
            );
            result(errAplikasi, null);
          });
        }

        console.log("Created Aplikasi:", {
          id: resAplikasi.insertId,
          ...aplikasiData,
        });

        // 3. Insert ke tabel 'months'
        const months = [
          "JANUARI",
          "FEBRUARI",
          "MARET",
          "APRIL",
          "MEI",
          "JUNI",
          "JULI",
          "AGUSTUS",
          "SEPTEMBER",
          "OKTOBER",
          "NOVEMBER",
          "DESEMBER",
        ];

        const currentDate = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const monthsData = months.map((month, index) => [
          schoolId,
          month,
          0, // month_number dari 1-12
          "ON",
          currentDate,
        ]);

        console.log("Months Data:", monthsData);
        const insertMonthsQuery =
          "INSERT INTO months (school_id, month, month_number, month_status, created_at) VALUES ?";

        db.query(insertMonthsQuery, [monthsData], (errMonths, resMonths) => {
          if (errMonths) {
            return db.rollback(() => {
              console.error(
                "Error saat memasukkan ke tabel 'months':",
                errMonths
              );
              result(errMonths, null);
            });
          }

          console.log(
            `Inserted ${resMonths.affectedRows} records into 'months'`
          );
          result(null);
          // Commit transaksi
        });
      }
    );
  });
};

// Update Sekolah method
Sekolah.update = (newUsers, result) => {
  db.query(
    "UPDATE school SET ? WHERE id = ?",
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

Sekolah.listSekolah = (school_name, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, s.*, tp.tp_name  FROM school s, type_payment tp WHERE s.type_payment=tp.id";

  if (school_name) {
    query += ` AND c.school_name like '%${school_name}%'`;
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
Sekolah.delete = (uid, result) => {
  let query = `DELETE FROM school WHERE id = '${uid}'`;
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
Sekolah.detailSekolah = async (uid, result) => {
  let query = "SELECT * from school where id = '" + uid + "'";
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

module.exports = Sekolah;

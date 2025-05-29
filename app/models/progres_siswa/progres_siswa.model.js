const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const { sendMessage, insertMmLogs } = require("../../helpers/helper");
// constructor
const ProgresSiswa = function (data) {
  this.id = data.uid;
};

ProgresSiswa.create = (newData, result) => {

  db.query("INSERT INTO progres_siswa SET ?", newData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created ProgresSiswa: ", { id: res.insertId, ...newData });
    result(null, { id: res.insertId, ...newData });
  });
};

ProgresSiswa.update = (newData, result) => {
  console.log(newData);

  db.query(
    "UPDATE progres_siswa SET ? WHERE id = ?",
    [newData, newData.id],
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
      console.log("Updated User: ", { id: newData.id, ...newData });
      result(null, { id: newData.uid, ...newData });
    }
  );
};

ProgresSiswa.listProgresSiswa = (full_name, school_id, subjec, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, p.*, u.full_name, u.school_id  FROM progres_siswa p, users u WHERE p.user_id=u.id ";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
  }
  if (subjec) {
    query += ` AND p.subject_id = '${subjec}'`;
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

ProgresSiswa.listRekapSiswa = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, p.*, u.full_name, u.school_id, s.subject_name  FROM progres_siswa p, users u, subjects s WHERE p.user_id=u.id AND p.subject_id=s.id ";

  if (full_name) {
    query += ` AND u.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND u.school_id = '${school_id}'`;
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

ProgresSiswa.deleteProgresSiswa = (uid, result) => {
  let query = `DELETE FROM progres_siswa WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted ProgresSiswa with ID ${uid}`);
    result(null, res);
  });
};


ProgresSiswa.sendWhatsappProgresSiswa = async (data, result) => {
  console.log(data);

  let query = `select ps.*, u.full_name, u.phone, u.school_id FROM progres_siswa ps, users u WHERE ps.user_id=u.id AND ps.id = '${data.id}'`;

  try {
    // Using promise to handle db query
    const res = await new Promise((resolve, reject) => {
      db.query(query, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    const user = res[0]; // Assuming res[0] contains the user data
    const school_id = user.school_id;

    const queryApp = `SELECT a.urlWa, a.token_whatsapp, a.sender FROM aplikasi a WHERE a.school_id = '${school_id}'`;

    const queryRes = await new Promise((resolve, reject) => {
      db.query(queryApp, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    if (queryRes && queryRes.length > 0) {
      const { urlWa: url, token_whatsapp: token, sender } = queryRes[0];
      const message = data.description;

      try {
        await sendMessage(url, token, user.phone, message);
        console.log(`Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`);

        const logData = {
          school_id: school_id,
          user_id: user.id,
          activity: "sendMessageBroadcast",
          detail: `Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`,
          action: "Insert",
          status: 1,
        };

        insertMmLogs(logData);
      } catch (sendError) {
        console.error(`Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`);

        const logData = {
          school_id: school_id,
          user_id: user.id,
          activity: "sendMessageBroadcast",
          detail: `Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`,
          action: "Insert",
          status: 2,
        };

        insertMmLogs(logData);
      }
    }

    result(null, res);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    result(err, null);
  }
};
ProgresSiswa.sendProgresSiswaByWhatsapp = async (data, result) => {
  console.log(data);

  // Loop through each item in the data array
  for (let id of data) {
    let query = `select ps.*, u.full_name, u.phone, u.school_id FROM progres_siswa ps, users u WHERE ps.user_id=u.id AND ps.id = '${id}' and ps.status != 'OFF'`;

    try {
      // Using promise to handle db query
      const res = await new Promise((resolve, reject) => {
        db.query(query, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      const user = res[0]; // Assuming res[0] contains the user data
      console.log(user);

      const school_id = user.school_id;
      const description = user.description;

      const queryApp = `SELECT a.urlWa, a.token_whatsapp, a.sender FROM aplikasi a WHERE a.school_id = '${school_id}'`;

      const queryRes = await new Promise((resolve, reject) => {
        db.query(queryApp, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (queryRes && queryRes.length > 0) {
        const { urlWa: url, token_whatsapp: token, sender } = queryRes[0];
        const message = description;

        try {
          await sendMessage(url, token, user.phone, message);
          console.log(`Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`);

          const logData = {
            school_id: school_id,
            user_id: user.id,
            activity: "sendMessageBroadcast",
            detail: `Pesan berhasil dikirim ke: ${user.phone}, Message: ${message}`,
            action: "Insert",
            status: 1,
          };

          insertMmLogs(logData);
        } catch (sendError) {
          console.error(`Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`);

          const logData = {
            school_id: school_id,
            user_id: user.id,
            activity: "sendMessageBroadcast",
            detail: `Gagal mengirim pesan ke: ${user.phone}, Error: ${sendError.message}`,
            action: "Insert",
            status: 2,
          };

          insertMmLogs(logData);
        }
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      result(err, null);
      return; // Exit on first error to avoid processing further
    }
  }

  result(null, "Messages processed successfully.");
};


ProgresSiswa.detailProgresSiswa = async (uid, result) => {
  let query =
    "SELECT * from ProgresSiswa where id = '" +
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

module.exports = ProgresSiswa;

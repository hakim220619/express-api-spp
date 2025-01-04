// /helpers/messageHelper.js
const axios = require("axios");
const os = require("os");
const db = require("../config/db.config");

const sendMessage = async (url, token, receiver, message, maxRetries = 5, delay = 1000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await axios.post(
        url,
        {
          sessionId: token, // Sesuaikan key sesuai API endpoint
          number: receiver, // Nomor telepon penerima
          message: message,
        },
        {
          headers: {
            'Content-Type': 'application/json', // Set header content-type JSON
          },
        }
      );
      // Jika berhasil, kirimkan respons sukses dalam format JSON
      return {
        status: "success",
        message: "Message sent successfully",
        data: response.data,
      };
    } catch (error) {
      console.error(`Error sending message on attempt ${attempts + 1}: ${error.message}`);
      attempts++;

      // Jika jumlah maksimal percobaan belum tercapai, tunggu dan coba ulang
      if (attempts < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Jeda antar percobaan
      } else {
        // Jika gagal setelah percobaan maksimum, kirimkan respons error dalam format JSON
        return {
          status: "error",
          message: "Failed to send message after multiple attempts",
          error: error.message,
        };
      }
    }
  }
};

const getServerIp = () => {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return "127.0.0.1"; // Fallback to localhost if no other IP is found
};
const insertMmLogs = async (logData) => {
  const query = `
    INSERT INTO mm_logs (school_id, user_id, activity, detail, action, ip, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const serverIp = getServerIp();
    // Execute the SQL query using the db connection
    const [result] = await db.query(query, [
      logData.school_id,
      logData.user_id,
      logData.activity,
      logData.detail,
      logData.action,
      serverIp,
      logData.status
    ]);

    return {
      status: "success",
      message: "Log inserted successfully",
      data: result,
    };
  } catch (error) {
    console.error(`Error inserting log: ${error.message}`);
    return {
      status: "error",
      message: "Failed to insert log",
      error: error.message,
    };
  }
};

const insertKas = async (kasData) => {
  const query = `
    INSERT INTO kas (school_id, user_id, deskripsi, type, amount, flag, years, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
// console.log(kasData);

  try {
    // Execute the SQL query using the db connection
    const [result] = await db.query(query, [
      kasData.school_id,
      kasData.user_id,
      kasData.deskripsi,
      kasData.type,
      kasData.amount,
      kasData.flag,
      kasData.years
    ]);
console.log(result);

    return {
      status: "success",
      message: "Kas data inserted successfully",
      data: result,
    };
  } catch (error) {
    console.error(`Error inserting kas data: ${error.message}`);
    return {
      status: "error",
      message: "Failed to insert kas data",
      error: error.message,
    };
  }
};


const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // Menghilangkan .00 di belakang
  }).format(number);
};

module.exports = {
  sendMessage,
  formatRupiah,
  insertMmLogs,
  insertKas
};

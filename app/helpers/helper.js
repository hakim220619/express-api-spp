// /helpers/messageHelper.js
const axios = require("axios");
const db = require("../config/db.config");

const sendMessage = async (
  url,
  token,
  receiver,
  message,
  maxRetries = 5,
  delay = 1000,
  schoolId,
  userId = "2342",
  ipAddress = "1231312"
) => {
  let attempts = 0;
  let activity = "Sending Message";
  let action = "Message Sending";
  let detail = `Attempting to send message to ${receiver}`;

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
            "Content-Type": "application/json", // Set header content-type JSON
          },
        }
      );
      console.log(response.data);

      // Log the successful attempt to the mm_logs table
      await db.query(
        `INSERT INTO mm_logs (school_id, user_id, activity, detail, action, ip)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "530",
          "34234",
          activity,
          `Message sent successfully to ${receiver} and ${response}`,
          "Insert",
          "12312312",
        ]
      );

      // If the message is sent successfully, return a success response
      return {
        status: "success",
        message: "Message sent successfully",
        data: response.data,
      };
    } catch (error) {
      console.error(
        `Error sending message on attempt ${attempts + 1}: ${error.message}`
      );
      attempts++;

      // Log the failed attempt to the mm_logs table
      await db.query(
        `INSERT INTO mm_logs (school_id, user_id, activity, detail, action, ip)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          '530',
          '32434',
          activity,
          `Failed to send message to ${receiver} on attempt ${attempts}`,
          'INSERT',
          '123123123',
        ]
      );

      // Retry if maximum attempts haven't been reached
      if (attempts < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait between attempts
      } else {
        // If all attempts fail, log the failure
        await db.query(
          `INSERT INTO mm_logs (school_id, user_id, activity, detail, action, ip)
          VALUES (?, ?, ?, ?, ?, ?)`,
          
          [
            '530',
            '32434',
            activity,
           `Failed to send message after ${maxRetries} attempts`,
            'INSERT',
            '123123123',
          ]
        );

        // Return an error response
        return {
          status: "error",
          message: "Failed to send message after multiple attempts",
          error: error.message,
        };
      }
    }
  }
};

// const sendMessage = async (url, token, receiver, message, maxRetries = 5) => {
//   let attempts = 0;

//   while (attempts < maxRetries) {
//     try {
//       const response = await axios.post(
//         url,
//         {
//           api_key: token,
//           receiver: receiver,
//           data: {
//             message: message,
//           },
//         }
//       );

//       // Jika berhasil, kirimkan respons sukses dalam format JSON
//       return {
//         status: "success",
//         message: "Message sent successfully",
//         data: response.data,
//       };
//     } catch (error) {
//       console.error(`Error sending message on attempt ${attempts + 1}:`, error.message);
//       attempts++;

//       // Jika gagal dan sudah mencapai batas maksimum percobaan, kirimkan respons error
//       if (attempts >= maxRetries) {
//         return {
//           status: "error",
//           message: "Failed to send message after multiple attempts",
//           error: error.message,
//         };
//       }
//     }
//   }
// };

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
};

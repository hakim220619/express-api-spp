// /helpers/messageHelper.js
const axios = require("axios");

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

      // Retry jika jumlah maksimal percobaan belum tercapai
      if (attempts < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Jeda antar percobaan
      } else {
        // Jika gagal setelah percobaan maksimum, kirimkan respons error
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

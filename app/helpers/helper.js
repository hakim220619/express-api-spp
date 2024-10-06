// /helpers/messageHelper.js
const axios = require("axios");

const sendMessage = async (
  url,
  token,
  receiver,
  message,
  maxRetries = 5,
  delay = 1000
) => {
  let attempts = 0;
  console.log(url);

  // Keep track if response was sent to avoid multiple responses
  let responseSent = false;

  while (attempts < maxRetries && !responseSent) {
    try {
      const response = await axios.post(
        url,
        {
          sessionId: token, // Adjust the key according to the API endpoint
          number: receiver, // Recipient phone number
          message: message,
        },
        {
          headers: {
            "Content-Type": "application/json", // Set the content-type header to JSON
          },
        }
      );
      console.log(response.data);

      // If successful, return success response and mark as sent
      responseSent = true;
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

      // Retry if the max retry count has not been reached
      if (attempts < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Delay between retries
      } else {
        console.log(error.message);

        // Only send the error response if it hasn't been sent yet
        if (!responseSent) {
          responseSent = true;
          return {
            status: "error",
            message: "Failed to send message after multiple attempts",
            error: error.message,
          };
        }
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

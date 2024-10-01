// /helpers/messageHelper.js
const axios = require("axios");

const sendMessage = async (receiver, message) => {
  try {
    const response = await axios.post(
      "https://wa.sppapp.com/api/send-message",
      {
        api_key: "ea5273ea688aa6e84a437e847809837a452c33b1",
        receiver: receiver,
        data: {
          message: message,
        },
      }
    );
    console.log(response.data);

    // Jika berhasil, kirimkan respons sukses dalam format JSON
    return {
      status: "success",
      message: "Message sent successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending message:", error.message);
    console.log(error)

    // Jika gagal, kirimkan respons error dalam format JSON
    return {
      status: "error",
      message: "Failed to send message",
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
};

const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const sendOtpToPhone = async (phone, otp) => {
  //   //   const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`;
  const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/${otp}/CUSTOM`;
  const response = await axios.get(url);
  return response.data;
};

module.exports = { sendOtpToPhone };

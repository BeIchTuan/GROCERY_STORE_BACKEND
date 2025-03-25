const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN, {
    expiresIn: "1d",
  });
  return access_token;
};

module.exports = {
  generateAccessToken,
};

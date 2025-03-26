const jwt = require("jsonwebtoken");

// Middleware để xác thực JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Không có token xác thực",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Middleware kiểm tra quyền admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Không có quyền truy cập, yêu cầu quyền admin",
    });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};

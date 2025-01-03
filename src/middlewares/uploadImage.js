const multer = require("multer");

const storage = multer.memoryStorage(); // Sử dụng bộ nhớ trong
const upload = multer({ storage }).any(); // Nhận tất cả các file

module.exports = { upload };

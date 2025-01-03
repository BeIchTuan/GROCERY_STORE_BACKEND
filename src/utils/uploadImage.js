const cloudinary = require("../config/cloudinary"); // Cấu hình Cloudinary
const streamifier = require("streamifier");

/**
 * Upload ảnh lên Cloudinary
 * @param {Object} file - File ảnh từ request
 * @returns {Promise<Object>} - Kết quả upload từ Cloudinary
 */
// async function uploadToCloudinary(file, foldername) {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         { folder: foldername }, // Định nghĩa thư mục trong Cloudinary
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error); // Log chi tiết lỗi
//             return reject(error); // Trả về lỗi nếu có
//           }
//           console.log("Cloudinary upload success:", result); // Log kết quả upload
//           resolve(result); // Trả về kết quả upload thành công
//         }
//       )
//       .end(file.buffer); // Gửi file lên Cloudinary
//   });
// }

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    if (!fileBuffer) {
      return reject(new Error("File buffer is undefined"));
    }

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
/**
 * Xóa ảnh trên Cloudinary
 * @param {string} publicId - Public ID của ảnh trên Cloudinary
 * @returns {Promise<Object>} - Kết quả xóa ảnh từ Cloudinary
 */
async function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

const extractPublicId = (url) => {
  try {
    const parts = url.split("/"); // Tách URL bằng dấu "/"
    const publicIdWithExtension = parts.slice(-2).join("/"); // Lấy thư mục + public_id
    const publicId = publicIdWithExtension.split(".")[0]; // Loại bỏ phần mở rộng (.jpg, .png)
    return publicId;
  } catch (error) {
    console.error("Failed to extract public_id from URL:", url);
    throw new Error("Invalid URL format");
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, extractPublicId };

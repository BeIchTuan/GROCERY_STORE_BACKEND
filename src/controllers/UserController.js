const UserService = require("../services/UserService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} = require("../utils/uploadImage");

class UserController {
  async createUser(req, res) {
    try {
      const {
        email,
        password,
        name,
        avatar,
        birthday,
        gender,
        phone,
        address,
        role,
      } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(email);

      if (!email || !password || !role) {
        return res.status(422).json({
          status: "error",
          message: "All fields are required!",
        });
      } else if (!isEmail) {
        return res.status(422).json({
          status: "error",
          message: "Invalid email format",
        });
      }

      const response = await UserService.createUser(req.body);
      return res.status(201).json(response);
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        error: e.toString(),
      });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(email);

      if (!email || !password) {
        return res.status(422).json({
          status: "error",
          message: "All fields are required!",
        });
      } else if (!isEmail) {
        return res.status(422).json({
          status: "error",
          message: "Invalid email format",
        });
      }

      const response = await UserService.loginUser(req.body);

      if (response.status === "success") {
        res.cookie("accessToken", response.access_token, {
          httpOnly: true,
          secure: false,
          sameSite: "None",
          maxAge: 86400000, // 24 hour
        });

        const userData = {
          id: response.userId,
          email: email,
          role: response.role,
          name: response.name,
          avatar: response.avatar,
          birthday: response.birthday,
          gender: response.gender,
          phone: response.phone,
          address: response.address,
        };

        return res.status(200).json({
          status: "success",
          message: "Login successful",
          token: response.access_token,
          user: userData,
        });
      } else {
        return res.status(401).json({
          status: "error",
          message: response.message,
        });
      }
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        error: e.toString(),
      });
    }
  }

  async getAccountInfor(req, res) {
    try {
      const userId = req.id;

      const response = await UserService.getAccountInfor(userId);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        error: e.toString(),
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      // Lấy thông tin phân trang từ query params (nếu có)
      const page = parseInt(req.query.page) || 1; // Mặc định trang 1
      const itemsPerPage = parseInt(req.query.itemsPerPage) || 15; // Mặc định 10 mục trên mỗi trang

      // Gọi service để lấy danh sách người dùng với phân trang
      const result = await UserService.getAllUsers(page, itemsPerPage);

      // Trả về kết quả
      return res.status(200).json({
        status: "success",
        message: "Users fetched successfully",
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const data = req.body;

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "userID is required",
        });
      }

      // Kiểm tra role của user và lọc dữ liệu cho phép cập nhật
      let fieldsToUpdate = {};
      const {
        email,
        name,
        password,
        avatar,
        birthday,
        gender,
        phone,
        address,
      } = data;
      fieldsToUpdate = {
        email,
        name,
        password,
        avatar,
        birthday,
        gender,
        phone,
        address,
      };

      const imageUrls = [];

      console.log(req.files);
      // if (req.files) {
      //   // for (const file of filesForDetail) {
      //     const result = await uploadToCloudinary(req.files.buffer, "avatar");
      //     imageUrls.push(result.secure_url);
      //   //}
      // }

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, "avatar");
          imageUrls.push(result.secure_url);
        }
      }

      if (imageUrls.length > 0) {
        fieldsToUpdate.avatar = imageUrls[0];
      }
      const response = await UserService.updateUser(userId, fieldsToUpdate);
      return res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: response.data,
      });
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        error: e.toString(),
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "userID is required",
        });
      }

      const response = await UserService.deleteUser(userId);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        error: e.toString(),
      });
    }
  }
}

module.exports = new UserController();

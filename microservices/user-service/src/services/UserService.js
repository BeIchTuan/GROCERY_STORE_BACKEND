const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("./JwtService");

class UserService {
  static async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          status: "error",
          message: "Email already exists",
        };
      }

      // Hash password
      const salt = 10;
      const hashPassword = await bcrypt.hash(userData.password, salt);

      // Create new user
      const newUser = new User({
        email: userData.email,
        password: hashPassword,
        name: userData.name,
        avatar: userData.avatar,
        birthday: userData.birthday,
        gender: userData.gender,
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
        status: "active",
      });

      // Generate access token
      const access_token = generateAccessToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      });

      newUser.access_token = access_token;

      // Save user to database
      const savedUser = await newUser.save();

      return {
        status: "success",
        message: "User created successfully",
        data: {
          _id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async loginUser(userData) {
    try {
      // Find user by email
      const user = await User.findOne({ email: userData.email });
      if (!user) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          status: "error",
          message: "Invalid password",
        };
      }

      // Generate access token
      const access_token = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      // Update user access token
      await User.findByIdAndUpdate(user._id, { access_token });

      return {
        status: "success",
        message: "Login successful",
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        birthday: user.birthday,
        gender: user.gender,
        phone: user.phone,
        address: user.address,
        access_token,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAccountInfor(userId) {
    try {
      const user = await User.findById(userId).select(
        "-password -access_token"
      );
      if (!user) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      return {
        status: "success",
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllUsers(page, itemsPerPage) {
    try {
      // Tính toán skip để phân trang
      const skip = (page - 1) * itemsPerPage;

      // Đếm tổng số user
      const totalUsers = await User.countDocuments();

      // Lấy danh sách user với phân trang
      const users = await User.find()
        .select("-password -access_token")
        .skip(skip)
        .limit(itemsPerPage);

      // Tính toán thông tin phân trang
      const totalPages = Math.ceil(totalUsers / itemsPerPage);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalUsers,
          itemsPerPage,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateUser(userId, userData) {
    try {
      // Kiểm tra user có tồn tại không
      const user = await User.findById(userId);
      if (!user) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      // Nếu có password mới, hash password
      if (userData.password) {
        const salt = 10;
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Cập nhật thông tin user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: userData },
        { new: true }
      ).select("-password -access_token");

      return {
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteUser(userId) {
    try {
      // Kiểm tra user có tồn tại không
      const user = await User.findById(userId);
      if (!user) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      // Xóa user
      await User.findByIdAndDelete(userId);

      return {
        status: "success",
        message: "User deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UserService;

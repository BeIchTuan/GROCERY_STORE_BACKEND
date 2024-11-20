const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken } = require("./JwtService");

class UserService {
  async createUser(newUser) {
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
    } = newUser;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return {
          status: "error",
          message: "The email already exists",
        };
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

      const userData = {
        email,
        password: hashedPassword,
        name,
        avatar,
        birthday,
        gender,
        phone,
        address,
        role,
      };

      // Create the user in the database
      const createdUser = await User.create(userData);

      return {
        status: "success",
        message: "User registered successfully",
        data: createdUser,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async loginUser(userLogin) {
    const { email, password } = userLogin;

    try {
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return {
          status: "error",
          message: "The user is not defined",
        };
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        return {
          status: "error",
          message: "Invalid email or password",
        };
      }

      // Generate access token
      const access_token = await generalAccessToken({
        id: existingUser.id,
        role: existingUser.role,
      });

      return {
        status: "success",
        message: "Login successful",
        userId: existingUser._id,
        role: existingUser.role,
        name: existingUser.name,
        avatar: existingUser.avatar,
        birthday: existingUser.birthday,
        gender: existingUser.gender,
        phone: existingUser.phone,
        address: existingUser.address,
        access_token: access_token,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAccountInfor(id) {
    try {
      const user = await User.findOne({ _id: id });

      if (user === null) {
        return resolve({
          status: "error",
          message: "User not found",
        });
      }

      // Dữ liệu chung cho tất cả người dùng
      const userData = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        birthday: user.birthday,
        gender: user.gender,
        phone: user.phone,
        address: user.address,
      };

      // Trả về dữ liệu người dùng với thông tin bổ sung nếu là seller
      return {
        status: "success",
        user: userData,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUsers(page = 1, itemsPerPage = 15) {
    try {
      // Tính toán số lượng skip (bỏ qua bao nhiêu bản ghi)
      const skip = (page - 1) * itemsPerPage;
  
      // Lấy danh sách người dùng từ cơ sở dữ liệu
      const users = await User.find()
        .skip(skip) // Bỏ qua số lượng bản ghi
        .limit(itemsPerPage); // Giới hạn số lượng bản ghi trên mỗi trang
  
      // Lấy tổng số người dùng để tính tổng số trang
      const totalItems = await User.countDocuments();
  
      // Tính tổng số trang
      const totalPages = Math.ceil(totalItems / itemsPerPage);
  
      return {
        users, // Danh sách người dùng
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          itemsPerPage: itemsPerPage,
          totalItems: totalItems,
        },
      };
    } catch (error) {
      throw new Error("Failed to retrieve users: " + error.message);
    }
  };

  async updateUser(id, data) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Nếu data chứa password, mã hóa nó trước khi cập nhật
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10); // 10 salt rounds
        data.password = hashedPassword; // Thay thế mật khẩu trong data bằng mật khẩu đã mã hóa
      }

      // Cập nhật các trường hợp lệ đã được lọc trong controller
      Object.assign(user, data);
      const updatedUser = await user.save();

      return {
        status: "success",
        message: "Updated",
        data: updatedUser,
      };
    } catch (error) {
      throw new Error("Failed to update user: " + error.message);
    }
  }

  async deleteUser(id, data) {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });

      if (checkUser === null) {
        resolve({
          status: "error",
          message: "The user is not defined",
        });
      }

      await User.findByIdAndDelete(id);
      return {
        status: "success",
        message: "Delete success",
      };
    } catch (error) {
      throw new Error("Failed to update user: " + error.message);
    }
  }
}

module.exports = new UserService();

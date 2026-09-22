const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
  static async createUser(data) {
    const { username, password, role, scopeRef } = data;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      passwordHash,
      role,
      scopeRef
    });
    return await user.save();
  }

  static async getUsers() {
    return await User.find().select('-passwordHash');
  }

  static async updateUser(id, data) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-passwordHash');
  }

  static async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = UserService;

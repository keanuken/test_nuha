const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return error(res, 'Username dan password wajib diisi', 400);
    }
    const result = await authService.login(username, password);
    return success(res, result, 'Login berhasil');
  } catch (err) {
    next(err);
  }
};

const selectRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    if (!role_id) return error(res, 'role_id wajib diisi', 400);
    const result = await authService.selectRole(req.user.employee_id, role_id);
    return success(res, result, 'Role dipilih');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return error(res, 'refresh_token wajib diisi', 400);
    const result = await authService.refreshToken(refresh_token);
    return success(res, result, 'Token diperbarui');
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  // Stateless JWT — client cukup hapus token
  return success(res, null, 'Logout berhasil');
};

module.exports = { login, selectRole, refresh, logout };

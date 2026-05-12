const employeeService = require('./employee.service');
const menuService = require('../menu/menu.service');
const { success, error } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try { return success(res, await employeeService.getAll()); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password || !name) return error(res, 'username, password, name wajib diisi', 400);
    return success(res, await employeeService.create({ username, password, name, email }), 'Karyawan dibuat', 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { return success(res, await employeeService.update(req.params.id, req.body), 'Karyawan diupdate'); }
  catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await employeeService.remove(req.params.id); return success(res, null, 'Karyawan dihapus'); }
  catch (e) { next(e); }
};

const getRoles = async (req, res, next) => {
  try { return success(res, await employeeService.getRoles(req.params.id)); } catch (e) { next(e); }
};

const assignRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    if (!role_id) return error(res, 'role_id wajib diisi', 400);
    return success(res, await employeeService.assignRole(req.params.id, role_id), 'Role di-assign', 201);
  } catch (e) { next(e); }
};

const revokeRole = async (req, res, next) => {
  try {
    await employeeService.revokeRole(req.params.id, req.params.roleId);
    return success(res, null, 'Role di-revoke');
  } catch (e) { next(e); }
};

// GET /api/me/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await employeeService.getProfile(req.user.employee_id);
    return success(res, profile);
  } catch (e) { next(e); }
};

// GET /api/me/menus
const getMyMenus = async (req, res, next) => {
  try {
    const menus = await menuService.getMenusByRole(req.user.role_id);
    return success(res, menus);
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove, getRoles, assignRole, revokeRole, getProfile, getMyMenus };

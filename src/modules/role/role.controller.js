const roleService = require('./role.service');
const { success, error } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try { return success(res, await roleService.getAll()); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return error(res, 'name wajib diisi', 400);
    return success(res, await roleService.create({ name, description }), 'Role dibuat', 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { return success(res, await roleService.update(req.params.id, req.body), 'Role diupdate'); }
  catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await roleService.remove(req.params.id); return success(res, null, 'Role dihapus'); }
  catch (e) { next(e); }
};

const getMenus = async (req, res, next) => {
  try { return success(res, await roleService.getMenus(req.params.id)); } catch (e) { next(e); }
};

const assignMenu = async (req, res, next) => {
  try {
    const { menu_id } = req.body;
    if (!menu_id) return error(res, 'menu_id wajib diisi', 400);
    return success(res, await roleService.assignMenu(req.params.id, menu_id), 'Menu di-assign', 201);
  } catch (e) { next(e); }
};

const revokeMenu = async (req, res, next) => {
  try {
    await roleService.revokeMenu(req.params.id, req.params.menuId);
    return success(res, null, 'Menu di-revoke');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove, getMenus, assignMenu, revokeMenu };

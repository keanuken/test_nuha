const menuService = require('./menu.service');
const { success, error } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await menuService.getAll();
    return success(res, data);
  } catch (err) { next(err); }
};

const getTree = async (req, res, next) => {
  try {
    const data = await menuService.getTree();
    return success(res, data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, icon, path, parentId, order } = req.body;
    if (!name) return error(res, 'name wajib diisi', 400);
    const data = await menuService.create({ name, icon, path, parentId, order: order || 0 });
    return success(res, data, 'Menu berhasil dibuat', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await menuService.update(req.params.id, req.body);
    return success(res, data, 'Menu berhasil diupdate');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await menuService.remove(req.params.id);
    return success(res, null, 'Menu berhasil dihapus');
  } catch (err) { next(err); }
};

module.exports = { getAll, getTree, create, update, remove };

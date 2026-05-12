const prisma = require('../../config/database');
const { buildMenuTree } = require('../../utils/menuTree');

const getAll = async () => {
  return prisma.menu.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });
};

const getTree = async () => {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }],
  });
  return buildMenuTree(menus);
};

const getMenusByRole = async (roleId) => {
  const roleMenus = await prisma.roleMenu.findMany({
    where: { roleId, menu: { isActive: true } },
    include: { menu: true },
  });
  const menus = roleMenus.map((rm) => rm.menu);
  return buildMenuTree(menus);
};

const create = async (data) => {
  return prisma.menu.create({ data });
};

const update = async (id, data) => {
  return prisma.menu.update({ where: { id }, data });
};

const remove = async (id) => {
  return prisma.menu.delete({ where: { id } });
};

module.exports = { getAll, getTree, getMenusByRole, create, update, remove };

const prisma = require('../../config/database');

const getAll = async () => prisma.role.findMany({ orderBy: { name: 'asc' } });

const getById = async (id) => prisma.role.findUnique({ where: { id } });

const create = async (data) => prisma.role.create({ data });

const update = async (id, data) => prisma.role.update({ where: { id }, data });

const remove = async (id) => prisma.role.delete({ where: { id } });

const getMenus = async (roleId) => {
  const items = await prisma.roleMenu.findMany({
    where: { roleId },
    include: { menu: true },
  });
  return items.map((i) => i.menu);
};

const assignMenu = async (roleId, menuId) => {
  return prisma.roleMenu.upsert({
    where: { roleId_menuId: { roleId, menuId } },
    update: {},
    create: { roleId, menuId },
  });
};

const revokeMenu = async (roleId, menuId) => {
  return prisma.roleMenu.delete({ where: { roleId_menuId: { roleId, menuId } } });
};

module.exports = { getAll, getById, create, update, remove, getMenus, assignMenu, revokeMenu };

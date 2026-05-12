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

// Naik ke ancestor chain sampai ketemu menu yang punya role assignment
const findRolesViaAncestors = async (parentId) => {
  let currentId = parentId;
  while (currentId) {
    const roles = await prisma.roleMenu.findMany({
      where: { menuId: currentId },
      select: { roleId: true },
    });
    if (roles.length > 0) return roles;

    // Naik satu level
    const parent = await prisma.menu.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = parent?.parentId ?? null;
  }
  return [];
};

// Splice insert: geser semua sibling yang order >= targetOrder ke +1
const shiftSiblings = async (parentId, targetOrder, excludeId = null) => {
  await prisma.menu.updateMany({
    where: {
      parentId: parentId ?? null,
      order: { gte: targetOrder },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    data: { order: { increment: 1 } },
  });
};

const create = async (data) => {
  // Splice: geser sibling dulu sebelum insert
  await shiftSiblings(data.parentId ?? null, data.order);

  const menu = await prisma.menu.create({ data });

  // Auto-assign ke semua role yang punya akses ke ancestor menu
  if (menu.parentId) {
    const roles = await findRolesViaAncestors(menu.parentId);
    if (roles.length > 0) {
      await prisma.roleMenu.createMany({
        data: roles.map((r) => ({ roleId: r.roleId, menuId: menu.id })),
        skipDuplicates: true,
      });
    }
  }

  return menu;
};

const update = async (id, data) => {
  // Kalau order berubah, splice sibling di posisi baru
  if (data.order !== undefined) {
    const current = await prisma.menu.findUnique({ where: { id }, select: { order: true, parentId: true } });
    const newParentId = data.parentId !== undefined ? (data.parentId ?? null) : (current.parentId ?? null);

    if (data.order !== current.order) {
      await shiftSiblings(newParentId, data.order, id);
    }
  }

  return prisma.menu.update({ where: { id }, data });
};

const remove = async (id) => {
  return prisma.menu.delete({ where: { id } });
};

module.exports = { getAll, getTree, getMenusByRole, create, update, remove };

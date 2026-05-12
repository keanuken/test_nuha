/**
 * Build nested menu tree from flat array.
 * @param {Array} menus - flat list of menu objects
 * @param {string|null} parentId - starting parent (null = root)
 * @returns {Array} nested tree
 */
const buildMenuTree = (menus, parentId = null) => {
  return menus
    .filter((m) => m.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      path: m.path,
      order: m.order,
      children: buildMenuTree(menus, m.id),
    }));
};

module.exports = { buildMenuTree };

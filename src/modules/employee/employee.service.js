const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');

const getAll = async () => prisma.employee.findMany({
  select: { id: true, username: true, name: true, email: true, isActive: true, createdAt: true },
  orderBy: { name: 'asc' },
});

const create = async ({ username, password, name, email }) => {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.employee.create({
    data: { username, password: hashed, name, email },
    select: { id: true, username: true, name: true, email: true, isActive: true },
  });
};

const update = async (id, data) => {
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  return prisma.employee.update({ where: { id }, data });
};

const remove = async (id) => prisma.employee.delete({ where: { id } });

const getRoles = async (employeeId) => {
  const items = await prisma.employeeRole.findMany({
    where: { employeeId },
    include: { role: true },
  });
  return items.map((i) => i.role);
};

const assignRole = async (employeeId, roleId) => {
  return prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId, roleId } },
    update: {},
    create: { employeeId, roleId },
  });
};

const revokeRole = async (employeeId, roleId) => {
  return prisma.employeeRole.delete({ where: { employeeId_roleId: { employeeId, roleId } } });
};

const getProfile = async (employeeId) => {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true, username: true, name: true, email: true,
      roles: { include: { role: { select: { id: true, name: true } } } },
    },
  });
};

module.exports = { getAll, create, update, remove, getRoles, assignRole, revokeRole, getProfile };

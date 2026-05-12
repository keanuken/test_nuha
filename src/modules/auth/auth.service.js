const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const { jwt: jwtConfig } = require('../../config/jwt');

const login = async (username, password) => {
  const employee = await prisma.employee.findUnique({
    where: { username },
    include: {
      roles: {
        include: { role: true },
        where: { role: { isActive: true } },
      },
    },
  });

  if (!employee || !employee.isActive) {
    throw { statusCode: 401, message: 'Username atau password salah' };
  }

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Username atau password salah' };
  }

  const roles = employee.roles.map((er) => er.role);

  if (roles.length === 0) {
    throw { statusCode: 403, message: 'Karyawan tidak memiliki role aktif' };
  }

  // Single role → langsung issue full token
  if (roles.length === 1) {
    const tokens = issueTokens(employee, roles[0]);
    return {
      requires_role_selection: false,
      ...tokens,
      employee: { id: employee.id, name: employee.name, username: employee.username },
      active_role: { id: roles[0].id, name: roles[0].name },
    };
  }

  // Multi-role → issue temp token
  const tempToken = jwt.sign(
    { employee_id: employee.id, requires_role_selection: true },
    jwtConfig.secret,
    { expiresIn: jwtConfig.tempExpiresIn }
  );

  return {
    requires_role_selection: true,
    temp_token: tempToken,
    roles: roles.map((r) => ({ id: r.id, name: r.name })),
  };
};

const selectRole = async (employeeId, roleId) => {
  // Verify employee has this role
  const employeeRole = await prisma.employeeRole.findUnique({
    where: { employeeId_roleId: { employeeId, roleId } },
    include: { employee: true, role: true },
  });

  if (!employeeRole) {
    throw { statusCode: 403, message: 'Role tidak valid untuk karyawan ini' };
  }

  const tokens = issueTokens(employeeRole.employee, employeeRole.role);
  return {
    ...tokens,
    employee: {
      id: employeeRole.employee.id,
      name: employeeRole.employee.name,
      username: employeeRole.employee.username,
    },
    active_role: { id: employeeRole.role.id, name: employeeRole.role.name },
  };
};

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.refreshSecret);
  } catch {
    throw { statusCode: 401, message: 'Refresh token tidak valid atau expired' };
  }

  const employee = await prisma.employee.findUnique({ where: { id: decoded.employee_id } });
  const role = await prisma.role.findUnique({ where: { id: decoded.role_id } });

  if (!employee || !role) {
    throw { statusCode: 401, message: 'Token tidak valid' };
  }

  return issueTokens(employee, role);
};

const issueTokens = (employee, role) => {
  const payload = { employee_id: employee.id, role_id: role.id };

  const access_token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  const refresh_token = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });

  return {
    access_token,
    refresh_token,
    token_type: 'Bearer',
    expires_in: 3600,
  };
};

module.exports = { login, selectRole, refreshToken };

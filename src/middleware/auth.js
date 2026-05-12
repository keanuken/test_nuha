const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/jwt');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized: token missing', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    // Block temp tokens from accessing protected routes
    if (decoded.requires_role_selection) {
      return error(res, 'Unauthorized: please select a role first', 401);
    }
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Unauthorized: invalid or expired token', 401);
  }
};

const authenticateTemp = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized: token missing', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (!decoded.requires_role_selection) {
      return error(res, 'Invalid temp token', 401);
    }
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Unauthorized: invalid or expired token', 401);
  }
};

module.exports = { authenticate, authenticateTemp };

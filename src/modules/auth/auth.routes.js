const router = require('express').Router();
const ctrl = require('./auth.controller');
const { authenticate, authenticateTemp } = require('../../middleware/auth');

router.post('/login', ctrl.login);
router.post('/select-role', authenticateTemp, ctrl.selectRole);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;

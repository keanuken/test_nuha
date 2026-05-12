const router = require('express').Router();
const ctrl = require('./employee.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/roles', ctrl.getRoles);
router.post('/:id/roles', ctrl.assignRole);
router.delete('/:id/roles/:roleId', ctrl.revokeRole);

module.exports = router;

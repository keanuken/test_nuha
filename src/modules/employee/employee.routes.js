const router = require('express').Router();
const ctrl = require('./employee.controller');
const { authenticate, roleGuard } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', roleGuard('Super Admin', 'Manager'), ctrl.getAll);
router.post('/', roleGuard('Super Admin', 'Manager'), ctrl.create);
router.put('/:id', roleGuard('Super Admin', 'Manager'), ctrl.update);
router.delete('/:id', roleGuard('Super Admin', 'Manager'), ctrl.remove);
router.get('/:id/roles', roleGuard('Super Admin', 'Manager'), ctrl.getRoles);
router.post('/:id/roles', roleGuard('Super Admin', 'Manager'), ctrl.assignRole);
router.delete('/:id/roles/:roleId', roleGuard('Super Admin', 'Manager'), ctrl.revokeRole);

module.exports = router;

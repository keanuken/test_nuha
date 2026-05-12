const router = require('express').Router();
const ctrl = require('./role.controller');
const { authenticate, roleGuard } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', roleGuard('Super Admin'), ctrl.getAll);
router.post('/', roleGuard('Super Admin'), ctrl.create);
router.put('/:id', roleGuard('Super Admin'), ctrl.update);
router.delete('/:id', roleGuard('Super Admin'), ctrl.remove);
router.get('/:id/menus', roleGuard('Super Admin'), ctrl.getMenus);
router.post('/:id/menus', roleGuard('Super Admin'), ctrl.assignMenu);
router.delete('/:id/menus/:menuId', roleGuard('Super Admin'), ctrl.revokeMenu);

module.exports = router;

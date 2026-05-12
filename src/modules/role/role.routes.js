const router = require('express').Router();
const ctrl = require('./role.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/menus', ctrl.getMenus);
router.post('/:id/menus', ctrl.assignMenu);
router.delete('/:id/menus/:menuId', ctrl.revokeMenu);

module.exports = router;

const router = require('express').Router();
const ctrl = require('./menu.controller');
const { authenticate, roleGuard } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/tree', ctrl.getTree);
router.post('/', roleGuard('Super Admin', 'Manager', 'Staff'), ctrl.create);
router.put('/:id', roleGuard('Super Admin', 'Manager', 'Staff'), ctrl.update);
router.delete('/:id', roleGuard('Super Admin', 'Manager', 'Staff'), ctrl.remove);

module.exports = router;

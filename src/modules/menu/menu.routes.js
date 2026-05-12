const router = require('express').Router();
const ctrl = require('./menu.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/tree', ctrl.getTree);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

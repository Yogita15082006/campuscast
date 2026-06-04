const router = require('express').Router();
const { registerForEvent, getMyRegistrations, getEventRegistrations, cancelRegistration, checkRegistration, exportRegistrations } = require('../controllers/registrationController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.post('/', protect, studentOnly, registerForEvent);
router.post('/:eventId', protect, studentOnly, registerForEvent);
router.get('/my', protect, studentOnly, getMyRegistrations);
router.get('/event/:eventId', protect, adminOnly, getEventRegistrations);
router.get('/check/:eventId', protect, checkRegistration);
router.delete('/:id', protect, cancelRegistration);
router.get('/export/:eventId', protect, adminOnly, exportRegistrations);

module.exports = router;

const router = require('express').Router();
const { generateCode, markAttendance, getMyAttendance, getEventAttendance, getActiveCode, exportAttendance } = require('../controllers/attendanceController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.post('/generate-code', protect, adminOnly, generateCode);
router.post('/mark', protect, studentOnly, markAttendance);
router.get('/my', protect, studentOnly, getMyAttendance);
router.get('/event/:eventId', protect, adminOnly, getEventAttendance);
router.get('/active-code/:eventId', protect, adminOnly, getActiveCode);
router.get('/export/:eventId', protect, adminOnly, exportAttendance);

module.exports = router;

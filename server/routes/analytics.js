const router = require('express').Router();
const { getDashboardStats, getRegistrationAnalytics, getAttendanceAnalytics, getTeamAnalytics, getFeedbackAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/registrations', protect, adminOnly, getRegistrationAnalytics);
router.get('/attendance', protect, adminOnly, getAttendanceAnalytics);
router.get('/teams', protect, adminOnly, getTeamAnalytics);
router.get('/feedback', protect, adminOnly, getFeedbackAnalytics);

module.exports = router;

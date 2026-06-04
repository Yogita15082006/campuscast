const router = require('express').Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, createAnnouncement);
router.get('/', protect, getAnnouncements);

module.exports = router;

const router = require('express').Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, adminOnly, upload.single('posterImage'), createEvent);
router.put('/:id', protect, adminOnly, upload.single('posterImage'), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;

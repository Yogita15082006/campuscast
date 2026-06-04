const router = require('express').Router();
const { submitFeedback, getEventFeedback, getMyFeedback } = require('../controllers/feedbackController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const { body } = require('express-validator');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  next();
};

router.post('/', protect, studentOnly, [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
], validate, submitFeedback);
router.get('/event/:eventId', protect, adminOnly, getEventFeedback);
router.get('/my', protect, studentOnly, getMyFeedback);

module.exports = router;

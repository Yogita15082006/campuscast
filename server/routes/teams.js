const router = require('express').Router();
const { createTeam, joinTeam, getMyTeams, getEventTeams, kickMember, disbandTeam } = require('../controllers/teamController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.post('/', protect, studentOnly, createTeam);
router.post('/join', protect, studentOnly, joinTeam);
router.get('/my', protect, getMyTeams);
router.get('/event/:eventId', protect, getEventTeams);
router.delete('/:id/kick/:memberId', protect, kickMember);
router.delete('/:id', protect, disbandTeam);

module.exports = router;

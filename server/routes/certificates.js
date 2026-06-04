const router = require('express').Router();
const { generateCertificate, regenerateCertificate, getMyCertificates, verifyCertificate, downloadCertificate } = require('../controllers/certificateController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.post('/generate/:eventId/:studentId', protect, adminOnly, generateCertificate);
router.post('/regenerate/:certId', protect, adminOnly, regenerateCertificate);
router.get('/my', protect, studentOnly, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/download/:certId', protect, downloadCertificate);

module.exports = router;

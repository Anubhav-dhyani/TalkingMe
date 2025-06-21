const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  sendRequest,
  acceptRequest,
  rejectRequest
} = require('../controllers/requestController');

router.post('/send', auth, sendRequest);
router.post('/accept', auth, acceptRequest);
router.post('/reject', auth, rejectRequest);

module.exports = router;

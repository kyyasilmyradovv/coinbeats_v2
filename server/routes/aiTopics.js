const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAcademies,
  createTopic,
  getAllTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} = require('../controllers/aiTopicController');

const router = express.Router();

router.get('/academies', asyncHandler(getAcademies));
router.patch('/reorder', authenticateToken, asyncHandler(reorderTopics));

router.get('/', authenticateToken, asyncHandler(getAllTopics));
router.get('/:id', asyncHandler(getTopic));
router.post('/', authenticateToken, asyncHandler(createTopic));
router.put('/:id', authenticateToken, asyncHandler(updateTopic));
router.delete('/:id', authenticateToken, asyncHandler(deleteTopic));

module.exports = router;

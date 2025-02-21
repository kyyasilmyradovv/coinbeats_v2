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
router.patch(
  '/reorder',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(reorderTopics)
);

router.get('/', authenticateToken, asyncHandler(getAllTopics));
router.get('/:id', authenticateToken, asyncHandler(getTopic));
router.post(
  '/',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(createTopic)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(updateTopic)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteTopic)
);

module.exports = router;

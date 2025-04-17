const express = require('express');
const { protectForUser } = require('../controllers/userAuthControllers');
const {
  getAllEducators,
  getAllTutorials,
  getAllPodcasts,
  getAllChannels,
  getAllGroups,
} = require('../controllers/newDiscoverController');
const router = express.Router();

router.get('/educators', getAllEducators);
router.get('/tutorials', getAllTutorials);
router.get('/podcasts', getAllPodcasts);
router.get('/channels', getAllChannels);
router.get('/groups', getAllGroups);

module.exports = router;

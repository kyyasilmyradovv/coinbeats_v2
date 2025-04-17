const express = require('express');
const { protectForUser } = require('../controllers/userAuthControllers');
const {
  getAllEducators,
  getAllTutorials,
  getAllPodcasts,
  getAllChannels,
  getAllGroups,
  getEducator,
  getTutorial,
  getPodcast,
  getChannel,
  getGroup,
} = require('../controllers/newDiscoverController');
const router = express.Router();

router.get('/educators', getAllEducators);
router.get('/educators/:id', getEducator);
router.get('/tutorials', getAllTutorials);
router.get('/tutorials/:id', getTutorial);
router.get('/podcasts', getAllPodcasts);
router.get('/podcasts/:id', getPodcast);
router.get('/channels', getAllChannels);
router.get('/channels/:id', getChannel);
router.get('/groups', getAllGroups);
router.get('/groups/:id', getGroup);

module.exports = router;

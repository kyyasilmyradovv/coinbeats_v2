const express = require('express');
const {
  getAllAcademies,
  getAcademy,
} = require('../controllers/newAcademyControllers');
const {
  protectForUser,
  weakProtect,
} = require('../controllers/userAuthControllers');
const router = express.Router();

router.get('/', getAllAcademies);
router.get('/:id', weakProtect, getAcademy);
// router.use(protectForUser);

module.exports = router;

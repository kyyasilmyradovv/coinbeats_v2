const express = require('express');
const {
  getAllAcademyTypes,
} = require('../controllers/newAcademyTypeControllers');
const router = express.Router();

router.get('/', getAllAcademyTypes);

module.exports = router;

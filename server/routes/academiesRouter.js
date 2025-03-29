const express = require('express');
const { getAllAcademies } = require('../controllers/newAcademyControllers');

const router = express.Router();

router.get('/', getAllAcademies);

module.exports = router;

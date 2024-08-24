// server/routes/academy.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const upload = require('../uploadConfig'); // Import the central multer configuration

const {
  createAcademy,
  listMyAcademies,
  getAcademyDetails,
  updateAcademy,
  getPendingAcademies,
  approveAcademy,
  rejectAcademy,
  addRaffles,
  addQuests,
  createBasicAcademy,
  deleteAcademy,
  allocateXp,
  getAllAcademies,
} = require('../controllers/academyController');

const router = express.Router();

// Public route to fetch all academies
router.get('/academies', asyncHandler(getAllAcademies));

// Protected routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]),
  asyncHandler(createAcademy)
);

router.post(
  '/basic',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]),
  asyncHandler(createBasicAcademy)
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]),
  asyncHandler(updateAcademy)
);

router.get('/my', authenticateToken, asyncHandler(listMyAcademies));
router.get('/:id', authenticateToken, asyncHandler(getAcademyDetails));
router.get('/pending', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(getPendingAcademies));
router.post('/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(approveAcademy));
router.post('/:id/reject', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), asyncHandler(rejectAcademy));
router.post('/:id/raffles', authenticateToken, authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'), asyncHandler(addRaffles));
router.post('/:id/quests', authenticateToken, authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'), asyncHandler(addQuests));
router.delete('/:id', authenticateToken, authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'), asyncHandler(deleteAcademy));
router.put('/:id/allocate-xp', authenticateToken, authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'), asyncHandler(allocateXp));

module.exports = router;

const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { authMiddleware } = require('../middleware/auth');

// Create visit
router.post('/', authMiddleware, visitController.createVisit);
// Get my visits (as visitor)
router.get('/', authMiddleware, visitController.getUserVisits);
// Get visits for owner
router.get('/owner', authMiddleware, visitController.getOwnerVisits);
// Update visit status (approve/reject)
router.put('/:id/status', authMiddleware, visitController.updateVisitStatus);
// Get single visit
router.get('/:id', authMiddleware, visitController.getVisit);

module.exports = router;
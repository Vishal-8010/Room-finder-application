const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Upload document
router.post('/upload', documentController.uploadDocument);

// Get user's documents
router.get('/user', documentController.getUserDocuments);

// Get room documents
router.get('/room/:roomId', documentController.getRoomDocuments);

// Download document
router.get('/:documentId/download', documentController.downloadDocument);

// Sign document
router.post('/:documentId/sign', documentController.signDocument);

// Delete document
router.delete('/:documentId', documentController.deleteDocument);

// Generate rental agreement
router.post('/agreement/generate', documentController.generateRentalAgreement);

// Verify document (admin only)
router.patch('/:documentId/verify', (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
}, documentController.verifyDocument);

module.exports = router;
const Document = require('../models/Document');

// Upload document
exports.uploadDocument = async(req, res) => {
    try {
        const { documentType, roomId } = req.body;

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: 'Document type is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Create document record
        const document = await Document.create({
            user: req.userId,
            room: roomId || null,
            documentType,
            fileName: req.file.originalname,
            fileUrl: `/uploads/documents/${req.file.filename}`,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user documents
exports.getUserDocuments = async(req, res) => {
    try {
        const documents = await Document.find({ user: req.userId })
            .populate('room', 'title locationName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room documents
exports.getRoomDocuments = async(req, res) => {
    try {
        const { roomId } = req.params;

        const documents = await Document.find({ room: roomId })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Download document
exports.downloadDocument = async(req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check authorization
        if (document.user.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this document'
            });
        }

        res.download(document.filePath, document.fileName);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Digitally sign document
exports.signDocument = async(req, res) => {
    try {
        const { documentId } = req.params;
        const { signature } = req.body;

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: 'Signature is required'
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check authorization
        if (document.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to sign this document'
            });
        }

        // Update document with signature
        document.isDigitallySigned = true;
        document.signedBy = req.userId;
        document.signatureTimestamp = new Date();
        // In a real implementation, you would store the signature image/data
        document.metadata.notes = (document.metadata.notes || '') + `\nDigitally signed on ${new Date().toISOString()}`;

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document signed successfully',
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete document
exports.deleteDocument = async(req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check authorization
        if (document.user.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this document'
            });
        }

        await Document.findByIdAndDelete(documentId);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify document (admin only)
exports.verifyDocument = async(req, res) => {
    try {
        const { documentId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const document = await Document.findByIdAndUpdate(
            documentId, {
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : null,
                'metadata.verifiedAt': status === 'verified' ? new Date() : null
            }, { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Document ${status} successfully`,
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate rental agreement (template)
exports.generateRentalAgreement = async(req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // In a real implementation, generate PDF with room details
        const agreement = {
            title: 'Rental Agreement',
            content: `RENTAL AGREEMENT

This Rental Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}.

BETWEEN:

Landlord/Owner: [Room Owner Details]

AND:

Tenant/Student: [Your Details]

REGARDING THE RENTAL OF:

Room Details: [Room Details ${roomId ? 'ID: ' + roomId : ''}]

TERMS AND CONDITIONS:

1. RENTAL PERIOD
   - Move-in Date: [Date]
   - Duration: [12 months]
   - Renewal: As per mutual agreement

2. RENT AND DEPOSIT
   - Monthly Rent: [Amount]
   - Security Deposit: [Amount]
   - Payment Terms: Due on the 1st of each month

3. MAINTENANCE AND REPAIRS
   - Landlord is responsible for major repairs
   - Tenant is responsible for minor maintenance
   - Both parties agree to maintain the property in good condition

4. HOUSE RULES
   - Quiet hours: 10 PM - 8 AM
   - No smoking inside the room
   - No unauthorized guests
   - Respect for shared spaces

5. TERMINATION
   - Either party may terminate with 30 days written notice
   - Deposit will be refunded within 15 days of vacating

6. LEGAL COMPLIANCE
   - All parties agree to comply with local housing laws
   - Any disputes will be resolved through mutual agreement

By signing this agreement, both parties agree to the terms and conditions stated above.

Landlord Signature: _________________ Date: _________

Tenant Signature: _________________ Date: _________

Digital Signature Verification: [Pending]`
        };

        res.status(200).json({
            success: true,
            message: 'Rental agreement generated',
            data: {
                title: agreement.title,
                content: agreement.content
            }
        });
    } catch (error) {
        console.error('Agreement generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate rental agreement: ' + error.message
        });
    }
};
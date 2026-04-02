# Document Upload & Agreement Feature

## Overview
The Document Upload & Agreement feature enables users to securely upload identity proof documents, download rental agreements, and digitally sign documents for enhanced transaction security.

## Features Implemented

### 1. **Document Upload**
- Users can upload ID proof documents (Aadhar, Driver License, Passport)
- Supported file formats: PDF, JPG, PNG
- Maximum file size: 10MB
- File validation on both client and server side
- Documents stored with metadata tracking

### 2. **Rental Agreement**
- Template-based rental agreement generation
- Includes all standard rental terms and conditions
- Can be downloaded and shared with landlord/tenant
- Customizable with room and user details
- Ready for digital signing

### 3. **Digital Signing**
- Sign documents with your name/signature
- Automatic timestamp recording
- Digital signature verification
- Audit trail for all signatures
- Prevents unauthorized modifications

### 4. **Document Management**
- View all uploaded documents
- Track document status (Pending, Verified, Rejected)
- Download any document
- Delete documents
- Document categorization (ID Proof, Rental Agreement, Other)

## Architecture

### Backend Components

#### Document Model (`backend/models/Document.js`)
```javascript
{
  user: ObjectId,              // Reference to User
  room: ObjectId,              // Reference to Room (optional)
  documentType: String,        // 'idProof' | 'rentalAgreement' | 'other'
  fileName: String,            // Original file name
  fileUrl: String,             // URL to access the file
  filePath: String,            // Server file path
  fileSize: Number,            // File size in bytes
  mimeType: String,            // MIME type (application/pdf, image/jpeg, etc)
  status: String,              // 'pending' | 'verified' | 'rejected'
  rejectionReason: String,     // Reason if rejected
  isDigitallySigned: Boolean,  // Digital signature flag
  signedBy: ObjectId,          // Reference to User who signed
  signatureTimestamp: Date,    // When document was signed
  metadata: {
    uploadedAt: Date,          // Upload timestamp
    verifiedAt: Date,          // Verification timestamp
    expiresAt: Date,           // Expiration date (for ID proofs)
    notes: String              // Admin notes
  }
}
```

#### Document Controller (`backend/controllers/documentController.js`)
- `uploadDocument()` - Handle file upload with validation
- `getUserDocuments()` - Retrieve user's documents
- `getRoomDocuments()` - Retrieve documents for a specific room
- `downloadDocument()` - Secure file download with authorization
- `signDocument()` - Apply digital signature to document
- `deleteDocument()` - Remove document
- `verifyDocument()` - Admin verification workflow
- `generateRentalAgreement()` - Create agreement template

#### Document Routes (`backend/routes/documentRoutes.js`)
```
POST   /api/documents/upload              - Upload document
GET    /api/documents/user                - Get user's documents
GET    /api/documents/room/:roomId        - Get room documents
GET    /api/documents/:documentId/download - Download document
POST   /api/documents/:documentId/sign    - Sign document
DELETE /api/documents/:documentId         - Delete document
PATCH  /api/documents/:documentId/verify  - Verify document (admin)
POST   /api/documents/agreement/generate  - Generate rental agreement
```

### Frontend Components

#### Documents Page (`frontend/src/pages/DocumentsPage.jsx`)
**Features:**
- Two-tab interface: Documents & Rental Agreement
- Document upload modal with drag-drop support
- Document list with status badges
- Digital signing modal
- Download/Delete buttons for each document
- Rental agreement download button

**State Management:**
```javascript
{
  documents: Document[],
  loading: Boolean,
  uploadLoading: Boolean,
  activeTab: String,              // 'documents' | 'agreement'
  showUploadModal: Boolean,
  showSigningModal: Boolean,
  selectedDocument: Document,
  signatureInput: String,
  uploadForm: {
    documentType: String,
    file: File
  }
}
```

**Functions:**
- `fetchDocuments()` - Load user's documents
- `handleFileChange()` - Validate and select file
- `handleUploadDocument()` - Submit document upload
- `handleDownloadDocument()` - Download document
- `handleSignDocument()` - Sign document digitally
- `handleDeleteDocument()` - Delete document
- `handleGenerateAgreement()` - Download rental agreement

#### API Client (`frontend/src/api.js`)
```javascript
export const documentAPI = {
    uploadDocument(formData),           // Upload with FormData
    getUserDocuments(),                 // Fetch user documents
    getRoomDocuments(roomId),           // Fetch room documents
    downloadDocument(documentId),       // Download file
    signDocument(documentId, signature),// Sign document
    deleteDocument(documentId),         // Delete document
    verifyDocument(documentId, status), // Verify (admin)
    generateRentalAgreement(roomId),    // Generate agreement
};
```

#### Header Navigation
- Added "Documents" link to profile menu
- Accessible to authenticated users
- Visible alongside other profile options

## File Storage

### Server Setup
- **Directory:** `/uploads/documents/`
- **File Naming:** `{timestamp}-{random}-{originalName}`
- **Static Serving:** Files served via `/uploads/{path}`
- **Multer Configuration:**
  - Max file size: 10MB
  - Allowed types: PDF, JPG, PNG
  - Storage: Disk storage with unique naming

### File Access
```
/uploads/documents/{filename}
```

## Security Features

### Client-Side Validation
- File type checking (PDF, JPG, PNG only)
- File size validation (≤10MB)
- User feedback via toast notifications

### Server-Side Validation
- MIME type verification
- File size limits in multer config
- Authorization checks for downloads/deletions
- Admin-only verification endpoints

### Authorization
- Users can only download/delete their own documents
- Admins can verify any document
- File access requires authentication

## User Workflow

### For Students (Uploading ID Proof)
1. Click "Documents" in profile menu
2. Click "Upload Document" button
3. Select "ID Proof" document type
4. Choose file (PDF/JPG/PNG, ≤10MB)
5. Click "Upload"
6. Document appears in list with "Pending" status
7. Admin reviews and verifies
8. Can sign document digitally

### For Landlords (Signing Agreements)
1. Go to "Documents" → "Rental Agreement" tab
2. Click "Download Rental Agreement"
3. Fill in details with tenant
4. Re-upload signed agreement
5. Click "Sign Document" to add digital signature
6. Document marked as "Digitally Signed"

### For Admins (Verification)
1. Access `/api/documents/{id}/verify` endpoint
2. Review document
3. Approve → Status: "Verified"
4. Reject → Status: "Rejected" + Reason
5. Document metadata updated with verification timestamp

## API Examples

### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
  - file: [binary file]
  - documentType: "idProof"

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "fileName": "passport.pdf",
    "fileUrl": "/uploads/documents/123456-passport.pdf",
    "status": "pending"
  }
}
```

### Download Document
```bash
GET /api/documents/{documentId}/download

Response: Binary file with appropriate headers
```

### Sign Document
```bash
POST /api/documents/{documentId}/sign

Body:
{
  "signature": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "isDigitallySigned": true,
    "signatureTimestamp": "2025-01-29T..."
  }
}
```

### Get User Documents
```bash
GET /api/documents/user

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "documentType": "idProof",
      "status": "pending",
      "fileName": "aadhar.pdf"
    },
    ...
  ]
}
```

## Integration Points

### With Room Booking
- Documents required for connection/booking approval
- ID proof verification status affects user credibility
- Rental agreement stored with connection/booking

### With Admin Panel
- Verification queue for pending documents
- Document analytics (verified/pending/rejected counts)
- User verification status tracking

### With Messaging
- Users can request ID verification before meeting
- Documents can be referenced in messages

## Future Enhancements

1. **PDF Generation**
   - Use libraries like `pdfkit` or `puppeteer`
   - Auto-fill rental agreement with room/user details
   - Generate QR codes for verification

2. **Advanced Digital Signatures**
   - PKI infrastructure for cryptographic signatures
   - Signature certificate generation
   - Legal compliance (E-Sign Act)

3. **Document Expiry**
   - ID proof validity checks
   - Automatic renewal reminders
   - Expiry status in dashboard

4. **Document Versioning**
   - Track multiple versions of agreements
   - Comparison between versions
   - Version history

5. **Blockchain Integration**
   - Immutable document records
   - Smart contracts for agreements
   - Decentralized verification

6. **OCR & AI Verification**
   - Automated document scanning
   - Fraud detection
   - Face matching with ID

## Database Indexes

```javascript
// Recommended indexes for performance
{
  user: 1,
  documentType: 1,
  status: 1
}

{
  room: 1,
  status: 1
}

{
  user: 1,
  createdAt: -1  // For sorting by date
}
```

## Error Handling

### Common Errors
- **No file provided:** "No file provided" - 400
- **Invalid file type:** "Invalid file type" - 400
- **File too large:** "File size exceeds 10MB limit" - 413
- **Document not found:** "Document not found" - 404
- **Authorization failed:** "Not authorized to download this document" - 403
- **Missing signature:** "Signature is required" - 400

## Testing

### Manual Testing
1. **Upload:** Upload PDF/JPG file with size <10MB
2. **Download:** Download uploaded file and verify integrity
3. **Sign:** Sign document and verify timestamp
4. **Delete:** Delete document and verify removal
5. **Generate:** Download rental agreement template

### Automated Testing (Future)
- File upload validation tests
- Authorization tests
- Document lifecycle tests
- Concurrent upload handling

## Deployment Considerations

1. **File Storage Strategy**
   - Local storage for development
   - AWS S3 or similar for production
   - Consider using signed URLs for downloads

2. **Backup Strategy**
   - Regular backups of uploaded files
   - Database backups of document metadata
   - Disaster recovery procedures

3. **Security Hardening**
   - Rate limiting on uploads
   - Virus scanning for uploaded files
   - IP whitelisting for admin endpoints

4. **Performance Optimization**
   - File compression for storage
   - CDN for download delivery
   - Database indexing for queries

## Conclusion

The Document Upload & Agreement feature provides a secure, user-friendly way to manage important rental documents. It enhances trust between landlords and tenants while maintaining regulatory compliance and security standards.

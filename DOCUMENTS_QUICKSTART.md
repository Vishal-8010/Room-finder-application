# Document Upload & Agreement Feature - Quick Start Guide

## For Users

### How to Upload ID Proof

1. **Navigate to Documents**
   - Click on your profile menu (hamburger + user icon)
   - Select "Documents"

2. **Upload Your ID Proof**
   - Click "Upload Document" button
   - Select "ID Proof (Aadhar/DL/Passport)" from dropdown
   - Choose your PDF, JPG, or PNG file (max 10MB)
   - Click "Upload"

3. **Monitor Status**
   - Your document appears in the list with "Pending" status
   - Admin will review and verify
   - Status updates to "Verified" when approved

### How to Download & Sign Rental Agreement

1. **Generate Agreement**
   - Go to Documents page
   - Click on "Rental Agreement" tab
   - Click "Download Rental Agreement"

2. **Fill Agreement**
   - Open downloaded file
   - Fill in details with your landlord/tenant
   - Both parties should review carefully

3. **Upload & Sign**
   - In Documents page, click "Upload Document"
   - Select "Rental Agreement" type
   - Upload the signed agreement
   - Click the signature icon
   - Enter your name
   - Click "Sign Document"

4. **Digital Signature**
   - Your signature is recorded with timestamp
   - Document marked as "Digitally Signed"
   - Legally binding digital record created

### Document Management

**View Documents**
- All documents listed by type
- Status badges show: Pending, Verified, Rejected
- File size and upload date displayed

**Download Document**
- Click green download icon
- File saved to your downloads folder
- Preserves original format

**Delete Document**
- Click red delete icon
- Confirm deletion
- Document removed from system

## For Landlords

### Uploading Required Documents

1. Upload government-issued ID proof
2. Upload rental agreement with tenant signatures
3. Digitally sign all documents
4. Wait for admin verification

### Digital Signature Benefits

- Legal proof of consent
- Timestamp for contract signing
- Audit trail for disputes
- Secure document exchange

## For Admins

### Document Verification

**Access Verification Endpoint**
```bash
PATCH /api/documents/{documentId}/verify
Content-Type: application/json

{
  "status": "verified",
  "rejectionReason": null
}
```

**For Rejected Documents**
```bash
{
  "status": "rejected",
  "rejectionReason": "Document is unclear, please resubmit"
}
```

### Verification Status
- **Pending:** Awaiting admin review
- **Verified:** Document accepted, user verified
- **Rejected:** Document invalid, reason provided

## API Usage Examples

### Upload Document with cURL

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "documentType=idProof" \
  -F "file=@/path/to/document.pdf"
```

### Get User Documents

```bash
curl -X GET http://localhost:5000/api/documents/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Download Document

```bash
curl -X GET http://localhost:5000/api/documents/{documentId}/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

### Sign Document

```bash
curl -X POST http://localhost:5000/api/documents/{documentId}/sign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"signature": "John Doe"}'
```

### Verify Document (Admin)

```bash
curl -X PATCH http://localhost:5000/api/documents/{documentId}/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "verified"}'
```

## Troubleshooting

### File Upload Fails
**Possible Causes:**
- File too large (max 10MB)
- Invalid file type (only PDF, JPG, PNG)
- Network connection issue

**Solution:**
- Check file size: right-click → Properties
- Convert to supported format if needed
- Check internet connection
- Try again

### Document Won't Download
**Possible Causes:**
- Network issue
- File not found on server
- Authorization problem

**Solution:**
- Check internet connection
- Verify you own the document
- Try again in a few moments
- Contact admin if persists

### Digital Signature Not Saving
**Possible Causes:**
- Network error
- Invalid signature input
- Document not found

**Solution:**
- Enter your full name in signature field
- Check network connection
- Ensure document exists
- Try uploading again

### Admin Verification Takes Long
**Reason:**
- Documents verified in queue order
- High volume of uploads
- Documents requiring clarification

**What to do:**
- Check document quality
- Ensure clear, readable images
- Be patient (usually 24-48 hours)
- Contact support if urgent

## Security Best Practices

### When Uploading Documents
- ✅ Use clear, well-lit photos of documents
- ✅ Ensure all information is visible and readable
- ✅ Upload from secure network
- ✅ Use official government ID documents
- ✅ Don't share sensitive information in notes

### When Signing Digitally
- ✅ Review document completely before signing
- ✅ Ensure date and terms are correct
- ✅ Don't sign blank documents
- ✅ Keep copies for your records
- ✅ Verify other party's signature

### Document Storage
- ✅ Documents encrypted on server
- ✅ Backups maintained regularly
- ✅ Access controlled and logged
- ✅ Compliance with data protection laws
- ✅ Automatic cleanup of old files (optional)

## Supported File Types

| Type | Extensions | Max Size | Use Case |
|------|-----------|----------|----------|
| PDF | .pdf | 10MB | Scanned documents, agreements |
| JPEG | .jpg, .jpeg | 10MB | Photo of ID, documents |
| PNG | .png | 10MB | Screenshots, documents |

## Limits & Restrictions

| Aspect | Limit |
|--------|-------|
| Max file size | 10MB |
| Max files per user | Unlimited |
| Document retention | As per policy |
| Signature attempts | Unlimited |
| Download attempts | Unlimited |

## Key Features Recap

✅ **ID Proof Upload** - Upload and verify government ID
✅ **Rental Agreement** - Download template and sign digitally
✅ **Digital Signatures** - Legal digital signing with timestamps
✅ **Document Management** - Organize and manage all documents
✅ **Status Tracking** - Know verification status at a glance
✅ **Secure Storage** - Encrypted, backed-up document storage
✅ **Admin Verification** - Professional document validation
✅ **Audit Trail** - Complete history of actions

## Getting Started Now

1. **Log in** to your account
2. **Click profile menu** → Select "Documents"
3. **Upload ID proof** to get verified
4. **Download agreement** template for your room
5. **Sign agreement** with your landlord/tenant
6. **Check status** and download anytime

## Support

For issues or questions:
- Check this guide first
- Review error messages
- Contact admin support
- Email support@roomnest.com

---

**Last Updated:** January 29, 2025
**Feature Status:** ✅ Live & Ready to Use

import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaDownload, FaPencilAlt, FaTrash, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { documentAPI } from '../api';

const DocumentsPage = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('documents');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSigningModal, setShowSigningModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [signatureInput, setSignatureInput] = useState('');
    const [uploadForm, setUploadForm] = useState({
        documentType: 'idProof',
        file: null,
    });

    // Fetch user documents
    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await documentAPI.getUserDocuments();
            setDocuments(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch documents');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size exceeds 10MB limit');
                return;
            }

            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only PDF, JPG, and PNG files are allowed');
                return;
            }

            setUploadForm({ ...uploadForm, file });
        }
    };

    // Upload document
    const handleUploadDocument = async (e) => {
        e.preventDefault();

        if (!uploadForm.file) {
            toast.error('Please select a file');
            return;
        }

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('documentType', uploadForm.documentType);
            formData.append('file', uploadForm.file);

            await documentAPI.uploadDocument(formData);
            toast.success('Document uploaded successfully');
            setUploadForm({ documentType: 'idProof', file: null });
            setShowUploadModal(false);
            fetchDocuments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload document');
            console.error(error);
        } finally {
            setUploadLoading(false);
        }
    };

    // Download document
    const handleDownloadDocument = async (document) => {
        try {
            const response = await documentAPI.downloadDocument(document._id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', document.fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download document');
            console.error(error);
        }
    };

    // Sign document
    const handleSignDocument = async (e) => {
        e.preventDefault();

        if (!signatureInput.trim()) {
            toast.error('Please enter your name to sign');
            return;
        }

        try {
            await documentAPI.signDocument(selectedDocument._id, signatureInput);
            toast.success('Document signed successfully');
            setShowSigningModal(false);
            setSignatureInput('');
            fetchDocuments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sign document');
            console.error(error);
        }
    };

    // Delete document
    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await documentAPI.deleteDocument(documentId);
            toast.success('Document deleted successfully');
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to delete document');
            console.error(error);
        }
    };

    // Generate rental agreement
    const handleGenerateAgreement = async () => {
        try {
            const response = await documentAPI.generateRentalAgreement(null);
            if (!response || !response.data || !response.data.data) {
                toast.error('Invalid response from server');
                return;
            }
            
            const content = response.data.data.content || response.data.data;
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', 'rental_agreement.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            toast.success('Rental agreement downloaded');
        } catch (error) {
            console.error('Agreement generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate agreement');
        }
    };

    const idProofDocs = documents.filter((doc) => doc.documentType === 'idProof');
    const agreementDocs = documents.filter((doc) => doc.documentType === 'rentalAgreement');
    const otherDocs = documents.filter((doc) => doc.documentType === 'other');

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <FaCheckCircle /> Verified
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <FaTimesCircle /> Rejected
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <FaClock /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents & Agreements</h1>
                    <p className="text-gray-600">Manage your ID proof, rental agreements, and digital signatures</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                                activeTab === 'documents'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Documents ({documents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('agreement')}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                                activeTab === 'agreement'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Rental Agreement
                        </button>
                    </div>
                </div>

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div>
                        {/* Upload Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <FaCloudUploadAlt /> Upload Document
                            </button>
                        </div>

                        {/* Documents List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                                </div>
                                <p className="mt-4 text-gray-600">Loading documents...</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                                <p className="text-gray-600 mb-6">Upload your ID proof or other documents</p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Upload Your First Document
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {/* ID Proof Documents */}
                                {idProofDocs.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">ID Proof</h3>
                                        <div className="grid gap-3">
                                            {idProofDocs.map((doc) => (
                                                <div
                                                    key={doc._id}
                                                    className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                            {getStatusBadge(doc.status)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        {!doc.isDigitallySigned && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDocument(doc);
                                                                    setShowSigningModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Sign Document"
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <FaDownload />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Agreement Documents */}
                                {agreementDocs.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Agreements</h3>
                                        <div className="grid gap-3">
                                            {agreementDocs.map((doc) => (
                                                <div
                                                    key={doc._id}
                                                    className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                            {doc.isDigitallySigned && (
                                                                <span className="text-green-600 font-medium">✓ Digitally Signed</span>
                                                            )}
                                                            {getStatusBadge(doc.status)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        {!doc.isDigitallySigned && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDocument(doc);
                                                                    setShowSigningModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Sign Document"
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <FaDownload />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Documents */}
                                {otherDocs.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Documents</h3>
                                        <div className="grid gap-3">
                                            {otherDocs.map((doc) => (
                                                <div
                                                    key={doc._id}
                                                    className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                            {getStatusBadge(doc.status)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        {!doc.isDigitallySigned && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDocument(doc);
                                                                    setShowSigningModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Sign Document"
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <FaDownload />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Agreement Tab */}
                {activeTab === 'agreement' && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Rental Agreement</h3>
                        <p className="text-gray-600 mb-6">
                            Download a rental agreement template for your room. Fill in the details with your landlord and student before signing.
                        </p>
                        <button
                            onClick={handleGenerateAgreement}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <FaDownload /> Download Rental Agreement
                        </button>
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> This template includes all necessary terms and conditions. Both parties must sign before the agreement becomes valid.
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h3>
                            <form onSubmit={handleUploadDocument}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Document Type
                                        </label>
                                        <select
                                            value={uploadForm.documentType}
                                            onChange={(e) =>
                                                setUploadForm({ ...uploadForm, documentType: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="idProof">ID Proof (Aadhar/DL/Passport)</option>
                                            <option value="rentalAgreement">Rental Agreement</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select File
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                id="file-input"
                                            />
                                            <label htmlFor="file-input" className="cursor-pointer">
                                                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    {uploadForm.file ? uploadForm.file.name : 'Click to select file or drag and drop'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setUploadForm({ documentType: 'idProof', file: null });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadLoading || !uploadForm.file}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {uploadLoading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Digital Signing Modal */}
                {showSigningModal && selectedDocument && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Digitally Sign Document</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Document: <strong>{selectedDocument.fileName}</strong>
                            </p>
                            <form onSubmit={handleSignDocument}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name (Signature)
                                        </label>
                                        <input
                                            type="text"
                                            value={signatureInput}
                                            onChange={(e) => setSignatureInput(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-900">
                                            By signing, you confirm your identity and agree to the terms of this document.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSigningModal(false);
                                            setSignatureInput('');
                                            setSelectedDocument(null);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!signatureInput.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Sign Document
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;

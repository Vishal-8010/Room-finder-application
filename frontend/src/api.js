import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    getProfile: () => apiClient.get('/auth/profile'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    getOwnerProfile: (ownerId) => apiClient.get(`/auth/owner/${ownerId}`),
};

// Room API
export const roomAPI = {
    getAllRooms: (params) => apiClient.get('/rooms', { params }),
    getRoomById: (roomId) => apiClient.get(`/rooms/${roomId}`),
    createRoom: (data) => apiClient.post('/rooms', data),
    updateRoom: (roomId, data) => apiClient.put(`/rooms/${roomId}`, data),
    deleteRoom: (roomId) => apiClient.delete(`/rooms/${roomId}`),
    getOwnerRooms: (ownerId) => apiClient.get(`/rooms/owner/${ownerId}`),
    searchByBounds: (neLat, neLng, swLat, swLng) =>
        apiClient.get('/rooms/search/by-bounds', {
            params: { neLat, neLng, swLat, swLng }
        }),
};

// Connection API
export const connectionAPI = {
    createConnection: (data) => apiClient.post('/connections', data),
    getUserConnections: () => apiClient.get('/connections'),
    getRoomConnections: (roomId) => apiClient.get(`/connections/room/${roomId}`),
    updateConnectionStatus: (connectionId, status) =>
        apiClient.put(`/connections/${connectionId}/status`, { status }),
    scheduleViewing: (connectionId, viewingDate) =>
        apiClient.put(`/connections/${connectionId}/viewing`, { viewingDate }),
};

// Message API
export const messageAPI = {
    sendMessage: (receiverId, content, roomId) =>
        apiClient.post('/messages', { receiverId, content, roomId }),
    getConversation: (userId) => apiClient.get(`/messages/${userId}`),
    getAllConversations: () => apiClient.get('/messages/conversations'),
    markAsRead: (messageId) => apiClient.put(`/messages/${messageId}/read`),
    getUnreadCount: () => apiClient.get('/messages/unread'),
};

// Favorite API
export const favoriteAPI = {
    addToFavorites: (roomId) => apiClient.post(`/favorites/${roomId}`),
    removeFromFavorites: (roomId) => apiClient.delete(`/favorites/${roomId}`),
    getUserFavorites: () => apiClient.get('/favorites'),
    checkIsFavorite: (roomId) => apiClient.get(`/favorites/${roomId}/check`),
};

// Review API
export const reviewAPI = {
    createReview: (data) => apiClient.post('/reviews', data),
    getRoomReviews: (roomId) => apiClient.get(`/reviews/room/${roomId}`),
    getOwnerReviews: (ownerId) => apiClient.get(`/reviews/owner/${ownerId}`),
    updateReview: (reviewId, data) => apiClient.put(`/reviews/${reviewId}`, data),
    deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};

// Visits API
export const visitsAPI = {
    createVisit: (data) => apiClient.post('/visits', data),
    getMyVisits: () => apiClient.get('/visits'),
    getOwnerVisits: () => apiClient.get('/visits/owner'),
    updateVisitStatus: (visitId, status) => apiClient.put(`/visits/${visitId}/status`, { status }),
    getVisit: (visitId) => apiClient.get(`/visits/${visitId}`),
};

// Admin API
export const adminAPI = {
    // Dashboard
    getDashboardStats: () => apiClient.get('/admin/stats'),

    // Users Management
    getAllUsers: (params) => apiClient.get('/admin/users', { params }),
    updateUserStatus: (userId, status) =>
        apiClient.put(`/admin/users/${userId}/status`, { status }),
    deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

    // Rooms Management
    getAllRooms: (params) => apiClient.get('/admin/rooms', { params }),
    approveRoom: (roomId) => apiClient.put(`/admin/rooms/${roomId}/approve`),
    rejectRoom: (roomId, reason) =>
        apiClient.put(`/admin/rooms/${roomId}/reject`, { reason }),
    deleteRoom: (roomId) => apiClient.delete(`/admin/rooms/${roomId}`),

    // Reviews Management
    getAllReviews: (params) => apiClient.get('/admin/reviews', { params }),
    updateReviewStatus: (reviewId, status) =>
        apiClient.put(`/admin/reviews/${reviewId}/status`, { status }),
    deleteReview: (reviewId) => apiClient.delete(`/admin/reviews/${reviewId}`),

    // Connections Management
    getAllConnections: (params) => apiClient.get('/admin/connections', { params }),
    updateConnectionStatus: (connectionId, status) =>
        apiClient.put(`/admin/connections/${connectionId}/status`, { status }),
    deleteConnection: (connectionId) => apiClient.delete(`/admin/connections/${connectionId}`),
};

// Document API
export const documentAPI = {
    uploadDocument: (formData) => apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getUserDocuments: () => apiClient.get('/documents/user'),
    getRoomDocuments: (roomId) => apiClient.get(`/documents/room/${roomId}`),
    downloadDocument: (documentId) => apiClient.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
    }),
    signDocument: (documentId, signature) =>
        apiClient.post(`/documents/${documentId}/sign`, { signature }),
    deleteDocument: (documentId) => apiClient.delete(`/documents/${documentId}`),
    verifyDocument: (documentId, status, rejectionReason) =>
        apiClient.patch(`/documents/${documentId}/verify`, { status, rejectionReason }),
    generateRentalAgreement: (roomId) =>
        apiClient.post('/documents/agreement/generate', { roomId }),
};

export default apiClient;
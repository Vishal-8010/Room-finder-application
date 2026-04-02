// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Make API request
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API Functions
async function loginUser(email, password) {
    const result = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userData', JSON.stringify(result.user));
    return result;
}

async function registerUser(formData) {
    const result = await apiRequest('/auth/register', 'POST', formData);
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userData', JSON.stringify(result.user));
    return result;
}

async function getUserProfile() {
    return await apiRequest('/auth/profile');
}

async function updateUserProfile(data) {
    return await apiRequest('/auth/profile', 'PUT', data);
}

async function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
}

// Room API Functions
async function getAllRooms(filters = {}) {
    let query = '';
    if (Object.keys(filters).length > 0) {
        const params = new URLSearchParams(filters);
        query = '?' + params.toString();
    }
    return await apiRequest(`/rooms${query}`);
}

async function getRoomById(roomId) {
    return await apiRequest(`/rooms/${roomId}`);
}

async function createRoom(roomData) {
    return await apiRequest('/rooms', 'POST', roomData);
}

async function updateRoom(roomId, roomData) {
    return await apiRequest(`/rooms/${roomId}`, 'PUT', roomData);
}

async function deleteRoom(roomId) {
    return await apiRequest(`/rooms/${roomId}`, 'DELETE');
}

// Connection API Functions
async function createConnection(connectionData) {
    return await apiRequest('/connections', 'POST', connectionData);
}

async function getUserConnections() {
    return await apiRequest('/connections');
}

async function getRoomConnections(roomId) {
    return await apiRequest(`/connections/room/${roomId}`);
}

async function updateConnectionStatus(connectionId, status) {
    return await apiRequest(`/connections/${connectionId}/status`, 'PUT', { status });
}

async function scheduleViewing(connectionId, viewingDate) {
    return await apiRequest(`/connections/${connectionId}/viewing`, 'PUT', { viewingDate });
}

// Message API Functions
async function sendMessage(receiverId, content, roomId = null) {
    return await apiRequest('/messages', 'POST', { receiverId, content, roomId });
}

async function getConversation(userId) {
    return await apiRequest(`/messages/${userId}`);
}

async function getAllConversations() {
    return await apiRequest('/messages/conversations');
}

async function markMessageAsRead(messageId) {
    return await apiRequest(`/messages/${messageId}/read`, 'PUT');
}

async function getUnreadMessageCount() {
    return await apiRequest('/messages/unread');
}

// Favorite API Functions
async function addToFavorites(roomId) {
    return await apiRequest(`/favorites/${roomId}`, 'POST');
}

async function removeFromFavorites(roomId) {
    return await apiRequest(`/favorites/${roomId}`, 'DELETE');
}

async function getUserFavorites() {
    return await apiRequest('/favorites');
}

async function checkIsFavorite(roomId) {
    return await apiRequest(`/favorites/${roomId}/check`);
}

// Review API Functions
async function createReview(reviewData) {
    return await apiRequest('/reviews', 'POST', reviewData);
}

async function getRoomReviews(roomId) {
    return await apiRequest(`/reviews/room/${roomId}`);
}

async function getOwnerReviews(ownerId) {
    return await apiRequest(`/reviews/owner/${ownerId}`);
}

async function updateReview(reviewId, reviewData) {
    return await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
}

async function deleteReview(reviewId) {
    return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
}
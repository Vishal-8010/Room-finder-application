# API Client Usage Examples

This document shows how to use the API client throughout the application.

## Table of Contents

1. [Authentication](#authentication)
2. [Room Management](#room-management)
3. [Favorites](#favorites)
4. [Messages](#messages)
5. [Connections](#connections)
6. [Reviews](#reviews)
7. [Error Handling](#error-handling)

---

## Authentication

### Login

```javascript
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      login(response.data.user, response.data.token);
      navigate('/rooms');
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };
}
```

### Register

```javascript
const handleRegister = async (formData) => {
  try {
    const response = await authAPI.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secure123',
      phone: '9876543210',
      role: 'student'
    });
    login(response.data.user, response.data.token);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Get Profile

```javascript
const { user } = useAuth();

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      updateUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };
  
  if (user) {
    fetchProfile();
  }
}, [user]);
```

### Update Profile

```javascript
const handleUpdateProfile = async (updatedData) => {
  try {
    const response = await authAPI.updateProfile({
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'I am a student...'
    });
    updateUser(response.data.user);
    toast.success('Profile updated!');
  } catch (error) {
    toast.error('Update failed');
  }
};
```

---

## Room Management

### Get All Rooms

```javascript
import { roomAPI } from '../api';
import { useState, useEffect } from 'react';

function RoomsList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomAPI.getAllRooms({
          location: 'Delhi',
          minPrice: 5000,
          maxPrice: 50000
        });
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div>
      {rooms.map(room => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
}
```

### Get Room Details

```javascript
import { useParams } from 'react-router-dom';

function RoomDetail() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomAPI.getRoomById(roomId);
        setRoom(response.data.room);
      } catch (error) {
        toast.error('Room not found');
      }
    };

    fetchRoom();
  }, [roomId]);

  return <div>{room?.title}</div>;
}
```

### Create Room (Owner)

```javascript
const handleCreateRoom = async (formData) => {
  try {
    const response = await roomAPI.createRoom({
      title: 'Spacious 1BHK',
      description: 'Beautiful room near college',
      price: 15000,
      location: 'Delhi',
      amenities: ['WiFi', 'AC', 'Bed'],
      size: '250 sq ft',
      deposit: 5000,
      availableFrom: '2026-02-01',
      image: 'https://...'
    });
    
    toast.success('Room created successfully!');
    setRooms([...rooms, response.data.room]);
  } catch (error) {
    toast.error('Failed to create room');
  }
};
```

### Update Room (Owner)

```javascript
const handleUpdateRoom = async (roomId, updates) => {
  try {
    const response = await roomAPI.updateRoom(roomId, {
      title: 'Updated Title',
      price: 16000,
      active: true
    });
    
    toast.success('Room updated!');
    // Update local state
  } catch (error) {
    toast.error('Update failed');
  }
};
```

### Delete Room (Owner)

```javascript
const handleDeleteRoom = async (roomId) => {
  if (!window.confirm('Delete this room?')) return;

  try {
    await roomAPI.deleteRoom(roomId);
    toast.success('Room deleted!');
    setRooms(rooms.filter(r => r._id !== roomId));
  } catch (error) {
    toast.error('Delete failed');
  }
};
```

---

## Favorites

### Add to Favorites

```javascript
import { favoriteAPI } from '../api';

const handleAddFavorite = async (roomId) => {
  try {
    await favoriteAPI.addToFavorites(roomId);
    toast.success('Added to favorites!');
    setIsFavorite(true);
  } catch (error) {
    toast.error('Failed to add favorite');
  }
};
```

### Remove from Favorites

```javascript
const handleRemoveFavorite = async (roomId) => {
  try {
    await favoriteAPI.removeFromFavorites(roomId);
    toast.success('Removed from favorites');
    setIsFavorite(false);
  } catch (error) {
    toast.error('Failed to remove favorite');
  }
};
```

### Get User Favorites

```javascript
useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getUserFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  fetchFavorites();
}, []);
```

### Check if Room is Favorite

```javascript
useEffect(() => {
  const checkFavorite = async () => {
    try {
      const response = await favoriteAPI.checkIsFavorite(roomId);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Check failed:', error);
    }
  };

  checkFavorite();
}, [roomId]);
```

---

## Messages

### Send Message

```javascript
import { messageAPI } from '../api';

const handleSendMessage = async (receiverId, content) => {
  try {
    const response = await messageAPI.sendMessage(
      receiverId,
      content,
      roomId
    );
    
    setMessages([...messages, response.data.data]);
    setMessageText('');
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

### Get Conversation

```javascript
useEffect(() => {
  const fetchConversation = async () => {
    try {
      const response = await messageAPI.getConversation(userId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  fetchConversation();
}, [userId]);
```

### Get All Conversations

```javascript
useEffect(() => {
  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getAllConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchConversations();
}, []);
```

### Mark Message as Read

```javascript
const handleMarkAsRead = async (messageId) => {
  try {
    await messageAPI.markAsRead(messageId);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get Unread Count

```javascript
useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const response = await messageAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchUnreadCount();
}, []);
```

---

## Connections

### Create Connection

```javascript
import { connectionAPI } from '../api';

const handleCreateConnection = async (connectionData) => {
  try {
    const response = await connectionAPI.createConnection({
      roomId: room._id,
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      studentPhone: '9876543210',
      moveInDate: '2026-03-01',
      duration: '12 months',
      message: 'I am interested in this room'
    });
    
    toast.success('Connection request sent!');
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### Get User Connections

```javascript
useEffect(() => {
  const fetchConnections = async () => {
    try {
      const response = await connectionAPI.getUserConnections();
      setConnections(response.data.connections);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchConnections();
}, []);
```

### Update Connection Status

```javascript
const handleUpdateStatus = async (connectionId, status) => {
  try {
    await connectionAPI.updateConnectionStatus(connectionId, status);
    toast.success(`Connection ${status}!`);
    // Refetch connections
  } catch (error) {
    toast.error('Update failed');
  }
};
```

### Schedule Viewing

```javascript
const handleScheduleViewing = async (connectionId, date) => {
  try {
    await connectionAPI.scheduleViewing(connectionId, date);
    toast.success('Viewing scheduled!');
  } catch (error) {
    toast.error('Failed to schedule viewing');
  }
};
```

---

## Reviews

### Create Review

```javascript
import { reviewAPI } from '../api';

const handleCreateReview = async (reviewData) => {
  try {
    const response = await reviewAPI.createReview({
      roomId,
      rating: 4,
      title: 'Great room!',
      comment: 'Very comfortable and clean room'
    });
    
    toast.success('Review posted!');
    setReviews([...reviews, response.data.review]);
  } catch (error) {
    toast.error('Failed to post review');
  }
};
```

### Get Room Reviews

```javascript
useEffect(() => {
  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getRoomReviews(roomId);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchReviews();
}, [roomId]);
```

### Get Owner Reviews

```javascript
const fetchOwnerReviews = async (ownerId) => {
  try {
    const response = await reviewAPI.getOwnerReviews(ownerId);
    setOwnerReviews(response.data.reviews);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Update Review

```javascript
const handleUpdateReview = async (reviewId, updates) => {
  try {
    const response = await reviewAPI.updateReview(reviewId, {
      rating: 5,
      title: 'Excellent room!',
      comment: 'Even better on second visit'
    });
    
    toast.success('Review updated!');
  } catch (error) {
    toast.error('Update failed');
  }
};
```

### Delete Review

```javascript
const handleDeleteReview = async (reviewId) => {
  try {
    await reviewAPI.deleteReview(reviewId);
    toast.success('Review deleted!');
    setReviews(reviews.filter(r => r._id !== reviewId));
  } catch (error) {
    toast.error('Delete failed');
  }
};
```

---

## Error Handling

### Global Error Handler Pattern

```javascript
const handleAPICall = async (apiFunction, onSuccess, errorMessage = 'Operation failed') => {
  try {
    const response = await apiFunction();
    onSuccess(response.data);
  } catch (error) {
    const message = error.response?.data?.message || errorMessage;
    toast.error(message);
    console.error('API Error:', error);
  }
};

// Usage
handleAPICall(
  () => roomAPI.getAllRooms(),
  (data) => setRooms(data.rooms),
  'Failed to load rooms'
);
```

### Axios Interceptor (Already in api.js)

```javascript
// Request interceptor adds token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Tips & Best Practices

✅ **Always use try-catch** for API calls
✅ **Show loading state** while fetching
✅ **Validate data** before sending
✅ **Handle errors gracefully** with toast
✅ **Use refetch functions** to keep data fresh
✅ **Store tokens** securely
✅ **Check auth** before protected operations
✅ **Log errors** for debugging
✅ **Test with demo** accounts first
✅ **Handle rate limiting** appropriately

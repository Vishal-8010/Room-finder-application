import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import MessagesPage from './pages/MessagesPage';
import ConnectionsPage from './pages/ConnectionsPage';
import DocumentsPage from './pages/DocumentsPage';
import HostDashboardPage from './pages/HostDashboardPage';
import EditRoomPage from './pages/EditRoomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminConnectionsPage from './pages/AdminConnectionsPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/rooms" />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/rooms" />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/room/:roomId" element={<RoomDetailPage />} />

            {/* Protected Routes */}
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/favorites" element={user ? <FavoritesPage /> : <Navigate to="/login" />} />
            <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" />} />
            <Route path="/connections" element={user ? <ConnectionsPage /> : <Navigate to="/login" />} />
            <Route path="/documents" element={user ? <DocumentsPage /> : <Navigate to="/login" />} />

            {/* Owner Routes */}
            <Route
              path="/host"
              element={user?.role === 'owner' ? <HostDashboardPage /> : <Navigate to="/rooms" />}
            />
            <Route
              path="/host/edit/:roomId"
              element={user?.role === 'owner' ? <EditRoomPage /> : <Navigate to="/rooms" />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={user?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/rooms" />}
            />
            <Route
              path="/admin/rooms"
              element={user?.role === 'admin' ? <AdminRoomsPage /> : <Navigate to="/rooms" />}
            />
            <Route
              path="/admin/users"
              element={user?.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/rooms" />}
            />
            <Route
              path="/admin/reviews"
              element={user?.role === 'admin' ? <AdminReviewsPage /> : <Navigate to="/rooms" />}
            />
            <Route
              path="/admin/connections"
              element={user?.role === 'admin' ? <AdminConnectionsPage /> : <Navigate to="/rooms" />}
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React from 'react';

export default function ProtectedRoute({ children, user, requiredRole = null }) {
    if (!user) {
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    return children;
}
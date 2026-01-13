import { Navigate } from 'react-router-dom';
import React from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

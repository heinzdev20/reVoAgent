import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSuperuser?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireSuperuser = false,
}) => {
  const { isAuthenticated, user, isLoading, fetchCurrentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If superuser is required but user is not a superuser
  if (requireSuperuser && (!user || !user.is_superuser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but account is inactive
  if (requireAuth && user && !user.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Account Inactive</h1>
          <p className="text-gray-300">Your account has been deactivated. Please contact support.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
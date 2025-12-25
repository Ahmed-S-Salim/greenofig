import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple redirect component - just sends to /app which handles role-based routing
const UsernameProfile = () => {
  return <Navigate to="/app" replace />;
};

export default UsernameProfile;

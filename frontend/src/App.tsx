import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Homepage from './pages/homepage';
import Login from './pages/login';
import Signup from './pages/signup';
import Calendar from './pages/calendar';

import { AuthProvider, useAuth } from './hooks/useAuth';

// ---- Protected Route ----
// 2. Use React.ReactNode instead of JSX.Element for the children prop
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Wrap children in a fragment to satisfy TypeScript return types safely
  return <>{children}</>; 
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
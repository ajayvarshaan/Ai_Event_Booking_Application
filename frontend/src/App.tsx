import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import PlanEvening from './pages/PlanEvening';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Chatbot from './components/Chatbot';
import { useAuth } from './context/AuthContext';
import { pageTransition, revealRouteShell } from './animations/gsapAnimations';

const AppShell: React.FC = () => {
  const location = useLocation();
  const routeShellRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    pageTransition();
    revealRouteShell(routeShellRef.current);
  }, [location.pathname]);

  return (
    <div ref={routeShellRef} className="app-route-shell">
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes - redirect to home if authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <>
                <Navbar />
                <Dashboard />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:eventId"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Booking />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MyBookings />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Wishlist />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Compare />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan-evening"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <PlanEvening />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute requireAdmin={true}>
              <>
                <Navbar />
                <CreateEvent />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:eventId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <>
                <Navbar />
                <EditEvent />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-log"
          element={
            <ProtectedRoute requireAdmin={true}>
              <>
                <Navbar />
                <ActivityLog />
              </>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {isAuthenticated && <Chatbot />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="page-transition"></div>
        <AppShell />
      </Router>
    </AuthProvider>
  );
};

export default App;

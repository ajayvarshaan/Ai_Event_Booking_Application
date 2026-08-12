import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Chatbot from './components/Chatbot';
import { useAuth } from './context/AuthContext';
import { pageTransition, revealRouteShell } from './animations/gsapAnimations';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Booking = lazy(() => import('./pages/Booking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const EditEvent = lazy(() => import('./pages/EditEvent'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const PlanEvening = lazy(() => import('./pages/PlanEvening'));

const RouteLoader: React.FC = () => (
  <div className="route-loader">
    <div className="route-loader-spinner" />
    <span>Loading…</span>
  </div>
);

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
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {}
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

        {}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
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

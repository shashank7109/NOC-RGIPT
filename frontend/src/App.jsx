import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

// Placeholder Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import TNPHeadDashboard from './pages/TNPHeadDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Application...</div>;

  return (
    <Router>
      <Toaster position="top-right" />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/officer/*" element={
            <ProtectedRoute allowedRoles={['DeptOfficer']}>
              <OfficerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tnphead/*" element={
            <ProtectedRoute allowedRoles={['TNPHead']}>
              <TNPHeadDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
              user.role === 'Student' ? <Navigate to="/student" /> :
                user.role === 'DeptOfficer' ? <Navigate to="/officer" /> :
                  user.role === 'TNPHead' ? <Navigate to="/tnphead" /> :
                    <Navigate to="/admin" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

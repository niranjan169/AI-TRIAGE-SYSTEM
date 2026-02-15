import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboard from './pages/PatientDashboard';
import SmartAssessment from './pages/SmartAssessment';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import DoctorTest from './pages/DoctorTest';
import AILab from './pages/AILab';
import Navigation from './components/Navigation';
import './App.css';
import './styles/backgrounds.css';

import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            {/* Public route - Login */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/patient'} replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            {/* Protected routes - Patient */}
            <Route
              path="/patient"
              element={
                user && user.role === 'patient' ? (
                  <PatientDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/assessment"
              element={
                user && user.role === 'patient' ? (
                  <SmartAssessment />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/ailab"
              element={
                user && user.role === 'patient' ? (
                  <AILab />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Protected route - Admin */}
            <Route
              path="/admin"
              element={
                user && user.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Doctor Test Page - Admin Only */}
            <Route
              path="/doctors"
              element={
                user && user.role === 'admin' ? (
                  <DoctorTest />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Default redirect */}
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    user
                      ? (user.role === 'admin' ? '/admin' : '/patient')
                      : '/login'
                  }
                  replace
                />
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        {user && user.role === 'patient' && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientDashboard from './components/dashboards/PatientDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import AppointmentBooking from './components/appointments/AppointmentBooking';
import HealthRecords from './components/records/HealthRecords';
import Prescriptions from './components/prescriptions/Prescriptions';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <AppointmentBooking />
                </ProtectedRoute>
              } />
              
              <Route path="/records" element={
                <ProtectedRoute>
                  <HealthRecords />
                </ProtectedRoute>
              } />
              
              <Route path="/prescriptions" element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
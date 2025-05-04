import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';

// Patient Pages
import PatientLogin from './pages/patient/PatientLogin';
import PatientRegister from './pages/patient/PatientRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';

// Doctor Pages
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ManageAppointments from './pages/doctor/ManageAppointments';
import ManageTimeSlots from './pages/doctor/ManageTimeSlots';

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role: 'patient' | 'doctor' }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={role === 'patient' ? '/patient/login' : '/doctor/login'} />;
  }
  
  if (user.role !== role) {
    return <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/patient/login" />} />
      
      {/* Patient Routes */}
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      
      <Route path="/patient" element={
        <ProtectedRoute role="patient">
          <PatientLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<PatientAppointments />} />
      </Route>
      
      {/* Doctor Routes */}
      <Route path="/doctor/login" element={<DoctorLogin />} />
      
      <Route path="/doctor" element={
        <ProtectedRoute role="doctor">
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="time-slots" element={<ManageTimeSlots />} />
      </Route>
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Faculties from './pages/Faculties';
import Users from './pages/Users';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Requests from './pages/Requests';
import StudentDashboard from './pages/StudentDashboard';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role === 'Student') return <Navigate to="/student" replace />;
  return <>{children}</>;
};

const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role !== 'Student') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="faculties" element={<Faculties />} />
              <Route path="users" element={<Users />} />
              <Route path="requests" element={<Requests />} />
            </Route>
            <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

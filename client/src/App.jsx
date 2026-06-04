import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EventList from './pages/public/EventList';
import EventDetail from './pages/public/EventDetail';

// Student
import StudentDashboard from './pages/student/Dashboard';
import Registrations from './pages/student/Registrations';
import Teams from './pages/student/Teams';
import Attendance from './pages/student/Attendance';
import Certificates from './pages/student/Certificates';
import Announcements from './pages/student/Announcements';
import Feedback from './pages/student/Feedback';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAttendance from './pages/admin/AdminAttendance';
import Analytics from './pages/admin/Analytics';

function ProtectedRoute({ allowedRole }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/registrations" element={<Registrations />} />
              <Route path="/student/teams" element={<Teams />} />
              <Route path="/student/attendance" element={<Attendance />} />
              <Route path="/student/certificates" element={<Certificates />} />
              <Route path="/student/announcements" element={<Announcements />} />
              <Route path="/student/feedback" element={<Feedback />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

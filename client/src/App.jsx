import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Teams from './pages/Teams';
import Certificates from './pages/Certificates';
import AdminEvents from './pages/admin/AdminEvents';
import AdminTeams from './pages/admin/AdminTeams';
import AdminAttendance from './pages/admin/AdminAttendance';
import VerifyCertificate from './pages/VerifyCertificate';
import Announcements from './pages/Announcements';
import Registrations from './pages/Registrations';
import Attendance from './pages/Attendance';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/verify/:certId" element={<VerifyCertificate />} />

      <Route element={<Layout />}>
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/registrations" element={<ProtectedRoute><Registrations /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute role="student"><Attendance /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute role="student"><Teams /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute role="student"><Certificates /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute role="admin"><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/teams" element={<ProtectedRoute role="admin"><AdminTeams /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AdminAttendance /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiCalendar, FiUsers, FiAward, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="glass-effect w-full h-16 flex items-center justify-between px-4 sm:px-8 lg:px-16 fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
            CampusCast
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn btn-secondary hidden sm:flex">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold tracking-wide">
            THE ULTIMATE COLLEGE EVENT PORTAL
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Manage events, teams, and attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">seamlessly.</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Real-time seat tracking, smart attendance verification, team formation, and automated certificates — all in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary px-8 py-4 text-lg">
              Get Started <FiArrowRight className="ml-2" />
            </Link>
            <Link to="/admin/login" className="btn btn-secondary px-8 py-4 text-lg">
              Admin Access
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto w-full">
          <FeatureCard 
            icon={<FiCalendar size={24} />}
            title="Event Registration"
            desc="Real-time seat availability and seamless registration."
            color="text-blue-500 bg-blue-100 dark:bg-blue-900/30"
          />
          <FeatureCard 
            icon={<FiUsers size={24} />}
            title="Team Formation"
            desc="Create or join teams securely using unique codes."
            color="text-purple-500 bg-purple-100 dark:bg-purple-900/30"
          />
          <FeatureCard 
            icon={<FiCheckCircle size={24} />}
            title="Smart Attendance"
            desc="Time-limited unique codes for secure verification."
            color="text-green-500 bg-green-100 dark:bg-green-900/30"
          />
          <FeatureCard 
            icon={<FiAward size={24} />}
            title="Instant Certificates"
            desc="Automated PDF generation for attendees."
            color="text-orange-500 bg-orange-100 dark:bg-orange-900/30"
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="card p-6 flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
  </div>
);

export default Home;

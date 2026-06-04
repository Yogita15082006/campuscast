import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = {
  student: { name: 'Alex Johnson', email: 'alex@university.edu', role: 'student' },
  admin: { name: 'Sarah Admin', email: 'admin@university.edu', role: 'admin' }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (role) => {
    setCurrentUser(MOCK_USERS[role]);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

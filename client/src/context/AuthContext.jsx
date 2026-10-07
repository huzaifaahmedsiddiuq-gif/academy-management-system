import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const normalizeUserData = (rawUser) => {
  if (!rawUser) return null;
  const student = rawUser.student || rawUser.profile || null;
  const studentId = rawUser.studentId || student?.id || (rawUser.role === 'student' ? rawUser.id : null);
  const teacher = rawUser.teacher || rawUser.profile || null;
  const teacherId = rawUser.teacherId || teacher?.id || (rawUser.role === 'teacher' ? rawUser.id : null);
  return {
    ...rawUser,
    student: rawUser.role === 'student' ? student : rawUser.student,
    studentId: rawUser.role === 'student' ? studentId : null,
    teacher: rawUser.role === 'teacher' ? teacher : rawUser.teacher,
    teacherId: rawUser.role === 'teacher' ? teacherId : null
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem('academy_user');
      return saved ? normalizeUserData(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('academy_token') || null);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser) => {
    const normalized = normalizeUserData(newUser);
    setUserState(normalized);
    if (normalized) {
      localStorage.setItem('academy_user', JSON.stringify(normalized));
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      localStorage.setItem('academy_token', receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem('academy_token');
    localStorage.removeItem('academy_user');
  };

  const role = user?.role || null;
  const studentId = user?.studentId || user?.student?.id || user?.profile?.id || (role === 'student' ? user?.id : null);
  const teacherId = user?.teacherId || user?.teacher?.id || user?.profile?.id || (role === 'teacher' ? user?.id : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        studentId,
        teacherId,
        token,
        role,
        isAuthenticated: !!token && !!user,
        isAdmin: role === 'admin',
        isTeacher: role === 'teacher',
        isStudent: role === 'student',
        loading,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

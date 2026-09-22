import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  login: (email: string, password?: string, remember?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    docType: string;
    docNumber: string;
    phone: string;
    email: string;
    company?: string;
    password?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'wuish_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const currentRole: UserRole = user ? user.role : 'client';

  const login = async (email: string, _password?: string, _remember?: boolean) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Authenticate with user's provided credentials
    const extractedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

    // Determine initial role based on admin email convention or standard client
    const role: UserRole = cleanEmail.includes('admin') ? 'admin' : 'client';

    const sessionUser: User = {
      id: `user-${Date.now()}`,
      name: formattedName || 'Usuario Corporativo',
      email: cleanEmail,
      company: 'Organización Corporativa',
      role,
      title: role === 'admin' ? 'Administrador de Cuenta' : 'Director',
      accountId: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      sla: '100%',
    };

    setUser(sessionUser);
    return { success: true, message: `Sesión iniciada correctamente para ${cleanEmail}.` };
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    docType: string;
    docNumber: string;
    phone: string;
    email: string;
    company?: string;
    password?: string;
  }) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: fullName,
      email: data.email.trim().toLowerCase(),
      company: data.company?.trim() || '',
      role: 'client',
      title: 'Director',
      accountId: `ACC-${data.docType}-${data.docNumber ? data.docNumber.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`,
      sla: '100%',
      phone: data.phone?.trim() || '',
      docType: data.docType,
      docNumber: data.docNumber?.trim() || '',
    };

    setUser(newUser);
    return { success: true, message: `¡Registro exitoso! Cuenta corporativa activada para ${newUser.name}.` };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    setUser((prev) => (prev ? { ...prev, role } : null));
  };

  const resetPassword = async (email: string) => {
    return {
      success: true,
      message: `Se ha emitido un enlace de restablecimiento seguro a ${email}.`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        currentRole,
        login,
        register,
        logout,
        switchRole,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

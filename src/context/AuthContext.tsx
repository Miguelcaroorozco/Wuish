import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setToken, removeToken, getToken, usuariosApi } from '../lib/api';

export type UserRole = 'usuario' | 'admin' | 'administrador';

export interface AuthUser {
  id: string;
  nombres: string;
  apellidos: string;
  numero_cedula: string;
  tipo_documento: string;
  fecha_nacimiento: string;
  telefono: string | null;
  correo: string;
  empresa?: string | null;
  cargo?: string | null;
  rol: string;
  permisos?: string[] | null;
  preferencias?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  currentRole: string;
  loading: boolean;
  login: (correo: string, password: string) => Promise<{ success: boolean; message: string; role: string }>;
  register: (data: {
    nombres: string;
    apellidos: string;
    numero_cedula: string;
    tipo_documento: string;
    fecha_nacimiento: string;
    telefono?: string;
    correo: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; role: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'wuish_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  // On mount, verify the existing token is still valid
  useEffect(() => {
    const token = getToken();
    if (token && user) {
      authApi.getProfile()
        .then((profileUser) => {
          setUser(profileUser);
        })
        .catch(() => {
          // Token expired or invalid — clear state
          setUser(null);
          removeToken();
          localStorage.removeItem(USER_STORAGE_KEY);
        });
    }
  }, []);

  const currentRole: string = user?.rol || 'usuario';

  const login = async (correo: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(correo, password);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message, role: res.user?.rol || 'usuario' };
      }
      return { success: false, message: 'Error de autenticación', role: 'usuario' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al verificar las credenciales', role: 'usuario' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    nombres: string;
    apellidos: string;
    numero_cedula: string;
    tipo_documento: string;
    fecha_nacimiento: string;
    telefono?: string;
    correo: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message, role: res.user?.rol || 'usuario' };
      }
      return { success: false, message: 'Error de registro', role: 'usuario' };
    } catch (error: any) {
      return { success: false, message: error.message || 'No se pudo completar el registro', role: 'usuario' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    return {
      success: false,
      message: `La recuperación de contraseña aún no está habilitada para ${email}. Contacta al administrador.`,
    };
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    const payload = {
      ...(data.nombres !== undefined ? { nombres: data.nombres } : {}),
      ...(data.apellidos !== undefined ? { apellidos: data.apellidos } : {}),
      ...(data.telefono !== undefined ? { telefono: data.telefono || undefined } : {}),
      ...(data.empresa !== undefined ? { empresa: data.empresa || undefined } : {}),
      ...(data.cargo !== undefined ? { cargo: data.cargo || undefined } : {}),
      ...(data.preferencias !== undefined ? { preferencias: data.preferencias } : {}),
      ...(data.permisos !== undefined ? { permisos: data.permisos || [] } : {}),
    };
    const updatedUser = await usuariosApi.updateMe(payload);
    setUser(updatedUser);
    return { success: true, message: 'Perfil actualizado correctamente.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        currentRole,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
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

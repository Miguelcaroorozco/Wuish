import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginFormProps {
  onSuccess: (role: string) => void;
  onOpenForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onOpenForgot }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [loginUser, setLoginUser] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!loginUser.trim()) newErrors.correo = 'Ingresa tu usuario o correo corporativo';
    if (!loginPwd.trim()) newErrors.password = 'Ingresa tu contraseña';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await login(loginUser, loginPwd);
      if (res.success) {
        showToast('Acceso Concedido', res.message, 'success');
        onSuccess(res.role || 'usuario');
      } else {
        showToast('Acceso Denegado', res.message, 'error');
      }
    } catch {
      showToast('Error', 'Ocurrió un error al verificar las credenciales', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-semibold text-[#e5e1e4] font-display tracking-tight">
          Bienvenido al Ecosistema
        </h2>
        <p className="text-sm text-[#d1c5af] mt-1 font-sans">
          Ingresa tus credenciales corporativas autorizadas.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLoginSubmit}>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#e5e1e4] uppercase tracking-wider">
            Usuario o Correo Corporativo
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-[#9a907c] w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={loginUser}
              onChange={(e) => { setLoginUser(e.target.value); if (errors.correo) setErrors((p) => ({ ...p, correo: undefined })); }}
              placeholder="contacto@empresa.com"
              className={`w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/70 pl-11 pr-4 py-3 rounded-xl border focus:outline-none text-sm shadow-inner transition ${errors.correo ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]/60'}`}
            />
          </div>
          {errors.correo && (
            <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />{errors.correo}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#e5e1e4] uppercase tracking-wider">
              Contraseña
            </label>
            <button
              type="button"
              onClick={onOpenForgot}
              className="text-xs text-[#ffd56d] hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#9a907c] w-5 h-5 pointer-events-none" />
            <input
              type={showLoginPwd ? 'text' : 'password'}
              value={loginPwd}
              onChange={(e) => { setLoginPwd(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              className={`w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/70 pl-11 pr-11 py-3 rounded-xl border focus:outline-none text-sm shadow-inner transition ${errors.password ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]/60'}`}
            />
            <button
              type="button"
              onClick={() => setShowLoginPwd(!showLoginPwd)}
              className="absolute right-3.5 text-[#9a907c] hover:text-white flex items-center p-1 cursor-pointer"
            >
              {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />{errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center pt-1">
          <label className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0e0e10] border-white/20 text-[#ffd56d] accent-[#ffd56d]"
            />
            <span className="text-xs text-[#d1c5af] select-none">Recordar esta estación por 30 días</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Verificando...' : 'Acceder a la Plataforma'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

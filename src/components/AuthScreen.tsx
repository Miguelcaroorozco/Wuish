import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { WuishLogo } from './WuishLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Terminal,
  Compass,
  BarChart3,
  KeyRound,
  Phone,
  UserCheck
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
  onSuccessAuth?: (role: string) => void;
  isModal?: boolean;
}

const PILLARS = [
  { icon: Megaphone, title: 'Comunicación', desc: 'Narrativas corporativas de alto impacto y reputación.' },
  { icon: Terminal, title: 'Tecnología', desc: 'Infraestructura escalable y arquitecturas digitales sólidas.' },
  { icon: Compass, title: 'Estrategia', desc: 'Modelos de negocio ágiles orientados a expansión real.' },
  { icon: BarChart3, title: 'Datos & IA', desc: 'Analítica predictiva y decisión informada en tiempo real.' },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onSuccessAuth, isModal = false }) => {
  const handleSuccess = (role: string) => {
    if (onSuccess) onSuccess();
    if (onSuccessAuth) onSuccessAuth(role);
  };
  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDocType, setRegDocType] = useState('CC');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regConfirmPwd, setRegConfirmPwd] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser) {
      showToast('Error', 'Por favor ingresa tu usuario o correo corporativo', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginUser, loginPwd);
      if (res.success) {
        showToast('Acceso Concedido', res.message, 'success');
        handleSuccess(res.role || 'usuario');
      } else {
        showToast('Acceso Denegado', res.message, 'error');
      }
    } catch {
      showToast('Error', 'Ocurrió un error al verificar las credenciales', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPwd !== regConfirmPwd) {
      showToast('Error de Validación', 'Las contraseñas no coinciden', 'error');
      return;
    }
    if (regPwd.length < 6) {
      showToast('Contraseña Insegura', 'La contraseña debe contener al menos 6 caracteres', 'error');
      return;
    }
    if (!acceptedTerms) {
      showToast('Términos Requeridos', 'Debes aceptar los términos y políticas confidenciales', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        nombres: regFirstName,
        apellidos: regLastName,
        tipo_documento: regDocType,
        numero_cedula: regDocNumber,
        telefono: regPhone,
        correo: regEmail,
        fecha_nacimiento: regBirthDate,
        password: regPwd,
      });

      if (res.success) {
        showToast('Registro Exitoso', res.message, 'success');
        handleSuccess(res.role || 'usuario');
      } else {
        showToast('Error de Registro', res.message, 'error');
      }
    } catch {
      showToast('Error', 'No se pudo procesar la solicitud de registro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await resetPassword(forgotEmail);
    showToast('Enlace de Restablecimiento', res.message, 'info');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-10 flex items-center justify-center'}`}>
      <div className="w-full max-w-[1560px] mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-[#0e0e10] border border-[#ffd56d]/20 overflow-hidden shadow-2xl relative">
          
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd56d] to-transparent opacity-80 pointer-events-none z-30" />

          {/* LEFT PANE: Brand Showcase & Pillars */}
          <div className="lg:col-span-6 xl:col-span-7 bg-[#1c1b1d] p-8 sm:p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ffd56d]/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <div className="w-full flex justify-center lg:justify-start">
                <WuishLogo size="hero" />
              </div>

              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#353437]/60 backdrop-blur-md border border-[#ffd56d]/20 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
                <span className="text-[11px] font-semibold text-[#ffd56d] tracking-[0.2em] uppercase font-display">
                  WE UNITE IDEAS, STRATEGY &amp; HORIZONS
                </span>
              </div>

              <p className="text-xl sm:text-2xl text-[#e5e1e4] leading-snug font-medium font-display max-w-xl">
                “No te vendemos tecnología ni marketing. Analizamos tu negocio y construimos lo que necesitas para crecer.”
              </p>
            </div>

            <div className="relative z-10 my-8 sm:my-10">
              <div className="text-[11px] font-semibold text-[#9a907c] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>Ecosistema de Transformación</span>
                <span className="h-[1px] flex-1 bg-[#353437]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PILLARS.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-[#201f21]/80 border border-white/5 flex items-start space-x-3.5 group hover:bg-[#2a2a2c] hover:border-[#ffd56d]/30 transition-all duration-200">
                      <div className="w-9 h-9 rounded-lg bg-[#ffd56d]/10 flex items-center justify-center shrink-0 text-[#ffd56d]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-[#e5e1e4] block">{p.title}</span>
                        <span className="text-xs text-[#d1c5af]/80 line-clamp-1">{p.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-[#9a907c] border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#ffd56d]" />
                Portal Estratégico Institucional
              </span>
              <span className="text-[11px] font-semibold tracking-widest text-[#ffd56d]/90 uppercase font-display">
                EDICIÓN 2025
              </span>
            </div>
          </div>

          {/* RIGHT PANE: Dual Tab Form */}
          <div className="lg:col-span-6 xl:col-span-5 bg-[#201f21] p-6 sm:p-10 xl:p-12 flex flex-col justify-center relative">
            <div className="w-full bg-[#0e0e10] p-1 rounded-xl mb-7 flex items-center relative border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#2a2a2c] text-[#ffd56d] shadow-sm border border-[#ffd56d]/30'
                    : 'text-[#d1c5af] hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[#2a2a2c] text-[#ffd56d] shadow-sm border border-[#ffd56d]/30'
                    : 'text-[#d1c5af] hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Crear Cuenta</span>
              </button>
            </div>

            {/* TAB: LOGIN */}
            {activeTab === 'login' && (
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
                        required
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        placeholder="contacto@empresa.com"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/70 pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-sm shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#e5e1e4] uppercase tracking-wider">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-[#ffd56d] hover:underline cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 text-[#9a907c] w-5 h-5 pointer-events-none" />
                      <input
                        type={showLoginPwd ? 'text' : 'password'}
                        required
                        value={loginPwd}
                        onChange={(e) => setLoginPwd(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/70 pl-11 pr-11 py-3 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-sm shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPwd(!showLoginPwd)}
                        className="absolute right-3.5 text-[#9a907c] hover:text-white flex items-center p-1 cursor-pointer"
                      >
                        {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
            )}

            {/* TAB: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-semibold text-[#e5e1e4] font-display tracking-tight">
                    Crear Cuenta Corporativa
                  </h2>
                  <p className="text-sm text-[#d1c5af] mt-1">
                    Registra tu organización en la red estratégica WUISH.
                  </p>
                </div>

                <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Nombres *</label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Nombres"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Apellidos"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Tipo Doc.</label>
                      <select
                        value={regDocType}
                        onChange={(e) => setRegDocType(e.target.value)}
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PAS">Pasaporte</option>
                        <option value="NIT">NIT</option>
                      </select>
                    </div>
                    <div className="sm:col-span-7 space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Número de Documento *</label>
                      <input
                        type="text"
                        required
                        value={regDocNumber}
                        onChange={(e) => setRegDocNumber(e.target.value)}
                        placeholder="N° de identificación fiscal"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Teléfono WhatsApp *</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+1 234 567 8900"
                          className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Correo Corporativo *</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="contacto@empresa.com"
                          className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#e5e1e4]">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      required
                      value={regBirthDate}
                      onChange={(e) => setRegBirthDate(e.target.value)}
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Contraseña *</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                        <input
                          type={showRegPwd ? 'text' : 'password'}
                          required
                          value={regPwd}
                          onChange={(e) => setRegPwd(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-8 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPwd(!showRegPwd)}
                          className="absolute right-2.5 text-[#9a907c] hover:text-white flex items-center p-1 cursor-pointer"
                        >
                          {showRegPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#e5e1e4]">Confirmar *</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                        <input
                          type={showRegPwd ? 'text' : 'password'}
                          required
                          value={regConfirmPwd}
                          onChange={(e) => setRegConfirmPwd(e.target.value)}
                          placeholder="Repite la clave"
                          className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#0e0e10] border-white/20 text-[#ffd56d] accent-[#ffd56d]"
                      />
                      <span className="text-xs text-[#d1c5af] select-none">
                        Acepto los términos de servicio y políticas de confidencialidad
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registrando...' : 'Completar Registro'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-white font-display mb-1">Recuperar Contraseña</h3>
            <p className="text-xs text-[#9a907c] mb-4">Ingresa tu correo para recibir las instrucciones de restablecimiento.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d] focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold shadow-md cursor-pointer"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

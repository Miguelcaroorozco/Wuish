import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

registerLocale('es', es);

interface RegisterFormProps {
  onSuccess: (role: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDocType, setRegDocType] = useState('CC');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regPhone, setRegPhone] = useState('57');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState<Date | null>(null);
  const [regPwd, setRegPwd] = useState('');
  const [regConfirmPwd, setRegConfirmPwd] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        telefono: `+${regPhone}`,
        correo: regEmail,
        fecha_nacimiento: regBirthDate ? regBirthDate.toISOString().split('T')[0] : '',
        password: regPwd,
      });

      if (res.success) {
        showToast('Registro Exitoso', res.message, 'success');
        onSuccess(res.role || 'usuario');
      } else {
        showToast('Error de Registro', res.message, 'error');
      }
    } catch {
      showToast('Error', 'No se pudo procesar la solicitud de registro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-semibold text-[#e5e1e4] font-display tracking-tight">
          Crear Cuenta Corporativa
        </h2>
        <p className="text-sm text-[#d1c5af] mt-1">
          Registra tu organización en la red estratégica WUISH.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleRegisterSubmit} autoComplete="off">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#e5e1e4]">Nombres *</label>
            <input
              type="text"
              required
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
            <PhoneInput
              country={'co'}
              value={regPhone}
              onChange={(val) => setRegPhone(val)}
              inputStyle={{
                width: '100%',
                background: '#0e0e10',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#e5e1e4',
                fontSize: '12px',
                height: '38px',
                paddingLeft: '52px',
              }}
              buttonStyle={{
                background: '#0e0e10',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem 0 0 0.75rem',
              }}
              dropdownStyle={{
                background: '#1a1a1c',
                border: '1px solid rgba(255,213,109,0.25)',
                borderRadius: '0.75rem',
                color: '#e5e1e4',
              }}
              searchStyle={{
                background: '#0e0e10',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: '#e5e1e4',
                width: '90%',
              }}
              enableSearch
              searchPlaceholder="Buscar país..."
              placeholder="300 123 4567"
              containerStyle={{ width: '100%' }}
              inputProps={{ autoComplete: 'off' }}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#e5e1e4]">Correo Corporativo *</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="off"
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
          <div className="relative">
            <DatePicker
              selected={regBirthDate}
              onChange={(date) => setRegBirthDate(date)}
              locale="es"
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/aaaa"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              className="wuish-datepicker"
              calendarClassName="wuish-calendar"
              wrapperClassName="w-full"
              autoComplete="off"
            />
            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c] pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#e5e1e4]">Contraseña *</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
              <input
                type={showRegPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
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
                autoComplete="new-password"
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
  );
};

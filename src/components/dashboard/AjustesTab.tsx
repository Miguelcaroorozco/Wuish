import React, { useState, useEffect } from 'react';
import {
  User,
  Layers,
  Lock,
  Bell,
  Building2,
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  Shield,
  Save,
  KeyRound,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Clock,
} from 'lucide-react';
import { usuariosApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface AjustesTabProps {
  user: any;
  updateProfile: (data: any) => Promise<any>;
  activePlanRecord: any;
  contractedServices: any[];
  solicitudes: any[];
  messages: any[];
  onNavigateTab: (tab: any) => void;
}

export const AjustesTab: React.FC<AjustesTabProps> = ({
  user,
  updateProfile,
  activePlanRecord,
  contractedServices,
  solicitudes,
  messages,
  onNavigateTab,
}) => {
  const { showToast } = useToast();

  const hasActiveContractedPlan = Boolean(
    activePlanRecord && (contractedServices.length > 0 || activePlanRecord.plan_id || activePlanRecord.plan)
  );

  const [ajustesSubTab, setAjustesSubTab] = useState<'perfil' | 'plan' | 'seguridad' | 'preferencias'>('perfil');
  const [ajustesNombres, setAjustesNombres] = useState(user?.nombres || '');
  const [ajustesApellidos, setAjustesApellidos] = useState(user?.apellidos || '');
  const [ajustesTelefono, setAjustesTelefono] = useState(user?.telefono || '');
  const [ajustesEmpresa, setAjustesEmpresa] = useState(user?.empresa || '');
  const [ajustesCargo, setAjustesCargo] = useState(user?.cargo || '');
  const [ajustesSaving, setAjustesSaving] = useState(false);

  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const [prefEmailNotifications, setPrefEmailNotifications] = useState(true);
  const [prefSlaAlerts, setPrefSlaAlerts] = useState(true);
  const [prefWhatsappAlerts, setPrefWhatsappAlerts] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.nombres) setAjustesNombres(user.nombres);
      if (user.apellidos) setAjustesApellidos(user.apellidos);
      if (user.telefono) setAjustesTelefono(user.telefono);
      if (user.empresa) setAjustesEmpresa(user.empresa);
      if (user.cargo) setAjustesCargo(user.cargo);
    }
  }, [user]);

  useEffect(() => {
    if (user?.preferencias && typeof user.preferencias === 'object') {
      const p = user.preferencias as any;
      if (typeof p.emailNotifications === 'boolean') setPrefEmailNotifications(p.emailNotifications);
      if (typeof p.slaAlerts === 'boolean') setPrefSlaAlerts(p.slaAlerts);
      if (typeof p.whatsappAlerts === 'boolean') setPrefWhatsappAlerts(p.whatsappAlerts);
    }
  }, [user]);

  const handleSaveAjustes = async (e: React.FormEvent) => {
    e.preventDefault();
    setAjustesSaving(true);
    try {
      await usuariosApi.updateMe({
        nombres: ajustesNombres.trim(),
        apellidos: ajustesApellidos.trim(),
        telefono: ajustesTelefono.trim() || undefined,
        empresa: ajustesEmpresa.trim() || undefined,
        cargo: ajustesCargo.trim() || undefined,
      });
      await updateProfile({
        nombres: ajustesNombres.trim(),
        apellidos: ajustesApellidos.trim(),
        telefono: ajustesTelefono.trim() || null,
        empresa: ajustesEmpresa.trim() || null,
        cargo: ajustesCargo.trim() || null,
      });
      showToast('Ajustes Guardados', 'Tu perfil y datos han sido actualizados con éxito.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setAjustesSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) {
      showToast('Campos Requeridos', 'Por favor ingresa tu contraseña actual y la nueva.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Seguridad', 'La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Contraseña no coincide', 'La confirmación no coincide con la nueva contraseña.', 'error');
      return;
    }
    setPassSaving(true);
    try {
      const res = await usuariosApi.changePassword({
        currentPassword: currPassword,
        newPassword,
      });
      showToast('Contraseña Actualizada', res.message || 'Tu clave de acceso ha sido actualizada de forma segura.', 'success');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar la contraseña.', 'error');
    } finally {
      setPassSaving(false);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaving(true);
    try {
      const prefs = {
        emailNotifications: prefEmailNotifications,
        slaAlerts: prefSlaAlerts,
        whatsappAlerts: prefWhatsappAlerts,
      };
      await usuariosApi.updateMe({ preferencias: prefs });
      await updateProfile({ preferencias: prefs });
      showToast('Preferencias Guardadas', 'Tus preferencias de notificación han sido guardadas.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudieron guardar las preferencias.', 'error');
    } finally {
      setPrefsSaving(false);
    }
  };

  const displayedCargo = ajustesCargo?.trim() || user?.cargo?.trim() || '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1b1d] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ffd56d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#ffd56d] via-[#f5b942] to-[#e8960a] p-[2px] shadow-xl shadow-[#ffd56d]/20">
                <div className="w-full h-full rounded-[14px] bg-[#141315] flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-[#ffd56d] font-display select-none">
                    {user ? `${user.nombres?.[0] || ''}${user.apellidos?.[0] || ''}`.toUpperCase() : ''}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#1c1b1d] border-2 border-[#1c1b1d]">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" title="Sesión activa" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                  {user ? `${user.nombres} ${user.apellidos}` : ''}
                </h2>
                {displayedCargo ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {displayedCargo}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-[#9a907c]">
                <div className="flex items-center gap-1.5 text-[#e5e1e4]">
                  <Building2 className="w-3.5 h-3.5 text-[#ffd56d]" />
                  <span className="font-semibold">{ajustesEmpresa || user?.empresa || 'Sin empresa registrada'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9a907c]" />
                  <span>{user?.correo}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('cotizador')}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#ffd56d] border border-[#ffd56d]/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ffd56d]" />
            <span>Explorar Cotizador</span>
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cuenta
            </span>
            <p className="text-sm font-bold text-white">Activa</p>
            <p className="text-[11px] text-[#9a907c] capitalize">
              Rol: {user?.rol === 'admin' || user?.rol === 'administrador' ? 'Administrador' : 'Cliente'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ffd56d]" /> Plan Activo
            </span>
            <p className="text-sm font-bold text-white truncate">
              {hasActiveContractedPlan && activePlanRecord?.plan?.nombre
                ? activePlanRecord.plan.nombre
                : contractedServices.length > 0
                  ? `${contractedServices.length} Servicios Activos`
                  : 'Sin Plan Activo'}
            </p>
            <p className={`text-[11px] font-medium ${hasActiveContractedPlan ? 'text-emerald-400' : 'text-[#9a907c]'}`}>
              {hasActiveContractedPlan ? 'Contrato Vigente' : 'Sin plan contratado'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-sky-400" /> Operaciones
            </span>
            <p className="text-sm font-bold text-white">{solicitudes.length} Registradas</p>
            <p className="text-[11px] text-[#9a907c]">{messages.length} Mensajes en canal</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Antigüedad
            </span>
            <p className="text-sm font-bold text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '—'}
            </p>
            <p className="text-[11px] text-[#9a907c]">ID: #{user?.id?.slice(0, 8) || '—'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141315] border border-white/5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setAjustesSubTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            ajustesSubTab === 'perfil'
              ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
              : 'text-[#9a907c] hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Información & Empresa</span>
        </button>

        <button
          type="button"
          onClick={() => setAjustesSubTab('plan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            ajustesSubTab === 'plan'
              ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
              : 'text-[#9a907c] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mi Plan Contratado</span>
        </button>

        <button
          type="button"
          onClick={() => setAjustesSubTab('seguridad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            ajustesSubTab === 'seguridad'
              ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
              : 'text-[#9a907c] hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Seguridad & Acceso</span>
        </button>

        <button
          type="button"
          onClick={() => setAjustesSubTab('preferencias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            ajustesSubTab === 'preferencias'
              ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
              : 'text-[#9a907c] hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Preferencias & SLA</span>
        </button>
      </div>

      {ajustesSubTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Datos del Representante & Organización</h3>
              <p className="text-xs text-[#9a907c] mt-0.5">
                Esta información se refleja en los acuerdos, contratos y solicitudes.
              </p>
            </div>

            <form onSubmit={handleSaveAjustes} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Nombres</label>
                  <input
                    type="text"
                    value={ajustesNombres}
                    onChange={(e) => setAjustesNombres(e.target.value)}
                    placeholder="Tus nombres"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Apellidos</label>
                  <input
                    type="text"
                    value={ajustesApellidos}
                    onChange={(e) => setAjustesApellidos(e.target.value)}
                    placeholder="Tus apellidos"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#ffd56d]" /> Nombre de Empresa / Marca
                  </label>
                  <input
                    type="text"
                    value={ajustesEmpresa}
                    onChange={(e) => setAjustesEmpresa(e.target.value)}
                    placeholder="Nombre de la empresa"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#ffd56d]" /> Cargo / Posición
                  </label>
                  <input
                    type="text"
                    value={ajustesCargo}
                    onChange={(e) => setAjustesCargo(e.target.value)}
                    placeholder="Cargo o rol en la empresa"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#ffd56d]" /> Teléfono Móvil / WhatsApp Directo
                </label>
                <input
                  type="text"
                  value={ajustesTelefono}
                  onChange={(e) => setAjustesTelefono(e.target.value)}
                  placeholder="Número de contacto"
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <p className="text-[11px] text-[#9a907c] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sincronización instantánea con la plataforma central
                </p>
                <button
                  type="submit"
                  disabled={ajustesSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs shadow-lg shadow-[#ffd56d]/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{ajustesSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ffd56d]" />
                <h4 className="text-sm font-bold text-white font-display">Identidad Verificada</h4>
              </div>
              <p className="text-xs text-[#9a907c]">
                Datos registrados al momento de la apertura de cuenta.
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Correo Electrónico</span>
                    <Lock className="w-3 h-3 text-[#9a907c]" />
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{user?.correo}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Documento Legal</span>
                    <Lock className="w-3 h-3 text-[#9a907c]" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {user?.tipo_documento} • {user?.numero_cedula}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Fecha de Nacimiento</span>
                    <Lock className="w-3 h-3 text-[#9a907c]" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {user?.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No registrada'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ajustesSubTab === 'plan' && (
        <div className="space-y-6">
          {hasActiveContractedPlan && activePlanRecord ? (
            <div className="rounded-3xl bg-[#1c1b1d] border border-[#ffd56d]/30 p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Plan Aprobado & Activo
                    </span>
                    <span className="text-xs text-[#9a907c]">
                      Aprobado el {activePlanRecord.created_at ? new Date(activePlanRecord.created_at).toLocaleDateString('es-ES') : ''}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {activePlanRecord.plan?.nombre || 'Plan Personalizado'}
                  </h3>
                  {activePlanRecord.presupuesto_min && activePlanRecord.presupuesto_max ? (
                    <p className="text-sm font-semibold text-[#ffd56d]">
                      Rango de Inversión: ${activePlanRecord.presupuesto_min.toLocaleString('es-CO')} — ${activePlanRecord.presupuesto_max.toLocaleString('es-CO')} COP
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('cotizador')}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffd56d]/20 flex items-center gap-2"
                >
                  <span>Solicitar Upgrade / Cambio de Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#9a907c] mb-3">
                  Servicios y Módulos Activos en tu Contrato ({contractedServices.length})
                </h4>
                {contractedServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {contractedServices.map((svc: any, idx: number) => {
                      const name = typeof svc === 'string' ? svc : svc.nombre || svc.id || 'Servicio';
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0e0e10] border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-[#ffd56d]/10 border border-[#ffd56d]/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-[#ffd56d]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#e5e1e4] truncate">{name}</p>
                            <span className="text-[10px] text-emerald-400 font-medium">Cobertura Activa</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0e0e10] text-center text-xs text-[#9a907c]">
                    Plan corporativo general sin desglose modular específico.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#ffd56d]/10 border border-[#ffd56d]/20 flex items-center justify-center mx-auto text-[#ffd56d]">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-white font-display">Aún no tienes un Plan Activo</h3>
                <p className="text-xs text-[#9a907c]">
                  Selecciona un plan corporativo o configura una cotización modular a tu medida para activar el despliegue de requerimientos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('cotizador')}
                className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-lg shadow-[#ffd56d]/20 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Configurar en Cotizador</span>
              </button>
            </div>
          )}
        </div>
      )}

      {ajustesSubTab === 'seguridad' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Actualización de Contraseña</h3>
              <p className="text-xs text-[#9a907c] mt-0.5">
                Ingresa tu contraseña actual y define una nueva clave segura.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#e5e1e4]">Contraseña Actual</label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="text-[11px] text-[#9a907c] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#ffd56d]" /> Encriptación BCrypt en base de datos
                </div>
                <button
                  type="submit"
                  disabled={passSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{passSaving ? 'Actualizando...' : 'Actualizar Clave'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white font-display">Estado de la Sesión</h4>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Sesión Autenticada</span>
                <p className="text-xs font-semibold text-emerald-400 truncate">{user?.correo}</p>
                <p className="text-[10px] text-[#9a907c]">ID: #{user?.id?.slice(0, 8)}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Rol en la Plataforma</span>
                <p className="text-xs font-semibold text-white uppercase">{user?.rol || 'usuario'}</p>
                <p className="text-[10px] text-[#9a907c]">Permisos activos</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Seguridad de Clave</span>
                <p className="text-xs font-semibold text-emerald-400">Hash BCrypt</p>
                <p className="text-[10px] text-[#9a907c]">Protegida en base de datos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {ajustesSubTab === 'preferencias' && (
        <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Canales de Notificación & SLA</h3>
            <p className="text-xs text-[#9a907c] mt-0.5">
              Controla las notificaciones de avances y mensajería en tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSavePrefs} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Notificaciones por Correo de Avances</p>
                <p className="text-[11px] text-[#9a907c]">Recibe actualizaciones cuando un requerimiento cambie de estado.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefEmailNotifications}
                  onChange={(e) => setPrefEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Alertas en Canal de Chat</p>
                <p className="text-[11px] text-[#9a907c]">Notificación de mensajes directos en tu buzón.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefSlaAlerts}
                  onChange={(e) => setPrefSlaAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Alertas por WhatsApp</p>
                <p className="text-[11px] text-[#9a907c]">Notificaciones directas a tu número telefónico registrado.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefWhatsappAlerts}
                  onChange={(e) => setPrefWhatsappAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={prefsSaving}
                className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffd56d]/15 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{prefsSaving ? 'Guardando...' : 'Guardar Preferencias'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

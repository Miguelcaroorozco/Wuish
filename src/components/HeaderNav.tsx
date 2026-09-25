import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { WuishLogo } from './WuishLogo';
import {
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Sliders,
  KeyRound,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Settings
} from 'lucide-react';

export type DashboardTab = 'resumen' | 'solicitudes' | 'mensajes' | 'cotizacion' | 'ajustes';

interface HeaderNavProps {
  currentView: 'landing' | 'portal' | 'admin' | 'cotizador' | 'planes' | 'auth';
  onSelectView: (view: 'landing' | 'portal' | 'admin' | 'cotizador' | 'planes' | 'auth') => void;
  activeDashboardTab?: DashboardTab;
  onSelectDashboardTab?: (tab: DashboardTab) => void;
}

const DASHBOARD_TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'cotizacion', label: 'Planes & Cotización', icon: CreditCard },
  { id: 'ajustes', label: 'Ajustes de Cuenta', icon: Settings },
] as const;

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onSelectView,
  activeDashboardTab = 'resumen',
  onSelectDashboardTab,
}) => {
  const { user, isAuthenticated, currentRole, logout } = useAuth();
  const { showToast } = useToast();

  const isAdmin =
    user?.rol?.toLowerCase() === 'admin' ||
    user?.rol?.toLowerCase() === 'administrador' ||
    currentRole?.toLowerCase() === 'admin' ||
    currentRole?.toLowerCase() === 'administrador';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#0e0e10]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_16px_rgba(0,0,0,0.5)]">
      <div className="h-16 sm:h-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
          <div
            onClick={() => onSelectView('landing')}
            className="cursor-pointer transition-transform hover:scale-[1.02] shrink-0"
          >
            <WuishLogo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 text-xs font-medium overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => onSelectView('landing')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'landing'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Inicio
            </button>

            {isAuthenticated && (
              <>
                {DASHBOARD_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = currentView === 'portal' && activeDashboardTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onSelectDashboardTab?.(id);
                        onSelectView('portal');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#ffd56d] text-[#3e2e00] font-bold shadow-sm'
                          : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}

                {isAdmin && (
                  <button
                    onClick={() => onSelectView('admin')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap font-medium ${
                      currentView === 'admin'
                        ? 'bg-[#ffd56d] text-[#3e2e00] font-bold shadow-md ring-1 ring-[#ffd56d]'
                        : 'text-[#ffd56d] bg-[#ffd56d]/10 border border-[#ffd56d]/30 hover:bg-[#ffd56d]/20 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#ffd56d]" />
                    <span>Panel Admin</span>
                  </button>
                )}
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => onSelectView('auth')}
                className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'auth'
                    ? 'bg-[#ffd56d] text-[#3e2e00]'
                    : 'bg-[#1c1b1d] text-[#ffd56d] border border-[#ffd56d]/30 hover:bg-[#2a2a2c]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Notifications & Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white border border-white/5 transition-colors cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-display">Notificaciones</span>
                  <span className="text-[10px] text-[#ffd56d] cursor-pointer" onClick={() => showToast('Leídas', 'Todas marcadas como leídas')}>Marcar leídas</span>
                </div>
                <div className="py-4 text-center text-xs text-[#9a907c]">
                  No tienes notificaciones pendientes.
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-[#1c1b1d] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/40 text-[#ffd56d] font-bold text-xs flex items-center justify-center">
                  {user.nombres ? user.nombres.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-[#e5e1e4] group-hover:text-white">
                    {user.nombres} {user.apellidos || ''}
                  </span>
                  <span className="text-[10px] text-[#ffd56d]/80 font-mono mt-0.5 capitalize">
                    {user.rol || 'Cliente'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9a907c] group-hover:text-white" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-white/5 pb-2 mb-2">
                    <div className="text-xs font-bold text-white truncate">{user.nombres} {user.apellidos || ''}</div>
                    <div className="text-[11px] text-[#9a907c] font-mono truncate">{user.correo}</div>
                  </div>

                  <div className="space-y-1 text-xs text-[#d1c5af]">
                    <button
                      onClick={() => {
                        onSelectView('portal');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-[#ffd56d]" />
                      <span>Mi Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('portal');
                        onSelectDashboardTab?.('ajustes');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-[#ffd56d]" />
                      <span>Ajustes de Cuenta</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onSelectView('admin');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#ffd56d]" />
                        <span>Panel Administrativo</span>
                      </button>
                    )}

                    <div className="border-t border-white/5 my-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          showToast('Sesión Cerrada', 'Has salido del ecosistema corporativo.');
                          onSelectView('auth');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onSelectView('auth')}
              className="px-4 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] text-xs font-bold uppercase tracking-wider hover:bg-[#ffdf97] transition shadow"
            >
              Iniciar Sesión
            </button>
          )}

        </div>
      </div>
    </header>
  );
};

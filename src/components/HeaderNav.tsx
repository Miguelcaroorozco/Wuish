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
  UserCheck,
  Globe,
  Sliders,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderNavProps {
  currentView: 'landing' | 'portal' | 'admin' | 'cotizador' | 'planes' | 'auth';
  onSelectView: (view: 'landing' | 'portal' | 'admin' | 'cotizador' | 'planes' | 'auth') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentView, onSelectView }) => {
  const { user, isAuthenticated, currentRole, switchRole, logout } = useAuth();
  const { showToast } = useToast();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    if (role === 'admin') {
      onSelectView('admin');
      showToast('Perfil de Administrador', 'Modo administrador activado.');
    } else if (role === 'client') {
      onSelectView('portal');
      showToast('Perfil de Cliente', 'Modo cliente activado.');
    } else {
      onSelectView('portal');
      showToast('Perfil de Consultoría', 'Modo consultoría activado.');
    }
  };

  const notifications: Array<{ id: string; title: string; time: string; unread: boolean }> = [];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#0e0e10]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_16px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <div
            onClick={() => onSelectView('landing')}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <WuishLogo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => onSelectView('landing')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => onSelectView('portal')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'portal'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard Cliente
            </button>

            <button
              onClick={() => onSelectView('admin')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Panel Admin
            </button>

            <button
              onClick={() => onSelectView('cotizador')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'cotizador'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Cotizador
            </button>

            <button
              onClick={() => onSelectView('planes')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'planes'
                  ? 'bg-[#2a2a2c] text-[#ffd56d] font-semibold border border-[#ffd56d]/30 shadow-sm'
                  : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              Planes
            </button>

            <button
              onClick={() => onSelectView('auth')}
              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentView === 'auth'
                  ? 'bg-[#ffd56d] text-[#3e2e00]'
                  : 'bg-[#1c1b1d] text-[#ffd56d] border border-[#ffd56d]/30 hover:bg-[#2a2a2c]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Autenticación</span>
            </button>
          </nav>
        </div>

        {/* Right: Role Switcher & User Profile Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Role Switcher Pill (Exact to Image 3) */}
          <div className="hidden md:flex items-center p-1 bg-[#0e0e10] border border-white/10 rounded-full text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                currentRole === 'client'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm font-bold'
                  : 'text-[#d1c5af] hover:text-white hover:bg-[#1c1b1d]'
              }`}
            >
              Client
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm font-bold'
                  : 'text-[#d1c5af] hover:text-white hover:bg-[#1c1b1d]'
              }`}
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('consultant')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                currentRole === 'consultant'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm font-bold'
                  : 'text-[#d1c5af] hover:text-white hover:bg-[#1c1b1d]'
              }`}
            >
              Consultant
            </button>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white border border-white/5 transition-colors cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#1c1b1d]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-display">Notificaciones</span>
                  <span className="text-[10px] text-[#ffd56d] cursor-pointer" onClick={() => showToast('Leídas', 'Todas las notificaciones marcadas')}>Marcar leídas</span>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#9a907c]">
                      No tienes notificaciones pendientes.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          showToast(n.title, 'Redirigiendo a detalle');
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] transition-colors cursor-pointer flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className={`font-semibold ${n.unread ? 'text-white' : 'text-zinc-400'}`}>{n.title}</div>
                          <div className="text-[10px] text-[#9a907c] mt-0.5">{n.time}</div>
                        </div>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-[#ffd56d] shrink-0 mt-1" />}
                      </div>
                    ))
                  )}
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
                className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-[#1c1b1d] transition-all cursor-pointer group"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#ffd56d]/50 group-hover:ring-[#ffd56d]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/40 text-[#ffd56d] font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-[#e5e1e4] group-hover:text-white">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#ffd56d]/80 font-mono mt-0.5">
                    {user.title}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9a907c] group-hover:text-white" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-white/5 pb-3 mb-2">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-[#9a907c] font-mono truncate">{user.email}</div>
                    <div className="text-[10px] text-[#ffd56d] mt-1 font-semibold">{user.company}</div>
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
                      <span>Dashboard Ejecutivo</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-[#ffd56d]" />
                      <span>Panel Directivo</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('auth');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#ffd56d]" />
                      <span>Cambiar de Usuario</span>
                    </button>

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

      {/* Mobile Secondary Nav Bar */}
      <div className="xl:hidden flex items-center justify-between px-4 py-2 bg-[#131315] border-t border-white/5 text-xs overflow-x-auto space-x-2">
        <button
          onClick={() => onSelectView('landing')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'landing' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Inicio
        </button>
        <button
          onClick={() => onSelectView('portal')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'portal' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Dashboard Cliente
        </button>
        <button
          onClick={() => onSelectView('admin')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'admin' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Panel Admin
        </button>
        <button
          onClick={() => onSelectView('cotizador')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'cotizador' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Cotizador
        </button>
        <button
          onClick={() => onSelectView('planes')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'planes' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Planes
        </button>
        <button
          onClick={() => onSelectView('auth')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentView === 'auth' ? 'bg-[#ffd56d] text-[#3e2e00] font-bold' : 'text-zinc-400'}`}
        >
          Autenticación
        </button>
      </div>
    </header>
  );
};

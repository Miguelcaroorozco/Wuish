import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { WuishLogo } from './WuishLogo';
import { notificacionesApi, NotificacionItem } from '../lib/api';
import {
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Sliders,
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Calculator,
  MessageSquare,
  FileText,
  Star,
  CheckCircle2
} from 'lucide-react';

export type DashboardTab = 'resumen' | 'solicitudes' | 'planes' | 'cotizador' | 'ajustes';

interface HeaderNavProps {
  currentView: 'landing' | 'portal' | 'admin' | 'planes' | 'auth';
  onSelectView: (view: 'landing' | 'portal' | 'admin' | 'planes' | 'auth') => void;
  activeDashboardTab?: DashboardTab;
  onSelectDashboardTab?: (tab: DashboardTab) => void;
}

const DASHBOARD_TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { id: 'planes', label: 'Planes', icon: CreditCard },
  { id: 'cotizador', label: 'Cotizador', icon: Calculator },
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
  const [notifications, setNotifications] = useState<NotificacionItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificacionesApi.getMine();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.leido).length);
      }
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionesApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkOneAsRead = async (id: string) => {
    try {
      await notificacionesApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const getNotifIcon = (tipo: string) => {
    if (tipo === 'mensaje_usuario' || tipo === 'mensaje_admin') return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
    if (tipo === 'nueva_solicitud') return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    if (tipo === 'nuevo_comentario') return <Star className="w-3.5 h-3.5 text-amber-400" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd56d]" />;
  };

  const formatNotifTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (showProfileMenu && profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, showProfileMenu]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0e0e10] border-b border-white/10 shadow-[0_1px_16px_rgba(0,0,0,0.5)]">
      <div className="h-16 sm:h-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
          <div
            onClick={() => onSelectView(isAuthenticated ? (isAdmin ? 'admin' : 'portal') : 'landing')}
            className="cursor-pointer transition-transform hover:scale-[1.02] shrink-0"
          >
            <WuishLogo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 text-xs font-medium py-1 relative">
            {isAuthenticated && (
              <>
                {DASHBOARD_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = currentView === 'portal' && activeDashboardTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onSelectDashboardTab?.(id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <Shield className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}
              </>
            )}

          </nav>
        </div>

        {/* Right: Notifications & Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notifications Trigger */}
          {isAuthenticated && (
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white border border-white/5 transition-colors cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#ffd56d] text-[#3e2e00] text-[9px] font-black flex items-center justify-center leading-none shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#1a1a1c] border border-[#ffd56d]/25 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#ffd56d]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Notificaciones</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#ffd56d]/20 text-[#ffd56d] text-[9px] font-bold">{unreadCount} nuevas</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-[10px] text-[#ffd56d] hover:text-white cursor-pointer transition-colors">
                      Marcar leídas
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="w-6 h-6 text-[#9a907c]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#9a907c]">Sin notificaciones pendientes.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.leido && handleMarkOneAsRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                          n.leido ? 'opacity-50 hover:opacity-70' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          n.leido ? 'bg-zinc-800' : 'bg-[#ffd56d]/10 border border-[#ffd56d]/20'
                        }`}>
                          {getNotifIcon(n.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${n.leido ? 'text-zinc-500' : 'text-white'}`}>{n.titulo}</p>
                          <p className="text-[11px] text-[#9a907c] mt-0.5 leading-snug line-clamp-2">{n.mensaje}</p>
                          <p className="text-[10px] text-[#9a907c]/60 mt-1">{formatNotifTime(n.created_at)}</p>
                        </div>
                        {!n.leido && <div className="w-1.5 h-1.5 rounded-full bg-[#ffd56d] mt-1.5 shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* User Profile Avatar & Menu */}
          {isAuthenticated && user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
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
                        onSelectDashboardTab?.('resumen');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#201f21] hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-[#ffd56d]" />
                      <span>Mi Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
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

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ContentProvider } from './context/ContentContext';
import { HeaderNav, DashboardTab } from './components/HeaderNav';
import { LandingView } from './components/LandingView';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PlanesView } from './components/PlanesView';
import { WuishLogo } from './components/WuishLogo';
import { Shield, ArrowUp, Lock } from 'lucide-react';

type ViewMode = 'landing' | 'portal' | 'admin' | 'planes';
// 'auth' no es una vista: abre el popup de inicio de sesión sobre la vista actual
type NavTarget = ViewMode | 'auth';

// Helpers para sincronización de URL en el navegador
const getPathForState = (view: ViewMode, tab: DashboardTab): string => {
  if (view === 'landing') return '/';
  if (view === 'planes') return '/planes';
  if (view === 'admin') return '/admin';
  if (view === 'portal') {
    if (tab === 'resumen') return '/portal';
    return `/portal/${tab}`;
  }
  return '/';
};

const getStateFromPath = (pathname: string): { view: ViewMode; tab: DashboardTab; isLogin?: boolean } => {
  const p = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (p === '/admin' || p.startsWith('/admin/')) {
    return { view: 'admin', tab: 'resumen' };
  }
  if (p === '/planes') {
    return { view: 'planes', tab: 'planes' };
  }
  if (p === '/portal/solicitudes' || p === '/solicitudes') {
    return { view: 'portal', tab: 'solicitudes' };
  }
  if (p === '/portal/planes') {
    return { view: 'portal', tab: 'planes' };
  }
  if (p === '/portal/cotizador' || p === '/cotizador') {
    return { view: 'portal', tab: 'cotizador' };
  }
  if (p === '/portal/ajustes' || p === '/ajustes') {
    return { view: 'portal', tab: 'ajustes' };
  }
  if (p === '/portal' || p === '/portal/resumen' || p === '/dashboard') {
    return { view: 'portal', tab: 'resumen' };
  }
  if (p === '/login') {
    return { view: 'landing', tab: 'resumen', isLogin: true };
  }
  return { view: 'landing', tab: 'resumen' };
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { showToast } = useToast();
  const isAdminRole = currentRole === 'admin' || currentRole === 'administrador';

  const initialRoute = getStateFromPath(window.location.pathname);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>(() => initialRoute.tab);
  // Pestaña a abrir después de iniciar sesión (ej. el usuario quiso cotizar sin sesión)
  const [pendingTab, setPendingTab] = useState<DashboardTab | null>(null);
  const [selectedPlanForCotizador, setSelectedPlanForCotizador] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(() => initialRoute.isLogin ? 'login' : null);

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (isAuthenticated) {
      if (initialRoute.view === 'admin' && isAdminRole) return 'admin';
      if (initialRoute.view === 'portal') return 'portal';
      if (initialRoute.view === 'planes') return 'portal';
      return isAdminRole ? 'admin' : 'portal';
    }
    return initialRoute.view;
  });
  const currentViewRef = useRef<ViewMode>(currentView);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);

  const openAuth = (tab: 'login' | 'register' = 'login') => setAuthModal(tab);

  // Sincronizar URL del navegador cada vez que cambia la vista o la pestaña activa
  useEffect(() => {
    const targetPath = getPathForState(currentView, dashboardTab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentView, dashboardTab]);

  // Manejar botones Atrás / Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      const route = getStateFromPath(window.location.pathname);
      if (isAuthenticated) {
        if (route.view === 'admin') {
          if (isAdminRole) setCurrentView('admin');
          else setCurrentView('portal');
        } else if (route.view === 'portal' || route.view === 'planes') {
          setCurrentView('portal');
          setDashboardTab(route.tab);
        } else {
          setCurrentView(isAdminRole ? 'admin' : 'portal');
        }
      } else {
        setCurrentView(route.view);
        setDashboardTab(route.tab);
        if (route.isLogin) openAuth('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, isAdminRole]);

  const navigateTo = (view: NavTarget) => {
    if (view === 'auth') {
      if (isAuthenticated) setCurrentView(isAdminRole ? 'admin' : 'portal');
      else openAuth('login');
      return;
    }
    // Con sesión activa, las vistas públicas (inicio y planes sueltos) quedan bloqueadas
    if (isAuthenticated && view === 'landing') {
      setCurrentView(isAdminRole ? 'admin' : 'portal');
      return;
    }
    if (isAuthenticated && view === 'planes') {
      setDashboardTab('planes');
      setCurrentView('portal');
      return;
    }
    if ((view === 'portal' || view === 'admin') && !isAuthenticated) {
      openAuth('login');
    } else if (view === 'admin' && isAuthenticated && !isAdminRole) {
      setCurrentView('portal');
    } else {
      // Admin puede acceder al portal (Mi Dashboard) libremente
      setCurrentView(view);
    }
  };

  // Abre una pestaña del portal; si no hay sesión, manda a iniciar sesión y la abre al entrar
  const openDashboardTab = (tab: DashboardTab, planId?: string | null) => {
    if (planId !== undefined) {
      setSelectedPlanForCotizador(planId);
    }
    if (!isAuthenticated) {
      setPendingTab(tab);
      if (tab === 'cotizador') {
        showToast('Inicia Sesión', 'Debes iniciar sesión para usar el cotizador.', 'error');
      }
      openAuth('login');
      return;
    }
    setDashboardTab(tab);
    setCurrentView('portal');
    scrollToTop();
  };

  useEffect(() => {
    const publicViews: ViewMode[] = ['landing', 'planes'];
    const cv = currentViewRef.current;
    // Solo reaccionar a cambios de estado de autenticación (sin currentView como dep)
    // para evitar condiciones de carrera cuando admin navega al portal
    if (isAuthenticated && publicViews.includes(cv)) {
      setCurrentView(isAdminRole ? 'admin' : 'portal');
    } else if (!isAuthenticated && (cv === 'portal' || cv === 'admin')) {
      // Al cerrar sesión se vuelve al inicio con el popup de login abierto
      setCurrentView('landing');
      openAuth('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdminRole]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col selection:bg-[#ffd56d] selection:text-[#3e2e00]`}>
      <HeaderNav
        currentView={currentView}
        activeDashboardTab={dashboardTab}
        onSelectDashboardTab={openDashboardTab}
        onSelectView={(v) => {
          navigateTo(v);
          if (v !== 'auth') scrollToTop();
        }}
      />

      <main className="flex-1 w-full flex flex-col">
        {currentView === 'landing' && (
          <LandingView
            onNavigateToCotizador={() => openDashboardTab('cotizador')}
            onNavigateToAuth={() => {
              if (isAuthenticated) {
                navigateTo(isAdminRole ? 'admin' : 'portal');
                scrollToTop();
              } else {
                openAuth('register');
              }
            }}
            onNavigateToPortal={() => {
              navigateTo(currentRole === 'admin' || currentRole === 'administrador' ? 'admin' : 'portal');
              scrollToTop();
            }}
            onNavigateToPlanes={() => { navigateTo('planes'); scrollToTop(); }}
            onRequireAuthForReview={() => {
              if (!isAuthenticated) openAuth('login');
            }}
          />
        )}

        {currentView === 'portal' && (
          <ClientDashboard
            activeTab={dashboardTab}
            onTabChange={setDashboardTab}
            initialPlanId={selectedPlanForCotizador}
          />
        )}

        {currentView === 'admin' && <AdminPanel />}

        {currentView === 'planes' && (
          <div className="space-y-4">
            <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigateTo(currentRole === 'admin' || currentRole === 'administrador' ? 'admin' : 'portal');
                  } else {
                    navigateTo('landing');
                  }
                  scrollToTop();
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffd56d] hover:text-[#ffdf97] transition cursor-pointer"
              >
                ← Volver {isAuthenticated ? 'al Portal' : 'al Inicio'}
              </button>
            </div>
            <PlanesView
              onSelectPlan={(planId) => openDashboardTab('cotizador', planId)}
            />
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <aside aria-label="Acciones rápidas" className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-[#1c1b1d] text-zinc-300 border border-white/10 shadow-lg hover:bg-[#201f21] hover:text-white transition cursor-pointer"
          title="Subir al inicio"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </aside>

      {/* Corporate Global Footer */}
      <footer className="bg-[#0e0e10] border-t border-white/5 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1560px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 md:col-span-2">
            <WuishLogo size="md" />
            <p className="text-xs text-[#9a907c] max-w-sm leading-relaxed">
              WUISH Enterprise Suite • Unificamos la visión ejecutiva, el diseño de comunicaciones de alto nivel y el desarrollo de software a medida para empresas en expansión.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#ffd56d]">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Seguridad Grado Corporativo</span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> NDA Digital Certificado</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white font-display mb-3">Módulos del Ecosistema</h4>
            <ul className="space-y-2 text-[#d1c5af]">
              <li><button onClick={() => openDashboardTab('cotizador')} className="hover:text-[#ffd56d] transition cursor-pointer">Cotizador Dinámico &amp; Presupuesto</button></li>
              <li><button onClick={() => { navigateTo('portal'); scrollToTop(); }} className="hover:text-[#ffd56d] transition cursor-pointer">Portal Ejecutivo de Clientes</button></li>
              <li><button onClick={() => { navigateTo('planes'); scrollToTop(); }} className="hover:text-[#ffd56d] transition cursor-pointer">Matriz de Planes &amp; Soluciones</button></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white font-display mb-3">Atención Directa</h4>
            <div className="space-y-2 text-[#9a907c]">
              <p>Mesa de Ayuda: <span className="text-white font-mono">soporte@wuish.io</span></p>
              <p>Dirección Estratégica: <span className="text-white font-mono">partners@wuish.io</span></p>
              <p className="text-[11px] pt-1 text-[#ffd56d]/90">Horario: Lun - Vie 08:00 a 19:00 (EST)</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1560px] mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9a907c]">
          <p>© {new Date().getFullYear()} WUISH Enterprise Ecosystem. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-white cursor-pointer" onClick={() => showToast('Aviso Legal', 'Protegido bajo ley de propiedad intelectual y secretos comerciales.')}>Términos de Servicio</span>
            <span className="hover:text-white cursor-pointer" onClick={() => showToast('Privacidad', 'Datos encriptados bajo política estricta de cero divulgación.')}>Política de Privacidad</span>
            <span className="hover:text-white cursor-pointer" onClick={() => showToast('NDA', 'Todos los expedientes firmados con validez internacional.')}>Acuerdo de Confidencialidad</span>
          </div>
        </div>
      </footer>

      {/* Popup de inicio de sesión / registro */}
      {authModal && !isAuthenticated && (
        <AuthScreen
          isModal
          initialTab={authModal}
          onClose={() => { setAuthModal(null); setPendingTab(null); }}
          onSuccessAuth={(role) => {
            setAuthModal(null);
            if (pendingTab) {
              setDashboardTab(pendingTab);
              setPendingTab(null);
              setCurrentView('portal');
            } else {
              setCurrentView(role === 'admin' || role === 'administrador' ? 'admin' : 'portal');
            }
            scrollToTop();
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ContentProvider>
          <MainAppContent />
        </ContentProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

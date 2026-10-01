import React, { useState, useEffect } from 'react';
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

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { showToast } = useToast();
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('resumen');
  // Pestaña a abrir después de iniciar sesión (ej. el usuario quiso cotizar sin sesión)
  const [pendingTab, setPendingTab] = useState<DashboardTab | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return isAuthenticated ? (currentRole === 'admin' || currentRole === 'administrador' ? 'admin' : 'portal') : 'landing';
  });

  const isAdminRole = currentRole === 'admin' || currentRole === 'administrador';

  const openAuth = (tab: 'login' | 'register' = 'login') => setAuthModal(tab);

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
      setCurrentView(view);
    }
  };

  // Abre una pestaña del portal; si no hay sesión, manda a iniciar sesión y la abre al entrar
  const openDashboardTab = (tab: DashboardTab) => {
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
    if (isAuthenticated && publicViews.includes(currentView)) {
      setCurrentView(isAdminRole ? 'admin' : 'portal');
    } else if (!isAuthenticated && (currentView === 'portal' || currentView === 'admin')) {
      // Al cerrar sesión se vuelve al inicio con el popup de login abierto
      setCurrentView('landing');
      openAuth('login');
    }
  }, [isAuthenticated, currentView, isAdminRole]);

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
              onSelectPlan={() => openDashboardTab('cotizador')}
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

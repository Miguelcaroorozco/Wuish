import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring, useMotionValueEvent } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ContentProvider } from './context/ContentContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingView } from './components/LandingView';
import { WuishLogo } from './components/WuishLogo';
import { ArrowUp } from 'lucide-react';

export type ViewMode = 'landing' | 'planes' | 'cotizador' | 'auth' | 'portal' | 'admin' | 'settings';
export type AuthTab = 'login' | 'register';

const PROTECTED_VIEWS: ViewMode[] = ['portal', 'admin', 'settings'];

// Vistas secundarias en chunks separados: la landing carga sin esperar el resto
const loaders = {
  auth: () => import('./components/AuthScreen').then((m) => ({ default: m.AuthScreen })),
  portal: () => import('./components/ClientDashboard').then((m) => ({ default: m.ClientDashboard })),
  admin: () => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })),
  cotizador: () => import('./components/CotizadorView').then((m) => ({ default: m.CotizadorView })),
  planes: () => import('./components/PlanesView').then((m) => ({ default: m.PlanesView })),
  settings: () => import('./components/UserSettingsView').then((m) => ({ default: m.UserSettingsView })),
};

const AuthScreen = lazy(loaders.auth);
const ClientDashboard = lazy(loaders.portal);
const AdminPanel = lazy(loaders.admin);
const CotizadorView = lazy(loaders.cotizador);
const PlanesView = lazy(loaders.planes);
const UserSettingsView = lazy(loaders.settings);

// Precarga en segundo plano las vistas que el usuario probablemente abrirá
const prefetchViews = (views: (keyof typeof loaders)[]) => {
  const run = () => views.forEach((v) => loaders[v]().catch(() => {}));
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(run, 1500);
  return () => clearTimeout(id);
};

const ViewFallback: React.FC = () => (
  <div className="flex-1 min-h-[60vh] flex items-center justify-center" role="status" aria-label="Cargando">
    <span className="w-8 h-8 rounded-full border-2 border-[#ffd56d]/20 border-t-[#ffd56d] animate-spin" />
  </div>
);

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { showToast } = useToast();

  const homeForRole = (): ViewMode => (currentRole === 'admin' ? 'admin' : 'portal');

  const [currentView, setCurrentView] = useState<ViewMode>(() => (isAuthenticated ? homeForRole() : 'landing'));
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  // Vista a la que el usuario quería ir antes de que se le pidiera iniciar sesión
  const [pendingView, setPendingView] = useState<ViewMode | null>(null);
  const [history, setHistory] = useState<ViewMode[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  useMotionValueEvent(scrollY, 'change', (y) => setShowScrollTop(y > 500));

  const navigate = (view: ViewMode, tab: AuthTab = 'login') => {
    if (isAuthenticated && (view === 'landing' || view === 'auth')) {
      view = homeForRole();
    }
    if (view !== currentView) setHistory((h) => [...h.slice(-9), currentView]);
    if (PROTECTED_VIEWS.includes(view) && !isAuthenticated) {
      setPendingView(view);
      setAuthTab(tab);
      setCurrentView('auth');
      showToast('Acceso requerido', 'Inicia sesión o crea tu cuenta para continuar.', 'info');
    } else if (view === 'admin' && currentRole !== 'admin') {
      setCurrentView('portal');
    } else {
      if (view === 'auth') setAuthTab(tab);
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Regresa a la vista anterior (saltando el login si ya hay sesión)
  const goBack = () => {
    const stack = [...history];
    let prev = stack.pop();
    while (prev && ((prev === 'auth' || prev === 'landing') && isAuthenticated || PROTECTED_VIEWS.includes(prev) && !isAuthenticated)) prev = stack.pop();
    setHistory(stack);
    setCurrentView(prev ?? (isAuthenticated ? homeForRole() : 'landing'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tras login/registro: ir a la vista pendiente o al panel según el rol.
  // Tras cerrar sesión: si estaba en una vista protegida, volver al inicio.
  useEffect(() => {
    if (isAuthenticated) {
      if (currentView === 'auth' || currentView === 'landing') {
        const target = pendingView && !(pendingView === 'admin' && currentRole !== 'admin') ? pendingView : homeForRole();
        setPendingView(null);
        setCurrentView(target);
      }
    } else if (PROTECTED_VIEWS.includes(currentView)) {
      setCurrentView('landing');
    }
  }, [isAuthenticated, currentRole, currentView]);

  // Al cambiar de rol en una vista protegida, mover al panel correspondiente
  useEffect(() => {
    if (isAuthenticated && PROTECTED_VIEWS.includes(currentView)) setCurrentView(homeForRole());
  }, [currentRole]);

  useEffect(
    () =>
      prefetchViews(
        isAuthenticated
          ? [currentRole === 'admin' ? 'admin' : 'portal', 'cotizador', 'planes', 'settings']
          : ['auth', 'planes', 'cotizador'],
      ),
    [isAuthenticated, currentRole],
  );

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingView
            onNavigateToCotizador={() => navigate('cotizador')}
            onNavigateToAuth={(tab) => navigate(isAuthenticated ? homeForRole() : 'auth', tab)}
            onNavigateToPlanes={() => navigate('planes')}
            onRequireAuthForReview={() => {
              setPendingView('landing');
              navigate('auth', 'login');
            }}
          />
        );
      case 'auth':
        return (
          <div className="py-4 px-3 sm:py-6 sm:px-4 flex-1 flex items-center justify-center">
            <AuthScreen key={authTab} initialTab={authTab} />
          </div>
        );
      case 'portal':
        return <ClientDashboard onNavigateToCotizador={() => navigate('cotizador')} onNavigateToPlanes={() => navigate('planes')} />;
      case 'admin':
        return <AdminPanel />;
      case 'settings':
        return <UserSettingsView />;
      case 'cotizador':
        return (
          <CotizadorView
            onSuccessSubmit={() => {
              if (isAuthenticated) {
                navigate('portal');
              } else {
                setPendingView('portal');
                navigate('auth', 'register');
              }
            }}
          />
        );
      case 'planes':
        return <PlanesView onSelectPlan={() => {
              if (isAuthenticated) {
                navigate('cotizador');
              } else {
                setPendingView('cotizador');
                navigate('auth', 'login');
              }
            }} />;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col selection:bg-[#ffd56d] selection:text-[#3e2e00]">
        {/* Barra de progreso de scroll */}
        <motion.div
          style={{ scaleX: progress }}
          className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[#aa8214] via-[#ffd56d] to-[#fff2c5] z-50"
        />

        <HeaderNav currentView={currentView} onSelectView={navigate} onBack={goBack} />

        <AnimatePresence mode="wait">
          <motion.main
            key={currentView}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full flex flex-col"
          >
            <Suspense fallback={<ViewFallback />}>{renderView()}</Suspense>
          </motion.main>
        </AnimatePresence>

        {/* Acciones flotantes */}
        <aside
          aria-label="Acciones rápidas"
          className={`fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3 ${currentView === 'cotizador' ? 'bottom-24 xl:bottom-6' : 'bottom-4 sm:bottom-6'}`}
        >
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="top"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{ y: -3 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-3 rounded-full bg-[#1c1b1d] text-zinc-300 border border-white/10 shadow-lg hover:text-white cursor-pointer"
                title="Subir al inicio"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            )}

          </AnimatePresence>
        </aside>

        <footer className="bg-[#0e0e10] border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1560px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#9a907c]">
            <WuishLogo size="sm" />
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <button onClick={() => navigate('planes')} className="hover:text-[#ffd56d] transition cursor-pointer">Planes</button>
              <button onClick={() => navigate('cotizador')} className="hover:text-[#ffd56d] transition cursor-pointer">Cotizador</button>
              <button onClick={() => navigate(isAuthenticated ? homeForRole() : 'auth')} className="hover:text-[#ffd56d] transition cursor-pointer">
                {isAuthenticated ? 'Mi panel' : 'Acceder'}
              </button>
              <span className="text-white/10">|</span>
              <span className="font-mono">soporte@wuish.io</span>
            </nav>
            <p>© {new Date().getFullYear()} WUISH</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
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

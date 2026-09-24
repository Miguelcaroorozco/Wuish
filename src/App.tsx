import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingView } from './components/LandingView';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { CotizadorView } from './components/CotizadorView';
import { PlanesView } from './components/PlanesView';
import { WuishLogo } from './components/WuishLogo';
import {
  MessageSquare,
  Calculator,
  Shield,
  ArrowUp,
  Lock,
  Globe
} from 'lucide-react';

type ViewMode = 'landing' | 'portal' | 'admin' | 'cotizador' | 'planes' | 'auth';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { showToast } = useToast();

  // Default to landing view if not authenticated, or client portal/admin if active
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return isAuthenticated ? (currentRole === 'admin' || currentRole === 'administrador' ? 'admin' : 'portal') : 'landing';
  });

  // Guard: redirigir a auth si intenta acceder a vistas privadas sin estar autenticado
  const navigateTo = (view: ViewMode) => {
    if ((view === 'portal' || view === 'admin') && !isAuthenticated) {
      setCurrentView('auth');
    } else if (view === 'admin' && isAuthenticated && currentRole !== 'admin' && currentRole !== 'administrador') {
      setCurrentView('portal'); // usuario normal no puede ir al admin
    } else {
      setCurrentView(view);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col selection:bg-[#ffd56d] selection:text-[#3e2e00]">
      {/* Top Navbar */}
      <HeaderNav
        currentView={currentView}
        onSelectView={(v) => {
          navigateTo(v);
          scrollToTop();
        }}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 w-full flex flex-col">
        {currentView === 'landing' && (
          <LandingView
            onNavigateToCotizador={() => {
              setCurrentView('cotizador');
              scrollToTop();
            }}
            onNavigateToAuth={() => {
              setCurrentView('auth');
              scrollToTop();
            }}
            onNavigateToPlanes={() => {
              setCurrentView('planes');
              scrollToTop();
            }}
          />
        )}

        {currentView === 'auth' && (
          <div className="py-6 px-4 flex-1 flex items-center justify-center">
            <AuthScreen
              onSuccessAuth={(role) => {
                // Redirect according to role returned directly from the API
                if (role === 'admin' || role === 'administrador') {
                  setCurrentView('admin');
                } else {
                  setCurrentView('portal');
                }
                scrollToTop();
              }}
            />
          </div>
        )}

        {currentView === 'portal' && (
          <ClientDashboard
            onNavigateToCotizador={() => {
              setCurrentView('cotizador');
              scrollToTop();
            }}
            onNavigateToPlanes={() => {
              setCurrentView('planes');
              scrollToTop();
            }}
          />
        )}

        {currentView === 'admin' && <AdminPanel />}

        {currentView === 'cotizador' && (
          <CotizadorView
            onSuccessSubmit={() => {
              setCurrentView('portal');
              scrollToTop();
            }}
          />
        )}

        {currentView === 'planes' && (
          <PlanesView
            onSelectPlan={(planId) => {
              setCurrentView('cotizador');
              scrollToTop();
            }}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <aside aria-label="Acciones rápidas" className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => {
            setCurrentView('cotizador');
            scrollToTop();
          }}
          className="p-3.5 rounded-full bg-[#ffd56d] text-[#3e2e00] shadow-xl hover:bg-[#ffdf97] transition-all hover:scale-110 flex items-center justify-center cursor-pointer group"
          title="Abrir Cotizador Inteligente"
        >
          <Calculator className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-2 text-xs font-bold font-display">
            Cotizador en Vivo
          </span>
        </button>

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
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Seguridad Grado Corporativo
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                NDA Digital Certificado
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white font-display mb-3">
              Módulos del Ecosistema
            </h4>
            <ul className="space-y-2 text-[#d1c5af]">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('cotizador');
                    scrollToTop();
                  }}
                  className="hover:text-[#ffd56d] transition cursor-pointer"
                >
                  Cotizador Dinámico &amp; Presupuesto
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigateTo('portal');
                    scrollToTop();
                  }}
                  className="hover:text-[#ffd56d] transition cursor-pointer"
                >
                  Portal Ejecutivo de Clientes
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('planes');
                    scrollToTop();
                  }}
                  className="hover:text-[#ffd56d] transition cursor-pointer"
                >
                  Matriz de Planes &amp; Soluciones
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white font-display mb-3">
              Atención Directa
            </h4>
            <div className="space-y-2 text-[#9a907c]">
              <p>Mesa de Ayuda Ejecutiva: <span className="text-white font-mono">soporte@wuish.io</span></p>
              <p>Dirección de Estrategia: <span className="text-white font-mono">partners@wuish.io</span></p>
              <p className="text-[11px] pt-1 text-[#ffd56d]/90">
                Horario de Boardroom: Lun - Vie 08:00 a 19:00 (EST)
              </p>
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
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

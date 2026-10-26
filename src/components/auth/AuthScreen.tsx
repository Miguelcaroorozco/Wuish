import React, { useState, useEffect } from 'react';
import { KeyRound, UserCheck, X } from 'lucide-react';
import { AuthPillarsPane } from './AuthPillarsPane';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface AuthScreenProps {
  onSuccess?: () => void;
  onSuccessAuth?: (role: string) => void;
  isModal?: boolean;
  initialTab?: 'login' | 'register';
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onSuccessAuth,
  isModal = false,
  initialTab = 'login',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSuccess = (role: string) => {
    if (onSuccess) onSuccess();
    if (onSuccessAuth) onSuccessAuth(role);
  };

  useEffect(() => {
    if (!isModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showForgotModal) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isModal, onClose, showForgotModal]);

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200'
          : 'w-full h-full flex items-center justify-center'
      }
      onMouseDown={(e) => {
        if (isModal && e.target === e.currentTarget) onClose?.();
      }}
      role={isModal ? 'dialog' : undefined}
      aria-modal={isModal || undefined}
    >
      <div
        className={`w-full max-w-6xl mx-auto ${
          isModal
            ? 'max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(760px,calc(100dvh-3rem))] flex'
            : 'h-full max-h-[760px]'
        }`}
      >
        <div className="w-full flex rounded-2xl bg-[#0e0e10] border border-[#ffd56d]/20 overflow-hidden shadow-2xl relative">
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-40 p-2 rounded-lg text-[#9a907c] hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd56d] to-transparent opacity-80 pointer-events-none z-30" />

          <AuthPillarsPane />

          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-[#201f21] p-5 pt-12 sm:p-8 sm:pt-12 xl:p-10 xl:pt-12 flex flex-col justify-center-safe relative">
            <div className="w-full bg-[#0e0e10] p-1 rounded-xl mb-5 flex items-center relative border border-white/5">
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

            {activeTab === 'login' && (
              <LoginForm
                onSuccess={handleSuccess}
                onOpenForgot={() => setShowForgotModal(true)}
              />
            )}

            {activeTab === 'register' && (
              <RegisterForm onSuccess={handleSuccess} />
            )}
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

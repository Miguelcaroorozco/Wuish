import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setEmailError('Ingresa tu correo electrónico');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail.trim())) {
      setEmailError('Ingresa un correo válido');
      return;
    }
    setEmailError('');
    const res = await resetPassword(forgotEmail);
    showToast('Enlace de Restablecimiento', res.message, 'info');
    onClose();
    setForgotEmail('');
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative text-xs">
        <h3 className="text-base font-bold text-white font-display mb-1">Recuperar Contraseña</h3>
        <p className="text-xs text-[#9a907c] mb-4">
          Ingresa tu correo para recibir las instrucciones de restablecimiento.
        </p>
        <form onSubmit={handleForgotSubmit} className="space-y-3">
          <input
            type="text"
            value={forgotEmail}
            onChange={(e) => { setForgotEmail(e.target.value); if (emailError) setEmailError(''); }}
            placeholder="tu@correo.com"
            className={`w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border focus:outline-none transition ${emailError ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]'}`}
          />
          {emailError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />{emailError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold shadow-md cursor-pointer"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

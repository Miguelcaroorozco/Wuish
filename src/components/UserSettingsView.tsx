import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Settings, Save, Mail, Building, Phone, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

export const UserSettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    title: user?.title || '',
    email: user?.email || '',
    phone: user?.phone || '',
    docType: user?.docType || 'NIT',
    docNumber: user?.docNumber || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateProfile(formData);
    setIsSubmitting(false);
    
    if (result.success) {
      showToast('Perfil Actualizado', result.message, 'success');
    } else {
      showToast('Error', result.message, 'error');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffd56d]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#ffd56d]" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white font-display">Ajustes de Perfil</h1>
        </div>
        <p className="text-sm text-[#9a907c]">Actualiza tu información personal y corporativa.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1c1b1d] rounded-2xl p-5 sm:p-8 border border-white/5 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#ffd56d]" /> Datos Personales
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0e0e10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Cargo / Rol
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#0e0e10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full bg-[#0e0e10] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">El correo electrónico no se puede cambiar directamente.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1c1b1d] rounded-2xl p-5 sm:p-8 border border-white/5 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#ffd56d]" /> Información Corporativa
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Empresa / Marca
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-[#0e0e10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Tipo de Documento
              </label>
              <select
                name="docType"
                value={formData.docType}
                onChange={handleChange}
                className="w-full bg-[#0e0e10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
              >
                <option value="NIT">NIT</option>
                <option value="RUT">RUT</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="PASSPORT">Pasaporte</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Número de Documento
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
                <input
                  type="text"
                  name="docNumber"
                  value={formData.docNumber}
                  onChange={handleChange}
                  className="w-full bg-[#0e0e10] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider mb-2">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0e0e10] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd56d] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex sm:justify-end pt-2 sm:pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            <Save className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

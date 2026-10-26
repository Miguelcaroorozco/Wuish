import React from 'react';
import { FileText, Save, Eye, Target } from 'lucide-react';

interface AdminCmsTabProps {
  cms: { slogan: string; vision: string; mision: string };
  onCmsChange: (newCms: { slogan: string; vision: string; mision: string }) => void;
  onSaveCms: (e: React.FormEvent) => void;
  savingCms: boolean;
}

export const AdminCmsTab: React.FC<AdminCmsTabProps> = ({
  cms,
  onCmsChange,
  onSaveCms,
  savingCms,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1c1b1d] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ffd56d]" />
            <h3 className="text-xl font-bold text-white font-display">Identidad & CMS Institucional</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Personaliza la narrativa de marca, el eslogan del Hero y las tarjetas de Visión y Misión mostradas públicamente en la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
          Sincronizado con la Landing
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={onSaveCms} className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                <FileText className="w-4 h-4 text-[#ffd56d]" />
                Eslogan Principal (Hero)
              </label>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Portada
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Frase de impacto situada inmediatamente debajo del titular principal del Inicio.
            </p>
            <input
              type="text"
              value={cms.slogan}
              onChange={(e) => onCmsChange({ ...cms, slogan: e.target.value })}
              placeholder="Comunicación y tecnología a la medida de tu negocio."
              className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs transition-colors"
            />
          </div>

          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                <Eye className="w-4 h-4 text-[#ffd56d]" />
                Visión Corporativa
              </label>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Tarjeta 01
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              La perspectiva y futuro que WUISH proyecta para la industria y sus clientes.
            </p>
            <textarea
              rows={3}
              value={cms.vision}
              onChange={(e) => onCmsChange({ ...cms, vision: e.target.value })}
              placeholder="Creemos en la velocidad, en el código robusto y en historias memorables..."
              className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs leading-relaxed transition-colors"
            />
          </div>

          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                <Target className="w-4 h-4 text-[#ffd56d]" />
                Misión y Propósito
              </label>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Tarjeta 02
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              El compromiso fundamental de valor entregado a clientes y organizaciones aliadas.
            </p>
            <textarea
              rows={3}
              value={cms.mision}
              onChange={(e) => onCmsChange({ ...cms, mision: e.target.value })}
              placeholder="Potenciar a negocios y líderes corporativos con soluciones digitales vanguardistas..."
              className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs leading-relaxed transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingCms}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ffd56d]/15 hover:shadow-[#ffd56d]/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingCms ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#ffd56d]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Vista Previa en Vivo
                </span>
              </div>
              <span className="text-[10px] text-[#ffd56d] bg-[#ffd56d]/10 border border-[#ffd56d]/20 px-2 py-0.5 rounded-full font-semibold">
                Así se ve en la web
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0e10] border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider block">
                1. Hero (Portada)
              </span>
              <div className="text-sm font-extrabold text-white font-display leading-tight">
                Convertimos tus <span className="text-[#ffd56d]">marcas</span> en crecimiento.
              </div>
              <p className="text-xs text-[#d1c5af] font-light italic border-l-2 border-[#ffd56d]/60 pl-2.5 py-0.5 mt-1 leading-relaxed">
                {cms.slogan || <span className="text-zinc-600">(Sin eslogan definido)</span>}
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider block">
                2. Tarjetas Institucionales
              </span>

              <div className="p-4 rounded-xl bg-[#121113] border border-[#ffd56d]/30 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-[9px] font-bold uppercase tracking-wider mb-2">
                  <span className="w-1 h-1 rounded-full bg-[#ffd56d] animate-pulse" />
                  Nuestra Visión
                </div>
                <p className="text-white text-xs leading-relaxed font-light italic">
                  "{cms.vision || 'Sin visión especificada...'}"
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Wuish Visión</span>
                  <span className="text-[#ffd56d] font-bold">01</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121113] border border-white/10 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#d1c5af] text-[9px] font-bold uppercase tracking-wider mb-2">
                  <span className="w-1 h-1 rounded-full bg-[#ffd56d]" />
                  Nuestra Misión
                </div>
                <p className="text-[#d1c5af] text-xs leading-relaxed">
                  {cms.mision || 'Sin misión especificada...'}
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Wuish Propósito</span>
                  <span className="text-[#ffd56d] font-bold">02</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

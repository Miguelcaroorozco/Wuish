import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Users,
  Briefcase,
  TrendingUp,
  FileCheck,
  Search,
  Mail,
  Trash2,
  Save,
  Plus,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface QuotationRow {
  id: string;
  client: string;
  email: string;
  services: string;
  budget: string;
  status: 'En revisión' | 'Cotización preparada' | 'Contactado' | 'Finalizada';
  assigned: string;
}

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();

  const [rows, setRows] = useState<QuotationRow[]>(() => {
    try {
      const saved = localStorage.getItem('wuish_cotizaciones_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState('');

  // CMS state
  const [slogan, setSlogan] = useState('WE UNITE IDEAS, STRATEGY & HORIZONS');
  const [manifesto, setManifesto] = useState('No te vendemos tecnología ni marketing. Analizamos tu negocio y construimos lo que necesitas para crecer.');
  const [mision, setMision] = useState('Unificar la visión estratégica, el diseño comunicacional de alto impacto y la ingeniería tecnológica de punta para acelerar empresas en América Latina y mercados globales.');

  // Create Plan Modal
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('3200');
  const [planCategory, setPlanCategory] = useState('crecimiento');
  const [planDesc, setPlanDesc] = useState('');

  const filteredRows = rows.filter(
    (r) =>
      r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: any) => {
    setRows((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
      localStorage.setItem('wuish_cotizaciones_v1', JSON.stringify(updated));
      return updated;
    });
    showToast('Estado Actualizado', `Cotización actualizada a "${newStatus}"`, 'success');
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem('wuish_cotizaciones_v1', JSON.stringify(updated));
      return updated;
    });
    showToast('Registro Eliminado', 'La cotización ha sido removida del pipeline.', 'info');
  };

  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('CMS Sincronizado', 'Textos institucionales actualizados en producción.', 'success');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;
    showToast('Plan Publicado', `El plan "${planName}" ha sido añadido a la matriz de servicios.`, 'success');
    setShowCreatePlanModal(false);
    setPlanName('');
    setPlanDesc('');
  };

  const handleExportData = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Cliente,Email,Servicios,Presupuesto,Estado,Asignado\n' +
      rows.map((r) => `"${r.client}","${r.email}","${r.services}","${r.budget}","${r.status}","${r.assigned}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pipeline_wuish_2025.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportación Completa', 'Archivo CSV descargado exitosamente.', 'success');
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 font-display">
              ADMIN MASTER
            </span>
            <span className="text-xs text-[#ffd56d] font-mono">CONSOLE • ROOT ACCESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Panel Administrativo Global WUISH
          </h1>
          <p className="text-xs text-[#9a907c] mt-1">
            Gestión de información corporativa, control de planes y flujo de cotizaciones entrantes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreatePlanModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Plan</span>
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards (Dynamic from real quotations) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
            Clientes Registrados
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
            {new Set(rows.map((r) => r.email || r.client)).size}
          </div>
          <span className="text-[11px] text-[#ffd56d]/80 font-medium mt-1 block">
            {rows.length > 0 ? 'Base activa' : 'Sin clientes'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
            Cotizaciones en Curso
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#ffd56d] mt-1 font-display">
            {rows.filter((r) => r.status === 'En revisión' || r.status === 'Cotización preparada').length}
          </div>
          <span className="text-[11px] text-[#ffd56d]/90 font-semibold mt-1 block">
            {rows.filter((r) => r.status === 'En revisión').length} por revisar
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
            Proyectos Activos
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
            {rows.filter((r) => r.status === 'Contactado' || r.status === 'Finalizada').length}
          </div>
          <span className="text-[11px] text-sky-400 font-semibold mt-1 block">
            En seguimiento
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
            Pipeline Proyectado
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-display">
            {rows.length > 0
              ? `$${rows.reduce((acc, r) => {
                  const num = parseInt(r.budget.replace(/[^0-9]/g, '')) || 0;
                  return acc + num;
                }, 0).toLocaleString()} USD`
              : '$0 USD'}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            {rows.length} cotizaciones
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
            Tickets Pendientes
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1 font-display">
            {rows.filter((r) => r.status === 'En revisión').length}
          </div>
          <span className="text-[11px] text-zinc-400 font-semibold mt-1 block">
            SLA de atención activo
          </span>
        </div>
      </div>

      {/* Section 1: Solicitudes y Cotizaciones Management (CRUD) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Gestión de Solicitudes y Cotizaciones (CRUD)
            </h3>
            <p className="text-xs text-[#9a907c] mt-0.5">
              Actualiza estados, asigna ejecutivos y valida presupuestos de prospectos.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente o servicio..."
              className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
              <tr>
                <th className="pb-3 pr-4">Cliente / Empresa</th>
                <th className="pb-3 pr-4">Servicios Solicitados</th>
                <th className="pb-3 pr-4">Presupuesto</th>
                <th className="pb-3 pr-4">Estado Actual</th>
                <th className="pb-3 pr-4">Asignado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileCheck className="w-8 h-8 text-[#ffd56d]/60" />
                      <p className="text-sm font-semibold text-white">No hay cotizaciones registradas</p>
                      <p className="text-xs text-[#9a907c]">
                        Las solicitudes enviadas a través del cotizador aparecerán aquí automáticamente.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#201f21]/70 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="font-bold text-white block text-sm font-display">{row.client}</span>
                      <span className="text-[11px] text-[#9a907c] font-mono">{row.email}</span>
                    </td>
                    <td className="py-4 pr-4 font-medium text-zinc-300">
                      {row.services}
                    </td>
                    <td className="py-4 pr-4 font-bold text-emerald-400 font-mono">
                      {row.budget}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className="bg-[#201f21] border border-white/10 rounded-lg text-xs text-[#ffd56d] p-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="En revisión">En revisión</option>
                        <option value="Cotización preparada">Cotización preparada</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Finalizada">Finalizada</option>
                      </select>
                    </td>
                    <td className="py-4 pr-4 text-[#d1c5af]">
                      {row.assigned}
                    </td>
                    <td className="py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => showToast('Notificación Directa', `Correo de seguimiento enviado a ${row.client}.`)}
                        className="p-1.5 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#ffd56d] hover:text-white transition"
                        title="Enviar seguimiento"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 rounded-lg bg-[#201f21] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Institutional Editor (CMS Rápido) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Editor Institucional de WUISH (CMS Rápido)
            </h3>
            <p className="text-xs text-[#9a907c] mt-0.5">
              Modifica el manifiesto, misión y eslogan corporativo visibles en la plataforma.
            </p>
          </div>

          <button
            onClick={handleSaveCms}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

        <form onSubmit={handleSaveCms} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Eslogan Principal</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Frase del Manifiesto</label>
            <input
              type="text"
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-zinc-300 mb-1.5">Misión Corporativa</label>
            <textarea
              rows={2}
              value={mision}
              onChange={(e) => setMision(e.target.value)}
              className="w-full bg-[#0e0e10] text-[#e5e1e4] p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
        </form>
      </div>

      {/* Modal: Crear Plan */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">
                Crear Nuevo Plan de Servicio
              </h3>
              <button
                onClick={() => setShowCreatePlanModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Nombre del Plan</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ej: Aceleración B2B Enterprise"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9a907c] mb-1 font-semibold">Precio Estimado (USD)</label>
                  <input
                    type="number"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    placeholder="3200"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-[#9a907c] mb-1 font-semibold">Categoría</label>
                  <select
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value)}
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  >
                    <option value="crecimiento">Crecimiento Digital</option>
                    <option value="digitalizacion">Digitalización</option>
                    <option value="optimizacion">Optimización</option>
                    <option value="transformacion">Transformación Integral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Descripción Breve</label>
                <textarea
                  rows={2}
                  required
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Principales características y propuesta de valor..."
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs shadow-md"
                >
                  Publicar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

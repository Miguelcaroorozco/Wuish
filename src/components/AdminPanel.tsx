import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  planesApi,
  tiposServicioApi,
  solicitudesApi,
  infoGeneralApi,
  comentariosApi,
  resultadosApi,
} from '../lib/api';
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
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Loader2
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();

  // Solicitudes state
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSol, setLoadingSol] = useState(true);

  // CMS state
  const [slogan, setSlogan] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [mision, setMision] = useState('');
  const [savingCms, setSavingCms] = useState(false);

  // Planes state
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planTipoId, setPlanTipoId] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');

  // Comentarios state
  const [comentarios, setComentarios] = useState<any[]>([]);

  // Resultados state
  const [resultados, setResultados] = useState<any[]>([]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [savingRes, setSavingRes] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [solData, infoData, tiposData, comData, resData] = await Promise.allSettled([
        solicitudesApi.getAll(),
        infoGeneralApi.getAll(),
        tiposServicioApi.getAll(),
        comentariosApi.getAll(),
        resultadosApi.getAll(true),
      ]);

      if (solData.status === 'fulfilled') setSolicitudes(solData.value);
      if (tiposData.status === 'fulfilled') {
        setTiposServicio(tiposData.value);
        if (tiposData.value.length > 0) setPlanTipoId(tiposData.value[0].id);
      }
      if (comData.status === 'fulfilled') setComentarios(comData.value);
      if (resData.status === 'fulfilled') setResultados(resData.value);

      if (infoData.status === 'fulfilled') {
        const info = infoData.value as any[];
        const findSection = (s: string) => info.find((i: any) => i.seccion === s)?.contenido || '';
        setSlogan(findSection('slogan'));
        setManifesto(findSection('manifesto'));
        setMision(findSection('mision'));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoadingSol(false);
    }
  };

  const filteredRows = solicitudes.filter(
    (r) =>
      (r.usuario?.nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.usuario?.correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.tipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await solicitudesApi.updateEstado(id, { estado: newStatus });
      setSolicitudes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: newStatus } : r))
      );
      showToast('Estado Actualizado', `Solicitud actualizada a "${newStatus}"`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el estado', 'error');
    }
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await solicitudesApi.delete(id);
      setSolicitudes((prev) => prev.filter((r) => r.id !== id));
      showToast('Eliminada', 'La solicitud ha sido eliminada.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo eliminar', 'error');
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      await Promise.all([
        infoGeneralApi.upsert('slogan', slogan),
        infoGeneralApi.upsert('manifesto', manifesto),
        infoGeneralApi.upsert('mision', mision),
      ]);
      showToast('CMS Guardado', 'Textos institucionales actualizados correctamente.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudieron guardar los cambios', 'error');
    } finally {
      setSavingCms(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planTipoId) return;
    try {
      const features = planFeatures.split('\n').filter(f => f.trim());
      const newPlan = await planesApi.create({
        tipo_servicio_id: planTipoId,
        nombre: planName,
        descripcion: planDesc,
        precio: planPrice ? parseFloat(planPrice) : undefined,
        caracteristicas: features.length > 0 ? features : undefined,
      });
      showToast('Plan Creado', `El plan "${planName}" ha sido publicado.`, 'success');
      setShowCreatePlanModal(false);
      setPlanName('');
      setPlanDesc('');
      setPlanPrice('');
      setPlanFeatures('');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear el plan', 'error');
    }
  };

  const handleToggleComentario = async (id: string, currentState: boolean) => {
    try {
      await comentariosApi.toggleMostrar(id, !currentState);
      setComentarios(prev =>
        prev.map(c => c.id === id ? { ...c, mostrar_en_pagina: !currentState } : c)
      );
      showToast('Comentario Actualizado', !currentState ? 'Visible en la página' : 'Oculto de la página', 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleCreateResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    setSavingRes(true);
    try {
      const created = await resultadosApi.create({
        titulo: newResTitle.trim(),
        descripcion: newResDesc.trim(),
      });
      setResultados(prev => [created, ...prev]);
      setNewResTitle('');
      setNewResDesc('');
      showToast('Métrica Agregada', 'Métrica publicada en la página principal.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Error al guardar métrica', 'error');
    } finally {
      setSavingRes(false);
    }
  };

  const handleDeleteResultado = async (id: string) => {
    try {
      await resultadosApi.delete(id);
      setResultados(prev => prev.filter(r => r.id !== id));
      showToast('Métrica Eliminada', 'Métrica removida de la página.', 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleExportData = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Cliente,Email,Tipo,Estado,Descripción\n' +
      solicitudes.map((r) =>
        `"${r.usuario?.nombres || ''} ${r.usuario?.apellidos || ''}","${r.usuario?.correo || ''}","${r.tipo}","${r.estado}","${r.descripcion || ''}"`
      ).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'solicitudes_wuish.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportación Completa', 'Archivo CSV descargado.', 'success');
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
            Gestión de información corporativa, control de planes y flujo de solicitudes.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">Total Solicitudes</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">{solicitudes.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">Pendientes</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#ffd56d] mt-1 font-display">{solicitudes.filter(s => s.estado === 'pendiente').length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">En Proceso</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 mt-1 font-display">{solicitudes.filter(s => s.estado === 'en_proceso').length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">Comentarios</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-display">{comentarios.length}</div>
        </div>
      </div>

      {/* Solicitudes Table */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Gestión de Solicitudes</h3>
            <p className="text-xs text-[#9a907c] mt-0.5">Actualiza estados y gestiona solicitudes de clientes.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
              <tr>
                <th className="pb-3 pr-4">Cliente</th>
                <th className="pb-3 pr-4">Tipo</th>
                <th className="pb-3 pr-4">Descripción</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingSol ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#ffd56d] animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <FileCheck className="w-8 h-8 text-[#ffd56d]/60 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">No hay solicitudes</p>
                    <p className="text-xs text-[#9a907c]">Las solicitudes aparecerán aquí automáticamente.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#201f21]/70 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="font-bold text-white block text-sm font-display">
                        {row.usuario?.nombres} {row.usuario?.apellidos}
                      </span>
                      <span className="text-[11px] text-[#9a907c] font-mono">{row.usuario?.correo}</span>
                    </td>
                    <td className="py-4 pr-4 font-medium text-zinc-300">{row.tipo}</td>
                    <td className="py-4 pr-4 text-[#d1c5af] max-w-[200px] truncate">{row.descripcion || '—'}</td>
                    <td className="py-4 pr-4">
                      <select
                        value={row.estado}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className="bg-[#201f21] border border-white/10 rounded-lg text-xs text-[#ffd56d] p-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="finalizada">Finalizada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </td>
                    <td className="py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 rounded-lg bg-[#201f21] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                        title="Eliminar"
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

      {/* CMS Editor */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Editor Institucional (CMS)</h3>
            <p className="text-xs text-[#9a907c] mt-0.5">Modifica el contenido visible en la página principal.</p>
          </div>
          <button
            onClick={handleSaveCms}
            disabled={savingCms}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingCms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{savingCms ? 'Guardando...' : 'Guardar Cambios'}</span>
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

      {/* Resultados de Impacto Management */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Métricas de Impacto (Página Principal)</h3>
            <p className="text-xs text-[#9a907c] mt-0.5">Agrega y administra los números e indicadores de resultados que ven los clientes.</p>
          </div>
        </div>

        <form onSubmit={handleCreateResultado} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Métrica / Cifra *</label>
            <input
              type="text"
              required
              value={newResTitle}
              onChange={(e) => setNewResTitle(e.target.value)}
              placeholder="Ej: +340% ROAS o 99.98% Uptime"
              className="w-full bg-[#0e0e10] text-[#e5e1e4] p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Descripción Breve</label>
            <input
              type="text"
              value={newResDesc}
              onChange={(e) => setNewResDesc(e.target.value)}
              placeholder="Ej: Retorno auditado en pauta"
              className="w-full bg-[#0e0e10] text-[#e5e1e4] p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingRes}
              className="w-full py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{savingRes ? 'Guardando...' : 'Agregar Métrica'}</span>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {resultados.map((r) => (
            <div key={r.id} className="p-3.5 rounded-xl bg-[#201f21] border border-white/5 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white block">{r.titulo}</span>
                <span className="text-[11px] text-[#9a907c] block">{r.descripcion || 'Sin descripción'}</span>
              </div>
              <button
                onClick={() => handleDeleteResultado(r.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                title="Eliminar métrica"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comentarios Management */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Gestión de Comentarios</h3>
          <p className="text-xs text-[#9a907c] mt-0.5">Selecciona qué comentarios mostrar en la página principal.</p>
        </div>

        {comentarios.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">No hay comentarios aún</p>
        ) : (
          <div className="space-y-3">
            {comentarios.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {c.usuario?.nombres} {c.usuario?.apellidos || 'Anónimo'}
                    </span>
                    {c.calificacion && (
                      <span className="flex items-center gap-0.5 text-[#ffd56d] text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        {c.calificacion}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#d1c5af] leading-relaxed">{c.contenido}</p>
                </div>
                <button
                  onClick={() => handleToggleComentario(c.id, c.mostrar_en_pagina)}
                  className={`p-2 rounded-lg transition shrink-0 cursor-pointer ${
                    c.mostrar_en_pagina
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-[#2a2a2c] text-zinc-400 hover:text-white'
                  }`}
                  title={c.mostrar_en_pagina ? 'Visible en página' : 'Oculto'}
                >
                  {c.mostrar_en_pagina ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">Crear Nuevo Plan</h3>
              <button onClick={() => setShowCreatePlanModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Tipo de Servicio</label>
                <select
                  value={planTipoId}
                  onChange={(e) => setPlanTipoId(e.target.value)}
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] cursor-pointer"
                >
                  {tiposServicio.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Nombre del Plan</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ej: Crecimiento Digital"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Precio (COP)</label>
                <input
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  placeholder="Opcional"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Descripción</label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Descripción del plan..."
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div>
                <label className="block text-[#9a907c] mb-1 font-semibold">Características (una por línea)</label>
                <textarea
                  rows={3}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  placeholder="Característica 1&#10;Característica 2&#10;Característica 3"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs shadow-md cursor-pointer"
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

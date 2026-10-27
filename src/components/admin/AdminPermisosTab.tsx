import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Check,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Sliders,
  FileText,
  TrendingUp,
  Star,
  Users,
  KeyRound,
  Save,
  CheckSquare,
  Square,
  Mail,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Edit2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { usuariosApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export interface AdminViewOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: any;
}

export const ADMIN_VIEWS: AdminViewOption[] = [
  {
    id: 'solicitudes',
    label: 'Solicitudes',
    shortLabel: 'Solicitudes',
    description: 'Bandeja de solicitudes y cotizaciones recibidas',
    icon: ClipboardList,
  },
  {
    id: 'mensajes',
    label: 'Mensajes de Clientes',
    shortLabel: 'Mensajes',
    description: 'Chat directo y comunicación con clientes',
    icon: MessageSquare,
  },
  {
    id: 'planes',
    label: 'Planes (Plantillas)',
    shortLabel: 'Planes',
    description: 'Gestión de planes comerciales y precios',
    icon: CreditCard,
  },
  {
    id: 'cotizador_admin',
    label: 'Opciones Cotizador',
    shortLabel: 'Cotizador',
    description: 'Módulos y servicios parametrizables del cotizador',
    icon: Sliders,
  },
  {
    id: 'cms',
    label: 'CMS Institucional',
    shortLabel: 'CMS',
    description: 'Eslogan, misión y visión del portal web',
    icon: FileText,
  },
  {
    id: 'resultados',
    label: 'Resultados & Portafolio',
    shortLabel: 'Resultados',
    description: 'Casos de éxito y métricas del inicio',
    icon: TrendingUp,
  },
  {
    id: 'comentarios',
    label: 'Testimonios',
    shortLabel: 'Testimonios',
    description: 'Moderación de reseñas públicas de clientes',
    icon: Star,
  },
  {
    id: 'usuarios',
    label: 'Gestión de Usuarios',
    shortLabel: 'Usuarios',
    description: 'Administración de usuarios, roles y datos',
    icon: Users,
  },
  {
    id: 'permisos',
    label: 'Control de Permisos',
    shortLabel: 'Permisos',
    description: 'Asignación de vistas para administradores',
    icon: KeyRound,
  },
];

const ALL_VIEW_IDS = ADMIN_VIEWS.map((v) => v.id);

interface UsuarioItem {
  id: string;
  nombres: string;
  apellidos: string;
  numero_cedula: string;
  tipo_documento: string;
  correo: string;
  cargo?: string | null;
  rol: string;
  permisos?: any;
}

interface AdminPermisosTabProps {
  usuarios: UsuarioItem[];
  onReload: () => Promise<void>;
}

export const AdminPermisosTab: React.FC<AdminPermisosTabProps> = ({ usuarios, onReload }) => {
  const { showToast } = useToast();
  const { user: currentUser, updateProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'full' | 'custom'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [savingAdminId, setSavingAdminId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [modalAdmin, setModalAdmin] = useState<UsuarioItem | null>(null);
  const [confirmRevokePermisos, setConfirmRevokePermisos] = useState<{
    admin: UsuarioItem;
    action: 'toggle' | 'deselectAll';
  } | null>(null);

  const [permissionsState, setPermissionsState] = useState<Record<string, string[]>>({});

  const adminUsers = useMemo(() => {
    return usuarios.filter((u) => u.rol === 'admin' || u.rol === 'administrador');
  }, [usuarios]);

  React.useEffect(() => {
    const initial: Record<string, string[]> = {};
    adminUsers.forEach((admin) => {
      if (Array.isArray(admin.permisos)) {
        initial[admin.id] = admin.permisos;
      } else {
        initial[admin.id] = [...ALL_VIEW_IDS];
      }
    });
    setPermissionsState(initial);
  }, [adminUsers]);

  const filteredAdmins = useMemo(() => {
    return adminUsers.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.nombres.toLowerCase().includes(q) ||
        a.apellidos.toLowerCase().includes(q) ||
        `${a.nombres} ${a.apellidos}`.toLowerCase().includes(q) ||
        a.numero_cedula.toLowerCase().includes(q) ||
        a.correo.toLowerCase().includes(q);

      const perms = permissionsState[a.id] !== undefined ? permissionsState[a.id] : (Array.isArray(a.permisos) ? a.permisos : [...ALL_VIEW_IDS]);
      const isFull = perms.length === ALL_VIEW_IDS.length;
      const matchFilter =
        accessFilter === 'all'
          ? true
          : accessFilter === 'full'
          ? isFull
          : !isFull;

      return matchSearch && matchFilter;
    });
  }, [adminUsers, searchTerm, accessFilter, permissionsState]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAdmins.length);

  const paginatedAdmins = useMemo(() => {
    return filteredAdmins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAdmins, startIndex, itemsPerPage]);

  const handleTogglePermission = (adminId: string, viewId: string) => {
    const admin = adminUsers.find((a) => a.id === adminId);
    const current = permissionsState[adminId] !== undefined
      ? permissionsState[adminId]
      : (Array.isArray(admin?.permisos) ? (admin!.permisos as string[]) : [...ALL_VIEW_IDS]);
    const hasPermission = current.includes(viewId);

    // Si se intenta deseleccionar el permiso crítico 'permisos'
    if (viewId === 'permisos' && hasPermission) {
      if (admin) {
        setConfirmRevokePermisos({ admin, action: 'toggle' });
        return;
      }
    }

    setPermissionsState((prev) => {
      const curr = prev[adminId] !== undefined
        ? prev[adminId]
        : (Array.isArray(admin?.permisos) ? (admin!.permisos as string[]) : [...ALL_VIEW_IDS]);
      const updated = hasPermission
        ? curr.filter((id) => id !== viewId)
        : [...curr, viewId];
      return { ...prev, [adminId]: updated };
    });
  };

  const handleSelectAll = (adminId: string) => {
    setPermissionsState((prev) => ({
      ...prev,
      [adminId]: [...ALL_VIEW_IDS],
    }));
  };

  const handleDeselectAll = (adminId: string) => {
    const admin = adminUsers.find((a) => a.id === adminId);
    const current = permissionsState[adminId] !== undefined
      ? permissionsState[adminId]
      : (Array.isArray(admin?.permisos) ? (admin!.permisos as string[]) : [...ALL_VIEW_IDS]);
    if (current.includes('permisos')) {
      if (admin) {
        setConfirmRevokePermisos({ admin, action: 'deselectAll' });
        return;
      }
    }
    setPermissionsState((prev) => ({
      ...prev,
      [adminId]: [],
    }));
  };

  const handleConfirmRevoke = () => {
    if (!confirmRevokePermisos) return;
    const { admin, action } = confirmRevokePermisos;

    setPermissionsState((prev) => {
      const current = prev[admin.id] !== undefined
        ? prev[admin.id]
        : (Array.isArray(admin.permisos) ? (admin.permisos as string[]) : [...ALL_VIEW_IDS]);
      if (action === 'deselectAll') {
        return { ...prev, [admin.id]: [] };
      }
      return { ...prev, [admin.id]: current.filter((id) => id !== 'permisos') };
    });

    setConfirmRevokePermisos(null);
  };

  const hasUnsavedChanges = (admin: UsuarioItem) => {
    const current = permissionsState[admin.id] !== undefined
      ? permissionsState[admin.id]
      : (Array.isArray(admin.permisos) ? admin.permisos : ALL_VIEW_IDS);
    const original = Array.isArray(admin.permisos) ? admin.permisos : ALL_VIEW_IDS;
    if (current.length !== original.length) return true;
    const origSet = new Set(original);
    return current.some((id) => !origSet.has(id));
  };

  const handleSavePermissions = async (admin: UsuarioItem) => {
    const selected = permissionsState[admin.id] !== undefined
      ? permissionsState[admin.id]
      : (Array.isArray(admin.permisos) ? admin.permisos : [...ALL_VIEW_IDS]);
    setSavingAdminId(admin.id);
    try {
      await usuariosApi.updateAdmin(admin.id, {
        permisos: selected,
      });

      // Si se actualizaron los permisos del administrador actual en sesión:
      const isCurrentAdmin =
        admin.id === currentUser?.id ||
        admin.numero_cedula === currentUser?.numero_cedula ||
        (!!admin.correo && !!currentUser?.correo && admin.correo.toLowerCase() === currentUser?.correo.toLowerCase());

      if (isCurrentAdmin) {
        await updateProfile({ permisos: selected });
        const currentActive = localStorage.getItem('admin_active_tab') || 'permisos';
        if (!selected.includes(currentActive)) {
          const fallback = selected[0] || 'solicitudes';
          try { localStorage.setItem('admin_active_tab', fallback); } catch {}
          window.dispatchEvent(new CustomEvent('wuish:openAdminTab', { detail: fallback }));
        }
      }

      showToast(
        'Permisos Actualizados',
        `Se guardaron los accesos de ${admin.nombres} (${selected.length} de ${ALL_VIEW_IDS.length} vistas).`,
        'success'
      );
      await onReload();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudieron guardar los permisos.', 'error');
    } finally {
      setSavingAdminId(null);
    }
  };

  const handleSaveAll = async () => {
    const changedAdmins = adminUsers.filter(hasUnsavedChanges);
    if (changedAdmins.length === 0) {
      showToast('Información', 'No hay cambios pendientes por guardar.', 'info');
      return;
    }

    setSavingAll(true);
    try {
      for (const admin of changedAdmins) {
        const selected = permissionsState[admin.id] !== undefined
          ? permissionsState[admin.id]
          : (Array.isArray(admin.permisos) ? admin.permisos : [...ALL_VIEW_IDS]);
        await usuariosApi.updateAdmin(admin.id, {
          permisos: selected,
        });

        const isCurrentAdmin =
          admin.id === currentUser?.id ||
          admin.numero_cedula === currentUser?.numero_cedula ||
          (!!admin.correo && !!currentUser?.correo && admin.correo.toLowerCase() === currentUser?.correo.toLowerCase());

        if (isCurrentAdmin) {
          await updateProfile({ permisos: selected });
          const currentActive = localStorage.getItem('admin_active_tab') || 'permisos';
          if (!selected.includes(currentActive)) {
            const fallback = selected[0] || 'solicitudes';
            try { localStorage.setItem('admin_active_tab', fallback); } catch {}
            window.dispatchEvent(new CustomEvent('wuish:openAdminTab', { detail: fallback }));
          }
        }
      }
      showToast(
        'Permisos Guardados',
        `Se actualizaron los permisos de ${changedAdmins.length} administradores.`,
        'success'
      );
      await onReload();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudieron guardar todos los permisos.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  const fullAccessCount = adminUsers.filter((a) => {
    const p = permissionsState[a.id] !== undefined
      ? permissionsState[a.id]
      : (Array.isArray(a.permisos) ? a.permisos : [...ALL_VIEW_IDS]);
    return p.length === ALL_VIEW_IDS.length;
  }).length;

  const customAccessCount = adminUsers.length - fullAccessCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Bar matching AdminUsuariosTab */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#1c1b1d] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar administrador por nombre, apellidos o número de cédula..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#201f21] border border-white/10 text-white placeholder-[#9a907c] text-xs focus:outline-none focus:border-[#ffd56d] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 bg-[#201f21] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => {
                setAccessFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                accessFilter === 'all' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              <span>Todos ({adminUsers.length})</span>
            </button>
            <button
              onClick={() => {
                setAccessFilter('full');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                accessFilter === 'full' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Total ({fullAccessCount})</span>
            </button>
            <button
              onClick={() => {
                setAccessFilter('custom');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                accessFilter === 'custom' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Personalizado ({customAccessCount})</span>
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={savingAll || adminUsers.filter(hasUnsavedChanges).length === 0}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{savingAll ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1c1b1d] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#201f21]/70 text-[#9a907c] font-display uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 font-bold min-w-[170px]">Administrador</th>
                <th className="py-3 px-2 font-bold min-w-[85px]">Cédula</th>
                <th className="py-3 px-2 font-bold min-w-[65px] text-center">Acceso</th>
                {ADMIN_VIEWS.map((view) => {
                  const Icon = view.icon;
                  return (
                    <th
                      key={view.id}
                      className="py-3 px-1 font-bold text-center min-w-[48px]"
                      title={`${view.label}: ${view.description}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="w-3.5 h-3.5 text-[#ffd56d]" />
                        <span className="text-[10px] tracking-normal font-semibold truncate max-w-[50px]">
                          {view.shortLabel}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-2.5 font-bold text-center min-w-[70px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-[#9a907c]">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ffd56d]" />
                    <p className="font-semibold text-white">No se encontraron administradores</p>
                    <p className="text-[11px] mt-0.5">
                      Intenta cambiar el filtro de búsqueda o el tipo de acceso seleccionado.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => {
                  const adminPerms = permissionsState[admin.id] !== undefined
                    ? permissionsState[admin.id]
                    : (Array.isArray(admin.permisos) ? admin.permisos : ALL_VIEW_IDS);
                  const isCurrent = admin.id === currentUser?.id;
                  const isSaving = savingAdminId === admin.id;
                  const changed = hasUnsavedChanges(admin);
                  const isTotal = adminPerms.length === ALL_VIEW_IDS.length;
                  const percent = Math.round((adminPerms.length / ALL_VIEW_IDS.length) * 100);

                  return (
                    <tr
                      key={admin.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        changed ? 'bg-[#ffd56d]/[0.03]' : ''
                      }`}
                    >
                      {/* Administrador */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30 shrink-0">
                            {admin.nombres?.charAt(0) || 'A'}
                            {admin.apellidos?.charAt(0) || ''}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{admin.nombres} {admin.apellidos}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ffd56d]/20 text-[#ffd56d] border border-[#ffd56d]/30 shrink-0">
                                  Tú
                                </span>
                              )}
                              {changed && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Cambios sin guardar" />
                              )}
                            </div>
                            <div className="text-[11px] text-[#9a907c] flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{admin.correo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="py-3 px-2">
                        <div className="font-mono text-white text-xs font-semibold flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#d1c5af]">
                            {admin.tipo_documento || 'CC'}
                          </span>
                          <span>{admin.numero_cedula}</span>
                        </div>
                      </td>

                      {/* Nivel de Acceso */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setModalAdmin(admin)}
                          title="Click para ver detalle de permisos"
                          className={`inline-flex flex-col items-center px-2 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                            isTotal
                              ? 'bg-[#ffd56d]/15 text-[#ffd56d] border-[#ffd56d]/30 hover:bg-[#ffd56d]/25'
                              : 'bg-white/5 text-[#d1c5af] border-white/10 hover:border-[#ffd56d]/40'
                          }`}
                        >
                          <span>{adminPerms.length}/{ALL_VIEW_IDS.length}</span>
                          <span className="text-[9px] font-mono text-[#9a907c]">{percent}%</span>
                        </button>
                      </td>

                      {/* 9 Vistas Columns */}
                      {ADMIN_VIEWS.map((view) => {
                        const hasAccess = adminPerms.includes(view.id);

                        return (
                          <td
                            key={view.id}
                            className="py-3 px-1 text-center"
                            title={`${admin.nombres}: ${hasAccess ? 'Acceso PERMITIDO' : 'Acceso DENEGADO'} a ${view.label}`}
                          >
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(admin.id, view.id)}
                              className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition cursor-pointer ${
                                hasAccess
                                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm hover:scale-105'
                                  : 'bg-white/5 border border-white/15 hover:border-[#ffd56d]/50 text-transparent'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 stroke-[3] ${hasAccess ? 'block' : 'hidden'}`} />
                            </button>
                          </td>
                        );
                      })}

                      {/* Acciones Column */}
                      <td className="py-3 px-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectAll(admin.id)}
                            title="Conceder todas las vistas"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-[#ffd56d]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeselectAll(admin.id)}
                            title="Remover todas las vistas"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5 text-zinc-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Always-visible Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#201f21]/70 border-t border-white/5 text-xs text-[#9a907c]">
          <div className="flex items-center gap-3">
            <span>
              Mostrando{' '}
              <strong className="text-white">
                {filteredAdmins.length === 0 ? 0 : startIndex + 1} - {endIndex}
              </strong>{' '}
              de <strong className="text-white">{filteredAdmins.length}</strong> administradores
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span className="text-[11px] text-[#9a907c]">Por pág:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#0e0e10] text-white text-[11px] px-2 py-1 rounded-lg border border-white/10 focus:border-[#ffd56d] focus:outline-none cursor-pointer"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#ffd56d] text-[#3e2e00] shadow'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for detailed permission viewing & toggling */}
      {modalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ffd56d]/15 text-[#ffd56d] flex items-center justify-center font-bold text-xs uppercase">
                  {modalAdmin.nombres?.charAt(0) || 'A'}
                  {modalAdmin.apellidos?.charAt(0) || ''}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">
                    Permisos de {modalAdmin.nombres} {modalAdmin.apellidos}
                  </h3>
                  <p className="text-xs text-[#9a907c]">
                    Cédula: {modalAdmin.numero_cedula} • Correo: {modalAdmin.correo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAdmin(null)}
                className="text-[#9a907c] hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-[#d1c5af]">
                Vistas seleccionadas:{' '}
                <strong className="text-white">
                  {(permissionsState[modalAdmin.id] || []).length} de {ALL_VIEW_IDS.length}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll(modalAdmin.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#ffd56d]" />
                  <span>Seleccionar Todas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeselectAll(modalAdmin.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Deseleccionar Todas</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {ADMIN_VIEWS.map((view) => {
                const Icon = view.icon;
                const hasAccess = (permissionsState[modalAdmin.id] || []).includes(view.id);

                return (
                  <div
                    key={view.id}
                    onClick={() => handleTogglePermission(modalAdmin.id, view.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      hasAccess
                        ? 'bg-[#ffd56d]/10 border-[#ffd56d]/40 text-white shadow-sm'
                        : 'bg-[#201f21]/40 border-white/5 text-[#9a907c] hover:border-white/10 hover:bg-[#201f21]/70'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                        hasAccess
                          ? 'bg-[#ffd56d] text-[#3e2e00]'
                          : 'bg-white/5 border border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            hasAccess ? 'text-[#ffd56d]' : 'text-[#9a907c]'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold truncate ${
                            hasAccess ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {view.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9a907c] line-clamp-1 mt-0.5">
                        {view.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setModalAdmin(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={savingAdminId === modalAdmin.id}
                onClick={async () => {
                  await handleSavePermissions(modalAdmin);
                  setModalAdmin(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingAdminId === modalAdmin.id ? 'Guardando...' : 'Guardar y Aplicar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRevokePermisos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-white font-display">
                ¿Desactivar Control de Permisos?
              </h3>
              <p className="text-xs text-[#9a907c] leading-relaxed">
                Estás a punto de deseleccionar el acceso al módulo de <strong className="text-white">Control de Permisos</strong> para{' '}
                <strong className="text-white">
                  {confirmRevokePermisos.admin.nombres} {confirmRevokePermisos.admin.apellidos}
                </strong>{' '}
                (Cédula: {confirmRevokePermisos.admin.numero_cedula}).
              </p>

              {(confirmRevokePermisos.admin.id === currentUser?.id ||
                confirmRevokePermisos.admin.numero_cedula === currentUser?.numero_cedula ||
                (!!confirmRevokePermisos.admin.correo &&
                  !!currentUser?.correo &&
                  confirmRevokePermisos.admin.correo.toLowerCase() === currentUser?.correo.toLowerCase())) && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>¡Advertencia de cuenta propia!</span>
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-normal">
                    Este es tu propio usuario en sesión. Al guardar los cambios, perderás el acceso a este panel de administración de permisos inmediatamente.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRevokePermisos(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex-1 shadow-lg shadow-red-500/10"
              >
                Sí, Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

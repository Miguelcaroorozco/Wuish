import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  IdCard,
  Lock,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { usuariosApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

registerLocale('es', es);

interface UsuarioItem {
  id: string;
  nombres: string;
  apellidos: string;
  numero_cedula: string;
  tipo_documento: string;
  correo: string;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  empresa?: string | null;
  cargo?: string | null;
  rol: string;
  permisos?: any;
  created_at: string;
}

interface AdminUsuariosTabProps {
  usuarios: UsuarioItem[];
  onReload: () => Promise<void>;
}

export const AdminUsuariosTab: React.FC<AdminUsuariosTabProps> = ({ usuarios, onReload }) => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'usuario'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UsuarioItem | null>(null);

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [showEditPwd, setShowEditPwd] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numero_cedula: '',
    tipo_documento: 'CC',
    correo: '',
    password: '',
    telefono: '57',
    empresa: '',
    cargo: '',
    rol: 'usuario',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const validateCreate = () => {
    const errors: Record<string, string> = {};
    if (!formData.nombres.trim()) errors.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos.trim()) errors.apellidos = 'El apellido es obligatorio';
    if (!formData.numero_cedula.trim()) errors.numero_cedula = 'El número de documento es obligatorio';
    if (!formData.correo.trim()) {
      errors.correo = 'El correo electrónico es obligatorio';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.correo.trim())) {
      errors.correo = 'Ingresa un correo electrónico válido';
    }
    if (!formData.password.trim()) {
      errors.password = 'La contraseña inicial es obligatoria';
    } else if (formData.password.trim().length < 6) {
      errors.password = 'Debe tener al menos 6 caracteres';
    }
    if (!birthDate) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    }
    return errors;
  };

  const validateEdit = () => {
    const errors: Record<string, string> = {};
    if (!formData.nombres.trim()) errors.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos.trim()) errors.apellidos = 'El apellido es obligatorio';
    if (!formData.numero_cedula.trim()) errors.numero_cedula = 'El número de documento es obligatorio';
    if (!formData.correo.trim()) {
      errors.correo = 'El correo electrónico es obligatorio';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.correo.trim())) {
      errors.correo = 'Ingresa un correo electrónico válido';
    }
    if (showChangePassword && formData.password.trim().length < 6) {
      errors.password = 'Debe tener al menos 6 caracteres';
    }
    return errors;
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
          ? u.rol === 'admin' || u.rol === 'administrador'
          : u.rol !== 'admin' && u.rol !== 'administrador';

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.nombres.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) ||
        u.numero_cedula.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q);

      return matchRole && matchSearch;
    });
  }, [usuarios, roleFilter, searchTerm]);

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsuarios.length);

  const paginatedUsuarios = useMemo(() => {
    return filteredUsuarios.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsuarios, startIndex, itemsPerPage]);

  const handleOpenCreate = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      numero_cedula: '',
      tipo_documento: 'CC',
      correo: '',
      password: '',
      telefono: '57',
      empresa: '',
      cargo: '',
      rol: 'usuario',
    });
    setBirthDate(null);
    setShowCreatePwd(false);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: UsuarioItem) => {
    setSelectedUser(user);
    const rawPhone = user.telefono ? user.telefono.replace(/^\+/, '') : '';
    setFormData({
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      numero_cedula: user.numero_cedula || '',
      tipo_documento: user.tipo_documento || 'CC',
      correo: user.correo || '',
      password: '',
      telefono: rawPhone || '57',
      empresa: user.empresa || '',
      cargo: user.cargo || '',
      rol: user.rol || 'usuario',
    });
    if (user.fecha_nacimiento) {
      const d = new Date(user.fecha_nacimiento);
      setBirthDate(!isNaN(d.getTime()) ? d : null);
    } else {
      setBirthDate(null);
    }
    setShowChangePassword(false);
    setShowEditPwd(false);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCreate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const phoneClean = formData.telefono?.trim();
    const formattedPhone = phoneClean && phoneClean !== '57' ? `+${phoneClean.replace(/^\+/, '')}` : undefined;

    setSaving(true);
    try {
      const isNewAdmin = formData.rol === 'admin' || formData.rol === 'administrador';
      await usuariosApi.create({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        numero_cedula: formData.numero_cedula,
        tipo_documento: formData.tipo_documento,
        correo: formData.correo,
        password: formData.password,
        telefono: formattedPhone,
        empresa: formData.empresa || undefined,
        cargo: formData.cargo || undefined,
        rol: formData.rol,
        permisos: isNewAdmin ? [] : undefined,
        fecha_nacimiento: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
      });

      showToast('Usuario Creado', `Se registró a ${formData.nombres} exitosamente.`, 'success');
      setShowCreateModal(false);
      await onReload();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear el usuario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const errors = validateEdit();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const phoneClean = formData.telefono?.trim();
    const formattedPhone = phoneClean && phoneClean !== '57' ? `+${phoneClean.replace(/^\+/, '')}` : undefined;

    setSaving(true);
    try {
      const payload: any = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        numero_cedula: formData.numero_cedula,
        tipo_documento: formData.tipo_documento,
        correo: formData.correo,
        telefono: formattedPhone,
        empresa: formData.empresa,
        cargo: formData.cargo,
        rol: formData.rol,
        fecha_nacimiento: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
      };

      // Si se pasa a admin y no tenía permisos definidos, inicializar con [] (todo desactivado)
      const isTargetAdmin = formData.rol === 'admin' || formData.rol === 'administrador';
      const wasAdmin = selectedUser.rol === 'admin' || selectedUser.rol === 'administrador';
      if ((isTargetAdmin && !wasAdmin) || (isTargetAdmin && !Array.isArray(selectedUser.permisos))) {
        payload.permisos = [];
      }

      if (showChangePassword && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await usuariosApi.updateAdmin(selectedUser.id, payload);
      showToast('Usuario Actualizado', `Información de ${formData.nombres} guardada.`, 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      await onReload();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el usuario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser?.id) {
      showToast('Acción Bloqueada', 'No puedes eliminar tu propia cuenta.', 'error');
      setUserToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await usuariosApi.delete(userToDelete.id);
      showToast('Usuario Eliminado', `La cuenta de ${userToDelete.nombres} fue eliminada.`, 'success');
      setUserToDelete(null);
      await onReload();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo eliminar el usuario.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
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
            placeholder="Buscar por nombre, apellidos o número de cédula..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#201f21] border border-white/10 text-white placeholder-[#9a907c] text-xs focus:outline-none focus:border-[#ffd56d] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-[#201f21] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => {
                setRoleFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === 'all' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              Todos ({usuarios.length})
            </button>
            <button
              onClick={() => {
                setRoleFilter('admin');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'admin' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admins ({usuarios.filter((u) => u.rol === 'admin' || u.rol === 'administrador').length})</span>
            </button>
            <button
              onClick={() => {
                setRoleFilter('usuario');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'usuario' ? 'bg-[#ffd56d] text-[#3e2e00] shadow' : 'text-[#d1c5af] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Usuarios ({usuarios.filter((u) => u.rol !== 'admin' && u.rol !== 'administrador').length})</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Usuario</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1c1b1d] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#201f21]/70 text-[#9a907c] font-display uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Usuario</th>
                <th className="py-3.5 px-4 font-bold">Cédula</th>
                <th className="py-3.5 px-4 font-bold">Cargo</th>
                <th className="py-3.5 px-4 font-bold">Contacto</th>
                <th className="py-3.5 px-4 font-bold">Rol</th>
                <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9a907c]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ffd56d]" />
                    <p className="font-semibold text-white">No se encontraron usuarios</p>
                    <p className="text-[11px] mt-0.5">Intenta cambiar el filtro de búsqueda o el rol seleccionado.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsuarios.map((u) => {
                  const isAdmin = u.rol === 'admin' || u.rol === 'administrador';
                  const isCurrent = u.id === currentUser?.id;
                  const cargoText = u.cargo && u.cargo.trim() ? u.cargo.trim() : null;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                              isAdmin ? 'bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30' : 'bg-white/5 text-zinc-300 border border-white/10'
                            }`}
                          >
                            {u.nombres?.charAt(0) || 'U'}
                            {u.apellidos?.charAt(0) || ''}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.nombres} {u.apellidos}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ffd56d]/20 text-[#ffd56d] border border-[#ffd56d]/30">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#9a907c] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span>{u.correo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white text-xs font-semibold flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#d1c5af]">
                            {u.tipo_documento || 'CC'}
                          </span>
                          <span>{u.numero_cedula}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {cargoText ? (
                          <div className="flex items-center gap-1.5 text-zinc-200">
                            <Briefcase className="w-3.5 h-3.5 text-[#ffd56d]" />
                            <span className="font-medium">{cargoText}</span>
                            {u.empresa && (
                              <span className="text-[10px] text-[#9a907c]">({u.empresa})</span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 italic bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            Todavía no definido
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#9a907c]">
                        {u.telefono ? (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Phone className="w-3 h-3 text-[#ffd56d]" />
                            <span className="font-mono text-[11px]">{u.telefono}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#9a907c]">Sin teléfono</span>
                        )}
                        {u.fecha_nacimiento && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#9a907c] mt-1">
                            <CalendarDays className="w-3 h-3 text-[#ffd56d]/70 shrink-0" />
                            <span>
                              {(() => {
                                try {
                                  const d = new Date(u.fecha_nacimiento);
                                  return !isNaN(d.getTime())
                                    ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
                                    : '';
                                } catch {
                                  return '';
                                }
                              })()}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 text-[#d1c5af] border border-white/10">
                            <User className="w-3 h-3" />
                            <span>Usuario</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Editar usuario"
                            className="p-2 rounded-xl bg-white/5 hover:bg-[#ffd56d] hover:text-[#3e2e00] text-zinc-300 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-zinc-600 bg-white/5'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#201f21]/70 border-t border-white/5 text-xs text-[#9a907c]">
          <div className="flex items-center gap-3">
            <span>
              Mostrando{' '}
              <strong className="text-white">
                {filteredUsuarios.length === 0 ? 0 : startIndex + 1} - {endIndex}
              </strong>{' '}
              de <strong className="text-white">{filteredUsuarios.length}</strong> usuarios
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ffd56d]/15 text-[#ffd56d] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Añadir Nuevo Usuario</h3>
                  <p className="text-xs text-[#9a907c]">Registra un nuevo usuario o administrador en la plataforma.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#9a907c] hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5 mt-5" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Nombres *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.nombres}
                    onChange={(e) => setField('nombres', e.target.value)}
                    placeholder="Nombres"
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.nombres ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.nombres && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.nombres}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Apellidos *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.apellidos}
                    onChange={(e) => setField('apellidos', e.target.value)}
                    placeholder="Apellidos"
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.apellidos ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.apellidos && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.apellidos}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Tipo Doc.</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => setField('tipo_documento', e.target.value)}
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PAS">Pasaporte</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>
                <div className="sm:col-span-7 space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Número de Documento *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.numero_cedula}
                    onChange={(e) => setField('numero_cedula', e.target.value)}
                    placeholder="N° de identificación fiscal"
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.numero_cedula ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.numero_cedula && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.numero_cedula}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Teléfono WhatsApp *</label>
                  <PhoneInput
                    country={'co'}
                    value={formData.telefono}
                    onChange={(val) => setField('telefono', val)}
                    inputStyle={{
                      width: '100%',
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      color: '#e5e1e4',
                      fontSize: '12px',
                      height: '38px',
                      paddingLeft: '52px',
                    }}
                    buttonStyle={{
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem 0 0 0.75rem',
                    }}
                    dropdownStyle={{
                      background: '#1a1a1c',
                      border: '1px solid rgba(255,213,109,0.25)',
                      borderRadius: '0.75rem',
                      color: '#e5e1e4',
                    }}
                    searchStyle={{
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      color: '#e5e1e4',
                      width: '90%',
                    }}
                    enableSearch
                    searchPlaceholder="Buscar país..."
                    placeholder="300 123 4567"
                    containerStyle={{ width: '100%' }}
                    inputProps={{ autoComplete: 'off' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Correo Corporativo *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.correo}
                      onChange={(e) => setField('correo', e.target.value)}
                      placeholder="contacto@empresa.com"
                      className={`w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                        formErrors.correo ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                      }`}
                    />
                  </div>
                  {formErrors.correo && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.correo}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#e5e1e4]">Fecha de Nacimiento *</label>
                <div className="relative">
                  <DatePicker
                    selected={birthDate}
                    onChange={(date) => {
                      setBirthDate(date);
                      if (formErrors.fecha_nacimiento) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.fecha_nacimiento;
                          return next;
                        });
                      }
                    }}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/aaaa"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    className={`wuish-datepicker ${formErrors.fecha_nacimiento ? '!border-red-500/70' : ''}`}
                    calendarClassName="wuish-calendar"
                    wrapperClassName="w-full"
                    autoComplete="off"
                  />
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c] pointer-events-none" />
                </div>
                {formErrors.fecha_nacimiento && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.fecha_nacimiento}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#e5e1e4]">Contraseña Inicial *</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                  <input
                    type={showCreatePwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-9 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.password ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePwd(!showCreatePwd)}
                    className="absolute right-3 text-[#9a907c] hover:text-[#e5e1e4] transition"
                  >
                    {showCreatePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.password}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Empresa (Opcional)</label>
                  <div className="relative flex items-center">
                    <Building className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.empresa}
                      onChange={(e) => setField('empresa', e.target.value)}
                      placeholder="Nombre de la empresa"
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Cargo en la Empresa (Opcional)</label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.cargo}
                      onChange={(e) => setField('cargo', e.target.value)}
                      placeholder="Ej. Gerente de Tecnología"
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#e5e1e4]">Rol en la Plataforma *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setField('rol', e.target.value)}
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="usuario">Usuario Estándar (Cliente)</option>
                  <option value="admin">Administrador (Acceso al Panel)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ffd56d]/15 text-[#ffd56d] flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">
                    Editar Usuario: {selectedUser.nombres} {selectedUser.apellidos}
                  </h3>
                  <p className="text-xs text-[#9a907c]">Modifica los datos personales, cargo o rol en el sistema.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-[#9a907c] hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-5" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Nombres *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.nombres}
                    onChange={(e) => setField('nombres', e.target.value)}
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.nombres ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.nombres && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.nombres}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Apellidos *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.apellidos}
                    onChange={(e) => setField('apellidos', e.target.value)}
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.apellidos ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.apellidos && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.apellidos}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Tipo Doc.</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => setField('tipo_documento', e.target.value)}
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PAS">Pasaporte</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>
                <div className="sm:col-span-7 space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Número de Documento *</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.numero_cedula}
                    onChange={(e) => setField('numero_cedula', e.target.value)}
                    className={`w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                      formErrors.numero_cedula ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                    }`}
                  />
                  {formErrors.numero_cedula && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.numero_cedula}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Teléfono WhatsApp *</label>
                  <PhoneInput
                    country={'co'}
                    value={formData.telefono}
                    onChange={(val) => setField('telefono', val)}
                    inputStyle={{
                      width: '100%',
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      color: '#e5e1e4',
                      fontSize: '12px',
                      height: '38px',
                      paddingLeft: '52px',
                    }}
                    buttonStyle={{
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem 0 0 0.75rem',
                    }}
                    dropdownStyle={{
                      background: '#1a1a1c',
                      border: '1px solid rgba(255,213,109,0.25)',
                      borderRadius: '0.75rem',
                      color: '#e5e1e4',
                    }}
                    searchStyle={{
                      background: '#0e0e10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      color: '#e5e1e4',
                      width: '90%',
                    }}
                    enableSearch
                    searchPlaceholder="Buscar país..."
                    placeholder="300 123 4567"
                    containerStyle={{ width: '100%' }}
                    inputProps={{ autoComplete: 'off' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Correo Corporativo *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.correo}
                      onChange={(e) => setField('correo', e.target.value)}
                      className={`w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none text-xs transition ${
                        formErrors.correo ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-[#ffd56d]/50'
                      }`}
                    />
                  </div>
                  {formErrors.correo && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.correo}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#e5e1e4]">Fecha de Nacimiento</label>
                <div className="relative">
                  <DatePicker
                    selected={birthDate}
                    onChange={(date) => setBirthDate(date)}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/aaaa"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    className="wuish-datepicker"
                    calendarClassName="wuish-calendar"
                    wrapperClassName="w-full"
                    autoComplete="off"
                  />
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a907c] pointer-events-none" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#ffd56d]" />
                    <span className="text-xs font-bold text-[#e5e1e4] uppercase tracking-wider">
                      Cambiar Contraseña
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(!showChangePassword);
                      if (showChangePassword) setField('password', '');
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      showChangePassword ? 'bg-[#ffd56d]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        showChangePassword ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {showChangePassword ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#e5e1e4]">Nueva Contraseña</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                      <input
                        type={showEditPwd ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setField('password', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoFocus
                        className={`w-full bg-[#1c1b1d] text-[#e5e1e4] pl-9 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                          formErrors.password ? 'border-red-500/70 focus:border-red-400' : 'border-[#ffd56d]/40 focus:border-[#ffd56d]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPwd(!showEditPwd)}
                        className="absolute right-3 text-[#9a907c] hover:text-[#e5e1e4] transition"
                      >
                        {showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password ? (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />{formErrors.password}
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-400/80 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        El usuario deberá usar esta nueva contraseña para iniciar sesión.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#9a907c]">
                    Activa el interruptor para establecer una nueva contraseña para este usuario.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Empresa (Opcional)</label>
                  <div className="relative flex items-center">
                    <Building className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.empresa}
                      onChange={(e) => setField('empresa', e.target.value)}
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#e5e1e4]">Cargo en la Empresa (Opcional)</label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3 text-[#9a907c] w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.cargo}
                      onChange={(e) => setField('cargo', e.target.value)}
                      placeholder="Todavía no definido"
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#e5e1e4]">Rol en la Plataforma *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setField('rol', e.target.value)}
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="usuario">Usuario Estándar (Cliente)</option>
                  <option value="admin">Administrador (Acceso al Panel)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white font-display">¿Eliminar usuario?</h3>
              <p className="text-xs text-[#9a907c]">
                Esta acción eliminará permanentemente la cuenta de{' '}
                <strong className="text-white">{userToDelete.nombres} {userToDelete.apellidos}</strong> (Cédula: {userToDelete.numero_cedula}) y todas sus solicitudes asociadas.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex-1 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

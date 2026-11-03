import React from 'react';
import { CalendarDays, ClipboardList, Clock3, FileText, Phone, Tag, UserRound, Users, X } from 'lucide-react';

interface SolicitudDetailsProps {
  solicitud: any;
  onClose?: () => void;
  currentAdmin?: any;
}

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') return 'No especificado';
  return String(value);
};

const parseServices = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [{ servicio: value }];
    }
  }
  return [value];
};

const getCleanDescription = (description: any, services: any[]) => {
  if (!description) return description;
  const firstService = services[0];
  if (!firstService || typeof description !== 'string') return description;

  let cleanDescription = description;
  const title = firstService.titulo;
  const notes = firstService.notas;

  if (title && cleanDescription.startsWith(`${title}: `)) {
    cleanDescription = cleanDescription.slice(`${title}: `.length);
  }
  if (notes && cleanDescription.endsWith(` — Notas: ${notes}`)) {
    cleanDescription = cleanDescription.slice(0, -` — Notas: ${notes}`.length);
  }
  return cleanDescription.trim();
};

export const SolicitudDetails: React.FC<SolicitudDetailsProps> = ({ solicitud, onClose, currentAdmin }) => {
  React.useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!solicitud) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  const services = parseServices(solicitud.servicios_seleccionados);
  const serviceNames = services
    .map((service: any) => service.nombre_servicio || service.nombre || service.name || service.servicio || service.id)
    .filter(Boolean)
    .filter((name: string, index: number, list: string[]) => list.indexOf(name) === index);
  const cleanDescription = getCleanDescription(solicitud.descripcion, services);
  const assignedAdmins = (solicitud.administradores || [])
    .map((assignment: any) => {
      const admin = assignment.admin || assignment;
      return {
        ...admin,
        id: admin.id || assignment.admin_id,
      };
    })
    .filter((admin: any) => admin?.id || admin?.nombres || admin?.correo);
  if (solicitud.admin_asignado && !assignedAdmins.some((admin: any) => admin.id === solicitud.admin_asignado.id)) {
    assignedAdmins.push(solicitud.admin_asignado);
  }
  if (solicitud.admin_asignado_id && !assignedAdmins.some((admin: any) => admin.id === solicitud.admin_asignado_id)) {
    assignedAdmins.push({ id: solicitud.admin_asignado_id, nombres: 'Administrador asignado' });
  }
  const uniqueAssignedAdmins = assignedAdmins.filter((admin: any, index: number, list: any[]) =>
    list.findIndex((item) => item.id && item.id === admin.id) === index
  );
  const involvedPeople = [
    ...uniqueAssignedAdmins.map((admin: any) => ({
      ...admin,
    })),
    ...(currentAdmin && !uniqueAssignedAdmins.some((admin: any) => admin.id === currentAdmin.id)
      ? [{ ...currentAdmin }]
      : []),
  ].filter(Boolean).filter((person: any, index: number, list: any[]) =>
    list.findIndex((item) => item.id && item.id === person.id) === index
  );

  const detailFields = [
    [ClipboardList, 'Código', `#${solicitud.id?.slice(0, 8) || '—'}`],
    [Tag, 'Tipo / categoría', solicitud.tipo],
    [Clock3, 'Estado', solicitud.estado?.replace(/_/g, ' ')],
    [FileText, 'Empresa', solicitud.empresa],
    [Phone, 'Teléfono de contacto', solicitud.telefono_contacto],
    [CalendarDays, 'Fecha de solicitud', solicitud.fecha_solicitud || solicitud.created_at
      ? new Date(solicitud.fecha_solicitud || solicitud.created_at).toLocaleString('es-CO')
      : null],
    [CalendarDays, 'Última actualización', solicitud.updated_at
      ? new Date(solicitud.updated_at).toLocaleString('es-CO')
      : null],
    [Clock3, 'Plazo de entrega', solicitud.velocidad_entrega],
    [Tag, 'Nivel de soporte', solicitud.nivel_soporte],
    [FileText, 'Notas', services[0]?.notas],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solicitud-details-title"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#ffd56d]/35 bg-[#1c1b1d] shadow-2xl shadow-black/50">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1c1b1d]/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffd56d]/15 text-[#ffd56d]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h4 id="solicitud-details-title" className="text-base font-bold text-white">Detalles de la solicitud</h4>
                <p className="text-[11px] text-[#9a907c]">Toda la información registrada del requerimiento.</p>
              </div>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Cerrar detalles" className="rounded-xl border border-white/10 p-2 text-[#9a907c] transition hover:border-[#ffd56d]/40 hover:bg-[#ffd56d]/10 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-xl border border-[#ffd56d]/30 bg-[#0e0e10] p-5 text-center transition hover:border-[#ffd56d]/50">
            <div className="flex items-center justify-center gap-2 text-[#9a907c]">
              <FileText className="h-4 w-4 text-[#ffd56d]" />
              <p className="text-[10px] uppercase tracking-wide">Título</p>
            </div>
            <p className="mt-2 break-words text-base font-semibold text-white">{formatValue(services[0]?.titulo)}</p>
          </div>

          {serviceNames.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#0e0e10] p-4">
              <div className="flex items-center gap-2 text-[#9a907c]">
                <ClipboardList className="h-4 w-4 text-[#ffd56d]" />
                <p className="text-[10px] uppercase tracking-wide">Servicios</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {serviceNames.map((name) => (
                  <span key={name} className="rounded-lg border border-[#ffd56d]/25 bg-[#ffd56d]/10 px-3 py-2 text-sm font-semibold text-white">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {detailFields.map(([Icon, label, value]) => (
              <div key={String(label)} className="rounded-xl border border-white/10 bg-[#0e0e10] p-4 transition hover:border-[#ffd56d]/25">
                <div className="flex items-center gap-2 text-[#9a907c]">
                  <Icon className="h-3.5 w-3.5 text-[#ffd56d]" />
                  <p className="text-[10px] uppercase tracking-wide">{String(label)}</p>
                </div>
                <p className="mt-2 break-words text-sm font-semibold capitalize text-white">{formatValue(value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e10] p-4">
            <div className="flex items-center gap-2 text-[#9a907c]">
              <FileText className="h-4 w-4 text-[#ffd56d]" />
              <p className="text-[10px] uppercase tracking-wide">Descripción</p>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white">{formatValue(cleanDescription)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e10] p-4">
            <div className="flex items-center gap-2 text-[#9a907c]">
              <Users className="h-4 w-4 text-[#ffd56d]" />
              <p className="text-[10px] uppercase tracking-wide">Personas involucradas</p>
            </div>
            {involvedPeople.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {involvedPeople.map((person: any, index: number) => (
                  <div key={person.id || index} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#1c1b1d] p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffd56d]/15 text-[#ffd56d]">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {[person.nombres, person.apellidos].filter(Boolean).join(' ') || 'Persona involucrada'}
                      </p>
                      {person.correo && <p className="truncate text-xs text-[#9a907c]">{person.correo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#9a907c]">No hay administradores asignados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

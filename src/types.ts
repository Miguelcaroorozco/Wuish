// ============================
// Types aligned with PostgreSQL database schema
// ============================

export type UserRole = 'usuario' | 'admin' | 'administrador';

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  numero_cedula: string;
  tipo_documento: string;
  fecha_nacimiento: string;
  telefono: string | null;
  correo: string;
  rol: string;
  created_at: string;
  updated_at: string;
}

export interface TipoServicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  planes?: Plan[];
}

export interface Plan {
  id: string;
  tipo_servicio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  caracteristicas: any;
  activo: boolean;
  tipo_servicio?: TipoServicio;
}

export interface Solicitud {
  id: string;
  usuario_id: string;
  tipo: string;
  estado: string;
  descripcion: string | null;
  plan_id: string | null;
  admin_asignado_id: string | null;
  fecha_solicitud: string;
  fecha_limite_borrado: string | null;
  created_at: string;
  updated_at: string;
  usuario?: Partial<User>;
  plan?: Plan;
  admin_asignado?: Partial<User>;
  historial?: SolicitudHistorial[];
  ajustes?: SolicitudAjuste[];
}

export interface SolicitudHistorial {
  id: string;
  solicitud_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  motivo: string | null;
  changed_at: string;
}

export interface SolicitudAjuste {
  id: string;
  solicitud_id: string;
  descripcion_ajuste: string;
  respondido_por: string;
  created_at: string;
  respondidoPor?: Partial<User>;
}

export interface Mensaje {
  id: string;
  usuario_id: string;
  solicitud_id: string | null;
  asunto: string | null;
  contenido: string;
  leido: boolean;
  created_at: string;
  usuario?: Partial<User>;
  solicitud?: Partial<Solicitud>;
}

export interface InfoGeneral {
  id: string;
  seccion: string;
  contenido: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface Equipo {
  id: string;
  nombre: string;
  cargo: string | null;
  foto_url: string | null;
  descripcion: string | null;
  orden: number | null;
}

export interface Comentario {
  id: string;
  usuario_id: string | null;
  contenido: string;
  calificacion: number | null;
  mostrar_en_pagina: boolean;
  orden: number | null;
  created_at: string;
  usuario?: Partial<User>;
}

export interface Resultado {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
  orden: number | null;
}

export interface PasoProceso {
  id: string;
  numero_paso: number;
  titulo: string;
  descripcion: string | null;
  icono: string | null;
}

export interface CarritoItem {
  id: string;
  usuario_id: string;
  plan_id: string;
  cantidad: number;
  created_at: string;
  plan?: Plan;
}

// Legacy compatibility types (for components not yet fully migrated)
export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
  isMe: boolean;
  avatar?: string;
}

export interface ServiceModule {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'comunicacion' | 'tecnologia';
  icon: string;
}

export interface PlanTier {
  id: string;
  name: string;
  badge: string;
  price: number | string;
  unit: string;
  category: 'digitalizacion' | 'crecimiento' | 'optimizacion' | 'transformacion';
  description: string;
  features: string[];
  isFeatured?: boolean;
}

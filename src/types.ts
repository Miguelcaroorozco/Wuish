export type UserRole = 'client' | 'admin' | 'consultant';

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  tier?: string;
  accountId?: string;
  sla?: string;
  phone?: string;
  docType?: string;
  docNumber?: string;
}

// Estados válidos de una solicitud. Deben coincidir con el CHECK
// solicitudes_estado_check de wuish_database_schema.sql y con
// wuish-api/src/solicitudes/estados.ts.
export const ESTADOS_SOLICITUD = [
  'pendiente',
  'en_revision',
  'en_proceso',
  'aprobada',
  'finalizada',
  'cancelada',
] as const;

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  en_proceso: 'En Proceso',
  aprobada: 'Aprobada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

// Estados que ya no cuentan como trabajo en curso
export const ESTADOS_SOLICITUD_CERRADOS: readonly EstadoSolicitud[] = ['finalizada', 'cancelada'];

export interface Solicitud {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  date: string;
  plan: string;
  status: EstadoSolicitud;
  assignedTo?: string;
  budget?: string;
}

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

export interface Testimonial {
  id: string;
  userId: string;
  name: string;
  company: string;
  rating: number;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'hidden';
}

export type ProjectCategory = 'comunicacion' | 'tecnologia';

export interface Project {
  id: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: string;
  description: string;
  imageUrl?: string;
  link?: string;
  tags: string[];
}

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
}


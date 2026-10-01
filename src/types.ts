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

export interface Solicitud {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  date: string;
  plan: string;
  status: 'En Proceso' | 'En Revisión' | 'Aprobada' | 'Finalizada';
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
  status: 'pending' | 'approved';
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

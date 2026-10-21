export interface CotizadorServiceItem {
  id: string;
  name: string;
  category: 'comunicacion' | 'tecnologia';
  basePrice: number;
  description: string;
  activo?: boolean;
}

export const DEFAULT_COTIZADOR_SERVICES: CotizadorServiceItem[] = [
  {
    id: 'ads',
    name: 'Marketing & Pauta Omnicanal',
    category: 'comunicacion',
    basePrice: 4800000,
    description: 'Meta, Google Ads, LinkedIn B2B + ROAS Tracking',
  },
  {
    id: 'video',
    name: 'Producción de Video Cinemático',
    category: 'comunicacion',
    basePrice: 5800000,
    description: 'Brand films 4K, Motion Design y comerciales 3D',
  },
  {
    id: 'branding',
    name: 'Identidad & Branding Corporativo',
    category: 'comunicacion',
    basePrice: 3800000,
    description: 'Manual de marca, tipografía y activos gráficos',
  },
  {
    id: 'web',
    name: 'Desarrollo Web & E-Commerce',
    category: 'tecnologia',
    basePrice: 7200000,
    description: 'Headless Next.js, pasarelas globales y alta velocidad',
  },
  {
    id: 'mobile',
    name: 'Apps Móviles (iOS & Android)',
    category: 'tecnologia',
    basePrice: 10400000,
    description: 'Flutter / Swift nativo, offline-first y push notifications',
  },
  {
    id: 'erp',
    name: 'Software ERP / CRM a Medida',
    category: 'tecnologia',
    basePrice: 11600000,
    description: 'Gestión de inventarios, roles RBAC y facturación multi-país',
  },
  {
    id: 'automatizacion',
    name: 'Automatización & Business Intelligence',
    category: 'tecnologia',
    basePrice: 6400000,
    description: 'Flujos automatizados, integraciones API y dashboards en tiempo real',
  },
  {
    id: 'sec',
    name: 'Ciberseguridad & Auditoría Cloud',
    category: 'tecnologia',
    basePrice: 5400000,
    description: 'Pentesting, SOC2, blindaje de datos y certificación',
  },
];

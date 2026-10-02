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
    basePrice: 1200,
    description: 'Meta, Google Ads, LinkedIn B2B + ROAS Tracking',
  },
  {
    id: 'video',
    name: 'Producción de Video Cinemático',
    category: 'comunicacion',
    basePrice: 1450,
    description: 'Brand films 4K, Motion Design y comerciales 3D',
  },
  {
    id: 'branding',
    name: 'Identidad & Branding Corporativo',
    category: 'comunicacion',
    basePrice: 950,
    description: 'Manual de marca, tipografía y activos gráficos',
  },
  {
    id: 'web',
    name: 'Desarrollo Web & E-Commerce',
    category: 'tecnologia',
    basePrice: 1800,
    description: 'Headless Next.js, pasarelas globales y alta velocidad',
  },
  {
    id: 'mobile',
    name: 'Apps Móviles (iOS & Android)',
    category: 'tecnologia',
    basePrice: 2600,
    description: 'Flutter / Swift nativo, offline-first y push notifications',
  },
  {
    id: 'erp',
    name: 'Software ERP / CRM a Medida',
    category: 'tecnologia',
    basePrice: 2900,
    description: 'Gestión de inventarios, roles RBAC y facturación multi-país',
  },
  {
    id: 'automatizacion',
    name: 'Automatización & Business Intelligence',
    category: 'tecnologia',
    basePrice: 1600,
    description: 'Flujos automatizados, integraciones API y dashboards en tiempo real',
  },
  {
    id: 'sec',
    name: 'Ciberseguridad & Auditoría Cloud',
    category: 'tecnologia',
    basePrice: 1350,
    description: 'Pentesting, SOC2, blindaje de datos y certificación',
  },
];

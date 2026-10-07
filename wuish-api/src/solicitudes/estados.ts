// Estados válidos de una solicitud. Deben coincidir con el CHECK
// solicitudes_estado_check de wuish_database_schema.sql y con src/types.ts.
export const ESTADOS_SOLICITUD = [
  'pendiente',
  'en_revision',
  'en_proceso',
  'aprobada',
  'finalizada',
  'cancelada',
] as const;

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export const isEstadoSolicitud = (estado: string): estado is EstadoSolicitud =>
  (ESTADOS_SOLICITUD as readonly string[]).includes(estado);

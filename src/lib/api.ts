// ============================
// Wuish API Client
// ============================
// Centralizes all HTTP calls to the NestJS backend

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// ========== TOKEN MANAGEMENT ==========
const TOKEN_KEY = 'wuish_jwt_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ========== HTTP HELPER ==========
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `Error ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  return response.json();
}

// ========== AUTH ==========
export const authApi = {
  login: (correo: string, password: string) =>
    request<{ success: boolean; message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    }),

  register: (data: {
    nombres: string;
    apellidos: string;
    numero_cedula: string;
    tipo_documento: string;
    fecha_nacimiento: string;
    telefono?: string;
    correo: string;
    password: string;
  }) =>
    request<{ success: boolean; message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    request<any>('/auth/me'),
};

// ========== USUARIOS ==========
export const usuariosApi = {
  getMe: () => request<any>('/usuarios/me'),

  updateMe: (data: { nombres?: string; apellidos?: string; telefono?: string; empresa?: string; cargo?: string }) =>
    request<any>('/usuarios/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAll: () => request<any[]>('/usuarios'),
};

// ========== PLANES ==========
export const planesApi = {
  getAll: (includeInactive = false) =>
    request<any[]>(`/planes${includeInactive ? '?all=true' : ''}`),

  getById: (id: string) =>
    request<any>(`/planes/${id}`),

  create: (data: {
    tipo_servicio_id: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    caracteristicas?: any;
  }) =>
    request<any>('/planes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/planes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/planes/${id}`, { method: 'DELETE' }),
};

// ========== TIPOS DE SERVICIO ==========
export const tiposServicioApi = {
  getAll: () => request<any[]>('/tipos-servicio'),

  create: (data: { nombre: string; descripcion?: string }) =>
    request<any>('/tipos-servicio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { nombre?: string; descripcion?: string }) =>
    request<any>(`/tipos-servicio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/tipos-servicio/${id}`, { method: 'DELETE' }),
};

// ========== SOLICITUDES ==========
export const solicitudesApi = {
  getMine: () => request<any[]>('/solicitudes'),

  getAll: (filters?: { estado?: string; tipo?: string }) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.tipo) params.set('tipo', filters.tipo);
    const qs = params.toString();
    return request<any[]>(`/solicitudes/all${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => request<any>(`/solicitudes/${id}`),

  create: (data: {
    tipo?: string;
    descripcion?: string;
    plan_id?: string;
    empresa?: string;
    telefono_contacto?: string;
    servicios_seleccionados?: any;
    presupuesto_min?: number;
    presupuesto_max?: number;
    velocidad_entrega?: string;
    nivel_soporte?: string;
  }) =>
    request<any>('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEstado: (id: string, data: { estado: string; motivo?: string; admin_asignado_id?: string } | string) => {
    const body = typeof data === 'string' ? { estado: data } : data;
    return request<any>(`/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: (id: string) =>
    request<any>(`/solicitudes/${id}`, { method: 'DELETE' }),
};

// ========== MENSAJES ==========
export const mensajesApi = {
  getMine: () => request<any[]>('/mensajes'),

  getAll: () => request<any[]>('/mensajes/all'),

  getByUser: (usuarioId: string) => request<any[]>(`/mensajes/usuario/${usuarioId}`),

  getUnreadCount: () => request<number>('/mensajes/unread-count'),

  send: (data: { solicitud_id?: string; asunto?: string; contenido: string; usuario_id?: string }) =>
    request<any>('/mensajes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (id: string) =>
    request<any>(`/mensajes/${id}/leer`, { method: 'PUT' }),
};

// ========== INFO GENERAL ==========
export const infoGeneralApi = {
  getAll: () => request<any[]>('/info-general'),

  getBySeccion: (seccion: string) =>
    request<any>(`/info-general/${seccion}`),

  upsert: (seccion: string, contenido: string) =>
    request<any>('/info-general', {
      method: 'PUT',
      body: JSON.stringify({ seccion, contenido }),
    }),
};


// ========== COMENTARIOS ==========
export const comentariosApi = {
  getPublicos: () => request<any[]>('/comentarios/publicos'),

  getAll: () => request<any[]>('/comentarios'),

  create: (data: { contenido: string; calificacion?: number }) =>
    request<any>('/comentarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleMostrar: (id: string, mostrar: boolean, orden?: number) =>
    request<any>(`/comentarios/${id}/mostrar`, {
      method: 'PUT',
      body: JSON.stringify({ mostrar, orden }),
    }),

  delete: (id: string) =>
    request<any>(`/comentarios/${id}`, { method: 'DELETE' }),
};

// ========== COTIZADOR MÓDULOS ==========
export const cotizadorModulosApi = {
  getAll: (includeAll = false) =>
    request<any[]>(`/cotizador-modulos${includeAll ? '?all=true' : ''}`),

  upsert: (data: any) =>
    request<any>('/cotizador-modulos', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/cotizador-modulos/${id}`, { method: 'DELETE' }),
};

// ========== PROYECTOS / PORTAFOLIO ==========
export const proyectosApi = {
  getAll: (includeAll = false) =>
    request<any[]>(`/proyectos-portafolio${includeAll ? '?all=true' : ''}`),

  create: (data: any) =>
    request<any>('/proyectos-portafolio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/proyectos-portafolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/proyectos-portafolio/${id}`, { method: 'DELETE' }),
};

// Alias para compatibilidad
export const resultadosApi = proyectosApi;

// ========== MÉTRICAS LANDING ==========
export const metricasApi = {
  getAll: (includeAll = false) =>
    request<any[]>(`/metricas-landing${includeAll ? '?all=true' : ''}`),

  create: (data: { valor: number; sufijo?: string; etiqueta: string; orden?: number }) =>
    request<any>('/metricas-landing', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/metricas-landing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/metricas-landing/${id}`, { method: 'DELETE' }),
};

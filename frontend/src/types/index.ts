/**
 * TIPOS Y INTERFACES TYPESCRIPT
 * 
 * Define todas las interfaces compartidas en el proyecto.
 * Asegura type safety en toda la aplicación.
 */

// ========================================
// USUARIO
// ========================================

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'usuario';
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// TAREA
// ========================================

export type EstadoTarea = 'Pendiente' | 'En_progreso' | 'Completada' | 'Cancelada';
export type PrioridadTarea = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  fechaCreacion?: Date | string;
  fechaLimite: Date | string;
  responsable: string | Usuario; // Puede ser ID o objeto completo
  creadoPor?: string | Usuario;
  prioridad?: PrioridadTarea;
  createdAt?: string;
  updatedAt?: string;
}

// Formulario para crear/editar tareas
export interface TareaFormData {
  titulo: string;
  descripcion: string;
  fechaLimite: string; // ISO string para inputs type="date"
  responsable: string;
  prioridad?: PrioridadTarea;
  estado?: EstadoTarea;
}

// ========================================
// NOTIFICACIÓN
// ========================================

export type TipoNotificacion = 
  | 'tarea_asignada'
  | 'tarea_actualizada'
  | 'tarea_completada'
  | 'tarea_vencida'
  | 'recordatorio'
  | 'sistema'
  | 'comentario';

export type PrioridadNotificacion = 'baja' | 'media' | 'alta';

export interface Notificacion {
  id: string;
  mensaje: string;
  fecha: Date | string;
  usuario_id: string;
  tarea_id?: string | Tarea; // Opcional, puede ser ID o objeto
  leida: boolean;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// AUTENTICACIÓN
// ========================================

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

export interface AuthState {
  status: AuthStatus;
  user: Usuario | null;
  token: string | null;
  errorMessage: string | null;
}

// Datos para login
export interface LoginData {
  correo: string;
  password: string;
}

// Datos para registro
export interface RegisterData {
  nombre: string;
  correo: string;
  password: string;
  rol: 'admin' | 'usuario';
}

// ========================================
// RESPUESTAS DE API
// ========================================

export interface ApiResponse<T = any> {
  ok: boolean;
  msg?: string;
  data?: T;
  error?: string;
}

// Respuesta de autenticación
export interface AuthResponse {
  ok: boolean;
  uid?: string;
  nombre?: string;
  rol?: 'admin' | 'usuario';
  token?: string;
  msg?: string;
}

// Respuesta de tareas
export interface TareasResponse {
  ok: boolean;
  tareas?: Tarea[];
  tarea?: Tarea;
  total?: number;
  msg?: string;
}

// Respuesta de notificaciones
export interface NotificacionesResponse {
  ok: boolean;
  notificaciones?: Notificacion[];
  notificacion?: Notificacion;
  noLeidas?: number;
  total?: number;
  msg?: string;
}

// ========================================
// ESTADOS DE COMPONENTES
// ========================================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

export interface FiltrosTareas {
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  responsable?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

// ========================================
// FORMULARIOS
// ========================================

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

// ========================================
// CONTEXT TYPES
// ========================================

// Context de Auth
export interface AuthContextType {
  authState: AuthState;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Context de Tareas
export interface TareasContextType {
  tareas: Tarea[];
  tareaActual: Tarea | null;
  loading: boolean;
  error: string | null;
  obtenerTareas: () => Promise<void>;
  obtenerTareaPorId: (id: string) => Promise<void>;
  crearTarea: (tarea: TareaFormData) => Promise<boolean>;
  actualizarTarea: (id: string, tarea: Partial<TareaFormData>) => Promise<boolean>;
  cambiarEstado: (id: string, estado: EstadoTarea) => Promise<boolean>;
  eliminarTarea: (id: string) => Promise<boolean>;
  filtrarTareas: (filtros: FiltrosTareas) => Tarea[];
  limpiarTareaActual: () => void;
}

// Context de Notificaciones
export interface NotificacionesContextType {
  notificaciones: Notificacion[];
  noLeidas: number;
  loading: boolean;
  obtenerNotificaciones: () => Promise<void>;
  obtenerContador: () => Promise<void>;
  marcarComoLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  eliminarNotificacion: (id: string) => Promise<void>;
}

// ========================================
// PROPS DE COMPONENTES
// ========================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}

export interface TareaCardProps {
  tarea: Tarea;
  onEdit?: (tarea: Tarea) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, estado: EstadoTarea) => void;
}

export interface NotificacionItemProps {
  notificacion: Notificacion;
  onMarcarLeida?: (id: string) => void;
  onEliminar?: (id: string) => void;
}
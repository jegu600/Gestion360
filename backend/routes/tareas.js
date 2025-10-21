/**
 * RUTAS DE TAREAS
 * 
 * Define todos los endpoints para la gestión de tareas.
 * Todas las rutas están protegidas con JWT.
 * Incluye validaciones con express-validator.
 * 
 * CAMBIO: Archivo creado desde cero - reemplaza events.js
 */

const { Router } = require('express');
const { check } = require('express-validator');

// Middlewares
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJsonWT } = require('../middlewares/validarJWT');

// Controllers
const {
    obtenerTareas,
    obtenerTareaPorId,
    crearTarea,
    actualizarTarea,
    cambiarEstadoTarea,
    eliminarTarea,
    obtenerTareasPorEstado
} = require('../controllers/tareas');

const router = Router();

/**
 * IMPORTANTE: Todas las rutas requieren autenticación JWT
 * El middleware se aplica a todas las rutas que vienen después
 */
router.use(validarJsonWT);

/**
 * GET /api/tareas
 * Obtiene todas las tareas del usuario autenticado
 */
router.get('/', obtenerTareas);

/**
 * GET /api/tareas/estado/:estado
 * Obtiene tareas filtradas por estado
 * Estados válidos: Pendiente, En_progreso, Completada, Cancelada
 */
router.get(
    '/estado/:estado',
    [
        check('estado', 'El estado es obligatorio').not().isEmpty(),
        check('estado', 'Estado no válido').isIn(['Pendiente', 'En_progreso', 'Completada', 'Cancelada']),
        validarCampos
    ],
    obtenerTareasPorEstado
);

/**
 * GET /api/tareas/:id
 * Obtiene una tarea específica por ID
 */
router.get(
    '/:id',
    [
        check('id', 'El ID no es válido').isMongoId(),
        validarCampos
    ],
    obtenerTareaPorId
);

/**
 * POST /api/tareas
 * Crea una nueva tarea
 * 
 * Body requerido:
 * - titulo: String (mínimo 3 caracteres)
 * - descripcion: String (mínimo 10 caracteres)
 * - fechaLimite: Date (fecha futura)
 * - responsable: ObjectId (usuario válido)
 * 
 * Body opcional:
 * - estado: String (por defecto: Pendiente)
 * - prioridad: String (por defecto: Media)
 */
router.post(
    '/',
    [
        check('titulo', 'El título es obligatorio').not().isEmpty(),
        check('titulo', 'El título debe tener al menos 3 caracteres').isLength({ min: 3 }),
        check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
        check('descripcion', 'La descripción debe tener al menos 10 caracteres').isLength({ min: 10 }),
        check('fechaLimite', 'La fecha límite es obligatoria').not().isEmpty(),
        check('fechaLimite', 'La fecha límite debe ser válida').isISO8601(),
        check('responsable', 'El responsable es obligatorio').not().isEmpty(),
        check('responsable', 'El ID del responsable no es válido').isMongoId(),
        check('estado', 'Estado no válido').optional().isIn(['Pendiente', 'En_progreso', 'Completada', 'Cancelada']),
        check('prioridad', 'Prioridad no válida').optional().isIn(['Baja', 'Media', 'Alta', 'Urgente']),
        validarCampos
    ],
    crearTarea
);

/**
 * PUT /api/tareas/:id
 * Actualiza una tarea existente
 * 
 * Puede actualizar cualquier campo de la tarea.
 * Solo el creador o responsable pueden actualizar.
 */
router.put(
    '/:id',
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('titulo', 'El título debe tener al menos 3 caracteres').optional().isLength({ min: 3 }),
        check('descripcion', 'La descripción debe tener al menos 10 caracteres').optional().isLength({ min: 10 }),
        check('fechaLimite', 'La fecha límite debe ser válida').optional().isISO8601(),
        check('responsable', 'El ID del responsable no es válido').optional().isMongoId(),
        check('estado', 'Estado no válido').optional().isIn(['Pendiente', 'En_progreso', 'Completada', 'Cancelada']),
        check('prioridad', 'Prioridad no válida').optional().isIn(['Baja', 'Media', 'Alta', 'Urgente']),
        validarCampos
    ],
    actualizarTarea
);

/**
 * PATCH /api/tareas/:id/estado
 * Cambia solo el estado de una tarea
 * 
 * Endpoint más rápido que PUT para cambios de estado.
 * Body requerido:
 * - estado: String (Pendiente | En_progreso | Completada | Cancelada)
 */
router.patch(
    '/:id/estado',
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('estado', 'El estado es obligatorio').not().isEmpty(),
        check('estado', 'Estado no válido').isIn(['Pendiente', 'En_progreso', 'Completada', 'Cancelada']),
        validarCampos
    ],
    cambiarEstadoTarea
);

/**
 * DELETE /api/tareas/:id
 * Elimina una tarea
 * 
 * Solo el creador de la tarea puede eliminarla.
 * También se eliminan todas las notificaciones asociadas.
 */
router.delete(
    '/:id',
    [
        check('id', 'El ID no es válido').isMongoId(),
        validarCampos
    ],
    eliminarTarea
);

module.exports = router;
/**
 * RUTAS DE TAREAS - CORREGIDAS
 * 
 * Define todos los endpoints para la gestión de tareas.
 * Todas las rutas están protegidas con JWT.
 * Incluye validaciones con express-validator.
 */

const { Router } = require('express');
const { check } = require('express-validator');
const {
  obtenerTareas,
  obtenerTareaPorId,
  obtenerTareasPorEstado,
  crearTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  eliminarTarea,
} = require('../controllers/tareas');
const { validarJWT } = require('../middlewares/validarJWT');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

/**
 * TODAS LAS RUTAS REQUIEREN JWT
 * Aplicar middleware de validación a todas las rutas
 */
router.use(validarJWT);

/**
 * GET /api/tareas
 * Obtener todas las tareas del usuario autenticado
 */
router.get('/', obtenerTareas);

/**
 * GET /api/tareas/estado/:estado
 * Obtener tareas filtradas por estado
 */
router.get('/estado/:estado', obtenerTareasPorEstado);

// PATCH /:id/estado - Cambiar estado (DEBE IR ANTES que /:id para evitar conflictos de rutas!)
router.patch(
  '/:id/estado',
  [
    check('estado', 'El estado es requerido').notEmpty(),
    check('estado', 'El estado debe ser: Pendiente, En_progreso o Completada').isIn([
      'Pendiente',
      'En_progreso',
      'Completada',
    ]),
    validarCampos,
  ],
  cambiarEstadoTarea
);

/**
 * GET /api/tareas/:id
 * Obtener una tarea específica por ID
 */
router.get('/:id', obtenerTareaPorId);

/**
 * POST /api/tareas
 * Crear una nueva tarea
 */
router.post(
  '/',
  [
    check('titulo', 'El título es requerido').notEmpty(),
    check('titulo', 'El título debe tener al menos 3 caracteres').isLength({ min: 3 }),
    check('descripcion', 'La descripción es requerida').notEmpty(),
    validarCampos,
  ],
  crearTarea
);

/**
 * PUT /api/tareas/:id
 * Actualizar una tarea completa
 */
router.put(
  '/:id',
  [
    check('estado', 'El estado debe ser: Pendiente, En_progreso o Completada')
      .optional()
      .isIn(['Pendiente', 'En_progreso', 'Completada']),
    validarCampos,
  ],
  actualizarTarea
);

/**
 * DELETE /api/tareas/:id
 * Eliminar una tarea
 */
router.delete('/:id', eliminarTarea);

module.exports = router;
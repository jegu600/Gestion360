/**
 * RUTAS DE NOTIFICACIONES
 * 
 * Define todos los endpoints para la gestión de notificaciones.
 * Todas las rutas están protegidas con JWT.
 * 
 */

const { Router } = require('express');
const { check } = require('express-validator');

// Middlewares
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT } = require('../middlewares/validarJWT');

// Controllers
const {
    obtenerNotificaciones,
    obtenerNotificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarNotificacionesLeidas,
    obtenerContadorNoLeidas
} = require('../controllers/notificaciones');

const router = Router();

/**
 * IMPORTANTE: Todas las rutas requieren autenticación JWT
 */
router.use(validarJWT);

/**
 * GET /api/notificaciones
 * Obtiene todas las notificaciones del usuario autenticado
 * 
 * Query params opcionales:
 * - leida: true/false (filtrar por estado de lectura)
 * - limit: número (límite de resultados, por defecto 20)
 */
router.get('/', obtenerNotificaciones);

/**
 * GET /api/notificaciones/no-leidas
 * Obtiene solo las notificaciones no leídas
 * 
 * Limita a las 10 más recientes para optimizar la carga.
 */
router.get('/no-leidas', obtenerNotificacionesNoLeidas);

/**
 * GET /api/notificaciones/contador
 * Obtiene solo el contador de notificaciones no leídas
 * 
 * Endpoint ligero ideal para polling periódico.
 * No retorna las notificaciones completas, solo el número.
 */
router.get('/contador', obtenerContadorNoLeidas);

/**
 * PATCH /api/notificaciones/:id/leida
 * Marca una notificación específica como leída
 */
router.patch(
    '/:id/leida',
    [
        check('id', 'El ID no es válido').isMongoId(),
        validarCampos
    ],
    marcarComoLeida
);

/**
 * PATCH /api/notificaciones/marcar-todas-leidas
 * Marca todas las notificaciones del usuario como leídas
 * 
 * Útil para el botón "Marcar todas como leídas"
 */
router.patch('/marcar-todas-leidas', marcarTodasComoLeidas);

/**
 * DELETE /api/notificaciones/:id
 * Elimina una notificación específica
 */
router.delete(
    '/:id',
    [
        check('id', 'El ID no es válido').isMongoId(),
        validarCampos
    ],
    eliminarNotificacion
);

/**
 * DELETE /api/notificaciones/limpiar-leidas
 * Elimina todas las notificaciones leídas del usuario
 * 
 * Útil para limpiar el historial.
 */
router.delete('/limpiar-leidas', eliminarNotificacionesLeidas);

module.exports = router;
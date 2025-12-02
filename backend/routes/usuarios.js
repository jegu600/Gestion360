/**
 * RUTAS DE USUARIOS
 * 
 * Define todos los endpoints para la gestión de usuarios.
 * Todas las rutas están protegidas con JWT.
 * 
 * NUEVO: Archivo creado para rutas de usuarios
 */

const { Router } = require('express');
const { obtenerUsuarios, obtenerUsuarioPorId } = require('../controllers/usuarios');
const { validarJWT } = require('../middlewares/validarJWT');

const router = Router();

/**
 * TODAS LAS RUTAS REQUIEREN JWT
 * Aplicar middleware de validación a todas las rutas
 */
router.use(validarJWT);

/**
 * GET /api/usuarios
 * Obtener todos los usuarios del sistema
 * Para poder asignarlos como responsables de tareas
 */
router.get('/', obtenerUsuarios);

/**
 * GET /api/usuarios/:id
 * Obtener información de un usuario específico
 */
router.get('/:id', obtenerUsuarioPorId);

module.exports = router;
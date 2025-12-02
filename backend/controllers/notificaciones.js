/**
 * CONTROLLER DE NOTIFICACIONES
 */

const { response } = require('express');
const notificacionModel = require('../models/notificacionModel');

/**
 * OBTENER NOTIFICACIONES DEL USUARIO
 */
const obtenerNotificaciones = async (req, res = response) => {
    const uid = req.uid; // Usuario autenticado
    const { leida, limit = 20 } = req.query; // Parámetros opcionales

    try {
        // Construir filtro base
        const filtro = { usuario_id: uid };

        // Si se especifica el estado de lectura, agregarlo al filtro
        if (leida !== undefined) {
            filtro.leida = leida === 'true'; // Convertir string a boolean
        }

        // Obtener notificaciones con populate de tarea (si existe)
        const notificaciones = await notificacionModel.find(filtro)
            .populate('tarea_id', 'titulo estado') // Información básica de la tarea
            .sort({ fecha: -1 }) // Más recientes primero
            .limit(parseInt(limit)); // Limitar resultados

        // Contar notificaciones no leídas
        const noLeidas = await notificacionModel.countDocuments({
            usuario_id: uid,
            leida: false
        });

        res.json({
            ok: true,
            notificaciones,
            noLeidas,
            total: notificaciones.length
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las notificaciones'
        });
    }
};

/**
 * OBTENER NOTIFICACIONES NO LEÍDAS
 * 
 * Obtiene solo las notificaciones no leídas del usuario.
 * Útil para mostrar el contador en el navbar.
 */
const obtenerNotificacionesNoLeidas = async (req, res = response) => {
    const uid = req.uid;

    try {
        const notificaciones = await notificacionModel.find({
            usuario_id: uid,
            leida: false
        })
        .populate('tarea_id', 'titulo estado')
        .sort({ fecha: -1 })
        .limit(10); // Solo las 10 más recientes

        res.json({
            ok: true,
            notificaciones,
            total: notificaciones.length
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las notificaciones'
        });
    }
};

/**
 * MARCAR NOTIFICACIÓN COMO LEÍDA
 */
const marcarComoLeida = async (req, res = response) => {
    const notificacionId = req.params.id;
    const uid = req.uid;

    try {
        // Buscar la notificación
        const notificacion = await notificacionModel.findById(notificacionId);

        if (!notificacion) {
            return res.status(404).json({
                ok: false,
                msg: 'Notificación no encontrada'
            });
        }

        // Verificar que la notificación pertenece al usuario
        if (notificacion.usuario_id.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para modificar esta notificación'
            });
        }

        // Marcar como leída
        notificacion.leida = true;
        await notificacion.save();

        res.json({
            ok: true,
            notificacion,
            msg: 'Notificación marcada como leída'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al marcar la notificación'
        });
    }
};

/**
 * MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
 * 
 * Marca todas las notificaciones no leídas del usuario como leídas.
 */
const marcarTodasComoLeidas = async (req, res = response) => {
    const uid = req.uid;

    try {
        // Actualizar todas las notificaciones no leídas del usuario
        const resultado = await notificacionModel.updateMany(
            { 
                usuario_id: uid,
                leida: false 
            },
            { leida: true }
        );

        res.json({
            ok: true,
            msg: 'Todas las notificaciones marcadas como leídas',
            actualizadas: resultado.modifiedCount
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al marcar las notificaciones'
        });
    }
};

/**
 * ELIMINAR NOTIFICACIÓN
 * 
 * Elimina una notificación específica.
 * Solo el propietario puede eliminar sus notificaciones.
 */
const eliminarNotificacion = async (req, res = response) => {
    const notificacionId = req.params.id;
    const uid = req.uid;

    try {
        const notificacion = await notificacionModel.findById(notificacionId);

        if (!notificacion) {
            return res.status(404).json({
                ok: false,
                msg: 'Notificación no encontrada'
            });
        }

        // Verificar permisos
        if (notificacion.usuario_id.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para eliminar esta notificación'
            });
        }

        // Eliminar la notificación
        await notificacionModel.findByIdAndDelete(notificacionId);

        res.json({
            ok: true,
            msg: 'Notificación eliminada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la notificación'
        });
    }
};

/**
 * ELIMINAR TODAS LAS NOTIFICACIONES LEÍDAS
 * 
 * Elimina todas las notificaciones leídas del usuario.
 * Útil para limpiar el historial.
 */
const eliminarNotificacionesLeidas = async (req, res = response) => {
    const uid = req.uid;

    try {
        const resultado = await notificacionModel.deleteMany({
            usuario_id: uid,
            leida: true
        });

        res.json({
            ok: true,
            msg: 'Notificaciones leídas eliminadas',
            eliminadas: resultado.deletedCount
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar las notificaciones'
        });
    }
};

/**
 * OBTENER CONTADOR DE NOTIFICACIONES NO LEÍDAS
 * 
 * Endpoint ligero que solo devuelve el número de notificaciones no leídas.
 * Ideal para polling periódico sin cargar toda la data.
 */
const obtenerContadorNoLeidas = async (req, res = response) => {
    const uid = req.uid;

    try {
        const count = await notificacionModel.countDocuments({
            usuario_id: uid,
            leida: false
        });

        res.json({
            ok: true,
            noLeidas: count
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el contador'
        });
    }
};

/**
 * CREAR NOTIFICACIÓN (HELPER INTERNO)
 * 
 * Esta función es para uso interno del sistema.
 * Se puede llamar desde otros controladores para crear notificaciones.
 * 
 * NOTA: No se expone como endpoint público.
 */
const crearNotificacion = async (datos) => {
    try {
        const notificacion = new notificacionModel(datos);
        await notificacion.save();
        return { ok: true, notificacion };
    } catch (error) {
        console.log('Error al crear notificación:', error);
        return { ok: false, error };
    }
};

// Exportar todas las funciones
module.exports = {
    obtenerNotificaciones,
    obtenerNotificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarNotificacionesLeidas,
    obtenerContadorNoLeidas,
    crearNotificacion // Helper para uso interno
};
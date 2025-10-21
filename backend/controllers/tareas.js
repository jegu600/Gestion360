/**
 * CONTROLLER DE TAREAS
 * 
 * Este controlador maneja todas las operaciones CRUD para las tareas.
 * Cada función está protegida por el middleware de JWT, por lo que solo
 * usuarios autenticados pueden acceder.
 * 
 */

const { response } = require('express');
const tareaModel = require('../models/tareaModel');
const notificacionModel = require('../models/notificacionModel');

/**
 * OBTENER TODAS LAS TAREAS
 * 
 * Obtiene todas las tareas donde el usuario autenticado es:
 * - El responsable de la tarea
 * - El creador de la tarea
 * 
 * Además, popula la información del responsable para mostrar sus datos
 */
const obtenerTareas = async (req, res = response) => {
    const uid = req.uid; // ID del usuario autenticado (viene del middleware JWT)

    try {
        // Buscar tareas donde el usuario sea responsable O creador
        const tareas = await tareaModel.find({
            $or: [
                { responsable: uid },
                { creadoPor: uid }
            ]
        })
        .populate('responsable', 'nombre correo') // Traer datos del responsable
        .populate('creadoPor', 'nombre correo')   // Traer datos del creador
        .sort({ fechaCreacion: -1 }); // Ordenar por fecha (más recientes primero)

        res.json({
            ok: true,
            tareas
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las tareas, contacte al administrador'
        });
    }
};

/**
 * OBTENER TAREA POR ID
 * 
 * Obtiene una tarea específica por su ID.
 * Valida que el usuario tenga permiso para ver la tarea.
 */
const obtenerTareaPorId = async (req, res = response) => {
    const tareaId = req.params.id;
    const uid = req.uid;

    try {
        const tarea = await tareaModel.findById(tareaId)
            .populate('responsable', 'nombre correo')
            .populate('creadoPor', 'nombre correo');

        // Verificar que la tarea existe
        if (!tarea) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarea no encontrada'
            });
        }

        // Verificar que el usuario tenga permiso para ver esta tarea
        if (tarea.responsable._id.toString() !== uid && tarea.creadoPor._id.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para ver esta tarea'
            });
        }

        res.json({
            ok: true,
            tarea
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la tarea'
        });
    }
};

/**
 * CREAR NUEVA TAREA
 * 
 * Crea una nueva tarea y genera una notificación para el responsable
 * si es diferente del creador.
 */
const crearTarea = async (req, res = response) => {
    const uid = req.uid; // Usuario que crea la tarea

    try {
        // Crear instancia del modelo con los datos del body
        const tarea = new tareaModel({
            ...req.body,
            creadoPor: uid // Asignar el creador
        });

        // Guardar en la base de datos
        const tareaGuardada = await tarea.save();

        // Popular los datos para la respuesta
        await tareaGuardada.populate('responsable', 'nombre correo');
        await tareaGuardada.populate('creadoPor', 'nombre correo');

        // Crear notificación para el responsable (si no es el mismo que creó la tarea)
        if (tareaGuardada.responsable._id.toString() !== uid) {
            const notificacion = new notificacionModel({
                mensaje: `Se te ha asignado una nueva tarea: "${tareaGuardada.titulo}"`,
                usuario_id: tareaGuardada.responsable._id,
                tarea_id: tareaGuardada._id,
                tipo: 'tarea_asignada',
                prioridad: tareaGuardada.prioridad === 'Urgente' ? 'alta' : 'media'
            });

            await notificacion.save();
        }

        res.status(201).json({
            ok: true,
            tarea: tareaGuardada,
            msg: 'Tarea creada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la tarea'
        });
    }
};

/**
 * ACTUALIZAR TAREA
 * 
 * Actualiza una tarea existente.
 * Solo el creador o el responsable pueden actualizar la tarea.
 */
const actualizarTarea = async (req, res = response) => {
    const tareaId = req.params.id;
    const uid = req.uid;

    try {
        // Verificar que la tarea existe
        const tarea = await tareaModel.findById(tareaId);

        if (!tarea) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarea no encontrada'
            });
        }

        // Verificar permisos (solo creador o responsable pueden actualizar)
        if (tarea.creadoPor.toString() !== uid && tarea.responsable.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para actualizar esta tarea'
            });
        }

        // Guardar el estado anterior para detectar cambios
        const estadoAnterior = tarea.estado;
        const responsableAnterior = tarea.responsable.toString();

        // Actualizar la tarea
        const tareaActualizada = await tareaModel.findByIdAndUpdate(
            tareaId,
            req.body,
            { new: true } // Retorna el documento actualizado
        )
        .populate('responsable', 'nombre correo')
        .populate('creadoPor', 'nombre correo');

        // Crear notificación si cambió el estado
        if (estadoAnterior !== tareaActualizada.estado) {
            // Notificar al creador si el responsable cambió el estado
            const usuarioANotificar = tareaActualizada.creadoPor._id.toString() === uid 
                ? tareaActualizada.responsable._id 
                : tareaActualizada.creadoPor._id;

            const notificacion = new notificacionModel({
                mensaje: `La tarea "${tareaActualizada.titulo}" cambió a estado: ${tareaActualizada.estado}`,
                usuario_id: usuarioANotificar,
                tarea_id: tareaActualizada._id,
                tipo: 'tarea_actualizada',
                prioridad: 'media'
            });

            await notificacion.save();
        }

        // Notificar si cambió el responsable
        if (responsableAnterior !== tareaActualizada.responsable._id.toString()) {
            const notificacion = new notificacionModel({
                mensaje: `Se te ha asignado la tarea: "${tareaActualizada.titulo}"`,
                usuario_id: tareaActualizada.responsable._id,
                tarea_id: tareaActualizada._id,
                tipo: 'tarea_asignada',
                prioridad: 'alta'
            });

            await notificacion.save();
        }

        res.json({
            ok: true,
            tarea: tareaActualizada,
            msg: 'Tarea actualizada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la tarea'
        });
    }
};

/**
 * CAMBIAR ESTADO DE TAREA
 * 
 * Endpoint específico para cambiar solo el estado de una tarea.
 * Más rápido que actualizar toda la tarea.
 */
const cambiarEstadoTarea = async (req, res = response) => {
    const tareaId = req.params.id;
    const { estado } = req.body;
    const uid = req.uid;

    try {
        const tarea = await tareaModel.findById(tareaId);

        if (!tarea) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarea no encontrada'
            });
        }

        // Verificar permisos
        if (tarea.creadoPor.toString() !== uid && tarea.responsable.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para cambiar el estado de esta tarea'
            });
        }

        // Actualizar solo el estado
        tarea.estado = estado;
        await tarea.save();

        await tarea.populate('responsable', 'nombre correo');
        await tarea.populate('creadoPor', 'nombre correo');

        // Crear notificación
        const usuarioANotificar = tarea.creadoPor._id.toString() === uid 
            ? tarea.responsable._id 
            : tarea.creadoPor._id;

        const notificacion = new notificacionModel({
            mensaje: `La tarea "${tarea.titulo}" cambió a: ${estado}`,
            usuario_id: usuarioANotificar,
            tarea_id: tarea._id,
            tipo: estado === 'Completada' ? 'tarea_completada' : 'tarea_actualizada',
            prioridad: 'media'
        });

        await notificacion.save();

        res.json({
            ok: true,
            tarea,
            msg: 'Estado actualizado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el estado'
        });
    }
};

/**
 * ELIMINAR TAREA
 * 
 * Elimina una tarea de la base de datos.
 * Solo el creador puede eliminar la tarea.
 */
const eliminarTarea = async (req, res = response) => {
    const tareaId = req.params.id;
    const uid = req.uid;

    try {
        const tarea = await tareaModel.findById(tareaId);

        if (!tarea) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarea no encontrada'
            });
        }

        // Solo el creador puede eliminar
        if (tarea.creadoPor.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'Solo el creador puede eliminar esta tarea'
            });
        }

        // Eliminar la tarea
        await tareaModel.findByIdAndDelete(tareaId);

        // Eliminar notificaciones asociadas a esta tarea
        await notificacionModel.deleteMany({ tarea_id: tareaId });

        res.json({
            ok: true,
            msg: 'Tarea eliminada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la tarea'
        });
    }
};

/**
 * OBTENER TAREAS POR ESTADO
 * 
 * Filtra las tareas del usuario por un estado específico
 */
const obtenerTareasPorEstado = async (req, res = response) => {
    const { estado } = req.params;
    const uid = req.uid;

    try {
        const tareas = await tareaModel.find({
            $and: [
                {
                    $or: [
                        { responsable: uid },
                        { creadoPor: uid }
                    ]
                },
                { estado: estado }
            ]
        })
        .populate('responsable', 'nombre correo')
        .populate('creadoPor', 'nombre correo')
        .sort({ fechaCreacion: -1 });

        res.json({
            ok: true,
            tareas,
            total: tareas.length
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las tareas'
        });
    }
};

// Exportar todas las funciones
module.exports = {
    obtenerTareas,
    obtenerTareaPorId,
    crearTarea,
    actualizarTarea,
    cambiarEstadoTarea,
    eliminarTarea,
    obtenerTareasPorEstado
};
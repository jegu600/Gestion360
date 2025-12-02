/**
 * CONTROLLER DE TAREAS
 */

const Tarea = require('../models/tareaModel');
const Usuario = require('../models/usuarioModel');
const { crearNotificacion } = require('./notificaciones');

/**
 * OBTENER TODAS LAS TAREAS DEL USUARIO
 */
const obtenerTareas = async (req, res) => {
  try {


    // Si es admin, ve todas las tareas. Si es usuario, solo las asignadas.
    let query = {};
    if (req.usuario.rol !== 'admin') {
      query = { responsable: req.usuario._id };
    }

    const tareas = await Tarea.find(query)
      .populate('responsable', 'nombre correo rol')
      .sort({ fechaCreacion: -1 });

    res.status(200).json({
      ok: true,
      tareas,
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener tareas',
      error: error.message,
    });
  }
};

/**
 * OBTENER TAREA POR ID
 */
const obtenerTareaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const tarea = await Tarea.findById(id).populate('responsable', 'nombre correo rol');

    if (!tarea) {
      return res.status(404).json({
        ok: false,
        msg: 'Tarea no encontrada',
      });
    }

    if (tarea.responsable._id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permiso para ver esta tarea',
      });
    }

    res.status(200).json({
      ok: true,
      tarea,
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener tarea',
    });
  }
};

/**
 * OBTENER TAREAS POR ESTADO
 */
const obtenerTareasPorEstado = async (req, res) => {
  const { estado } = req.params;

  const estadosValidos = ['Pendiente', 'En_progreso', 'Completada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      ok: false,
      msg: `Estado inválido. Debe ser: ${estadosValidos.join(', ')}`,
    });
  }

  try {
    const tareas = await Tarea.find({
      responsable: req.usuario._id,
      estado,
    })
      .populate('responsable', 'nombre correo rol')
      .sort({ fechaCreacion: -1 });

    res.status(200).json({
      ok: true,
      tareas,
    });
  } catch (error) {
    console.error('Error al obtener tareas por estado:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener tareas',
    });
  }
};

/**
 * CREAR NUEVA TAREA
 */
const crearTarea = async (req, res) => {
  const { titulo, descripcion, fechaLimite, responsable, prioridad } = req.body;

  try {
    console.log('📝 Creando tarea con datos:', { titulo, descripcion, fechaLimite, responsable, prioridad });

    let responsableId;

    if (!responsable || responsable.trim() === '') {
      responsableId = req.usuario._id;
      console.log('✅ Asignando al usuario autenticado:', responsableId);
    } else {
      const usuarioExiste = await Usuario.findById(responsable);

      if (!usuarioExiste) {
        return res.status(404).json({
          ok: false,
          msg: 'El usuario responsable no existe',
        });
      }

      responsableId = responsable;
      console.log('✅ Asignando al usuario especificado:', responsableId);
    }

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      fechaLimite: fechaLimite || undefined,
      responsable: responsableId,
      prioridad: prioridad || 'Media',
    });

    const tareaGuardada = await nuevaTarea.save();
    console.log('✅ Tarea guardada en BD:', tareaGuardada._id);

    await tareaGuardada.populate('responsable', 'nombre correo rol');

    // Crear notificación para el responsable (si no es el mismo que la creó)
    if (responsableId.toString() !== req.usuario._id.toString()) {
      await crearNotificacion({
        mensaje: `Se te ha asignado una nueva tarea: "${titulo}"`,
        usuario_id: responsableId,
        tarea_id: tareaGuardada._id,
        tipo: 'tarea_asignada',
        prioridad: prioridad === 'Urgente' || prioridad === 'Alta' ? 'alta' : 'media',
      });
    }

    res.status(201).json({
      ok: true,
      msg: 'Tarea creada exitosamente',
      tarea: tareaGuardada,
    });
  } catch (error) {
    console.error('❌ Error al crear tarea:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear tarea',
      error: error.message,
    });
  }
};

/**
 * ACTUALIZAR TAREA COMPLETA
 */
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, fechaLimite, responsable, prioridad } = req.body;

  try {
    const tarea = await Tarea.findById(id);

    if (!tarea) {
      return res.status(404).json({
        ok: false,
        msg: 'Tarea no encontrada',
      });
    }

    // Verificar permisos: admin puede actualizar cualquier tarea, usuario solo las suyas
    const isAdmin = req.usuario.rol === 'admin';
    const isAssigned = tarea.responsable.toString() === req.usuario._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permiso para actualizar esta tarea',
      });
    }

    if (responsable && responsable !== tarea.responsable.toString()) {
      const usuarioExiste = await Usuario.findById(responsable);
      if (!usuarioExiste) {
        return res.status(404).json({
          ok: false,
          msg: 'El usuario responsable no existe',
        });
      }
    }

    const datosActualizados = {
      titulo: titulo || tarea.titulo,
      descripcion: descripcion || tarea.descripcion,
      estado: estado || tarea.estado,
      fechaLimite: fechaLimite || tarea.fechaLimite,
      responsable: responsable || tarea.responsable,
      prioridad: prioridad || tarea.prioridad,
    };

    const tareaActualizada = await Tarea.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    ).populate('responsable', 'nombre correo rol');

    // Crear notificación si se cambió el responsable
    if (responsable && responsable !== tarea.responsable.toString()) {
      await crearNotificacion({
        mensaje: `Se te ha asignado la tarea: "${tareaActualizada.titulo}"`,
        usuario_id: responsable,
        tarea_id: tareaActualizada._id,
        tipo: 'tarea_asignada',
        prioridad: tareaActualizada.prioridad === 'Urgente' || tareaActualizada.prioridad === 'Alta' ? 'alta' : 'media',
      });
    }

    // Notificar al responsable sobre la actualización (si no fue quien la actualizó)
    if (tareaActualizada.responsable._id.toString() !== req.usuario._id.toString()) {
      await crearNotificacion({
        mensaje: `La tarea "${tareaActualizada.titulo}" ha sido actualizada`,
        usuario_id: tareaActualizada.responsable._id,
        tarea_id: tareaActualizada._id,
        tipo: 'tarea_actualizada',
        prioridad: 'media',
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'Tarea actualizada exitosamente',
      tarea: tareaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar tarea',
    });
  }
};

/**
 * CAMBIAR ESTADO DE TAREA
 */
const cambiarEstadoTarea = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['Pendiente', 'En_progreso', 'Completada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      ok: false,
      msg: `Estado inválido. Debe ser: ${estadosValidos.join(', ')}`,
    });
  }

  try {
    const tarea = await Tarea.findById(id);

    if (!tarea) {
      return res.status(404).json({
        ok: false,
        msg: 'Tarea no encontrada',
      });
    }

    // Verificar permisos: admin puede cambiar cualquier tarea, usuario solo las suyas
    const isAdmin = req.usuario.rol === 'admin';
    const isAssigned = tarea.responsable.toString() === req.usuario._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permiso para modificar esta tarea',
      });
    }

    const estadoAnterior = tarea.estado;
    tarea.estado = estado;
    const tareaActualizada = await tarea.save();
    await tareaActualizada.populate('responsable', 'nombre correo rol');

    // Crear notificación si se completó la tarea y no fue el responsable quien la completó
    if (estado === 'Completada' && estadoAnterior !== 'Completada') {
      // Notificar al responsable (si no fue él quien la completó)
      if (tareaActualizada.responsable._id.toString() !== req.usuario._id.toString()) {
        await crearNotificacion({
          mensaje: `La tarea "${tareaActualizada.titulo}" ha sido marcada como completada`,
          usuario_id: tareaActualizada.responsable._id,
          tarea_id: tareaActualizada._id,
          tipo: 'tarea_completada',
          prioridad: 'media',
        });
      }
    } else if (estadoAnterior !== estado) {
      // Notificar cambio de estado (si no fue el responsable)
      if (tareaActualizada.responsable._id.toString() !== req.usuario._id.toString()) {
        await crearNotificacion({
          mensaje: `El estado de la tarea "${tareaActualizada.titulo}" cambió a ${estado.replace('_', ' ')}`,
          usuario_id: tareaActualizada.responsable._id,
          tarea_id: tareaActualizada._id,
          tipo: 'tarea_actualizada',
          prioridad: 'media',
        });
      }
    }

    res.status(200).json({
      ok: true,
      msg: 'Estado actualizado exitosamente',
      tarea: tareaActualizada,
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al cambiar estado',
    });
  }
};

/**
 * ELIMINAR TAREA
 */
const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  try {
    const tarea = await Tarea.findById(id);

    if (!tarea) {
      return res.status(404).json({
        ok: false,
        msg: 'Tarea no encontrada',
      });
    }

    // Verificar permisos: admin puede eliminar cualquier tarea, usuario solo las suyas
    const isAdmin = req.usuario.rol === 'admin';
    const isAssigned = tarea.responsable.toString() === req.usuario._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permiso para eliminar esta tarea',
      });
    }

    await Tarea.findByIdAndDelete(id);

    res.status(200).json({
      ok: true,
      msg: 'Tarea eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al eliminar tarea',
    });
  }
};

module.exports = {
  obtenerTareas,
  obtenerTareaPorId,
  obtenerTareasPorEstado,
  crearTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  eliminarTarea,
};
/**
 * MODELO DE NOTIFICACIONES
 * 
 * este modelo representa las notificaciones del sistema.
 * cada notificación esta asociada a un usuario y opcionalmente a una tarea.
 * 
 * modelo basandose en la estructura de MongoDB
 */

const { Schema, model } = require('mongoose');

const notificacionSchema = Schema({
    // mensaje de la notificacion
    mensaje: {
        type: String,
        required: true,
        trim: true,
    },

    // fecha de creación de la notificacion
    fecha: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // usuario destinatario de la notificacion (referencia a usuarios)
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: 'usuarioModel',
        required: true,
    },

    // tarea relacionada con la notificacion 
    tarea_id: {
        type: Schema.Types.ObjectId,
        ref: 'tareaModel',
        required: false, // no todas las notificaciones estan relacionadas con tareas
    },

    // estado de la notificacion (leida o no leida)
    leida: {
        type: Boolean,
        default: false,
    },

    // tipo de notificacion
    tipo: {
        type: String,
        enum: [
            'tarea_asignada',      // Se asigno una nueva tarea
            'tarea_actualizada',   // Se actualizo una tarea
            'tarea_completada',    // Se completo una tarea
            'tarea_vencida',       // una tarea vencio
            'recordatorio',        // recordatorio de fecha limite proxima
            'sistema',             // notificacion del sistema
            'comentario'           // nuevo comentario en tarea
        ],
        default: 'sistema',
    },

    // prioridad de la notificación
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media',
    },

}, {
    collection: "notificaciones", // nombre de la colección en MongoDB
    timestamps: true, // Agrega automaticamente createdAt y updatedAt
});

// indice compuesto para mejorar consultas
notificacionSchema.index({ usuario_id: 1, fecha: -1 });
notificacionSchema.index({ usuario_id: 1, leida: 1 });

// metodo para formatear la respuesta JSON
notificacionSchema.methods.toJSON = function() {
    const { __v, _id, ...notificacion } = this.toObject();
    notificacion.id = _id;
    return notificacion;
}

module.exports = model('notificacionModel', notificacionSchema);
/**
 * MODELO DE TAREAS (EVENTOS)
 */

const { Schema, model } = require('mongoose');

const tareaSchema = Schema({
    // Titulo de la tarea
    titulo: {
        type: String,
        required: true, // CORRECCIÓN: era "require"
        trim: true, // Elimina espacios en blanco
    },

    // Descripción detallada de la tarea
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },

    // Estado actual de la tarea
    estado: {
        type: String,
        required: true,
        enum: ['Pendiente', 'En_progreso', 'Completada', 'Cancelada'], // Estados permitidos
        default: 'Pendiente',
    },

    // Fecha de creación de la tarea
    fechaCreacion: {
        type: Date,
        required: true,
        default: Date.now, // Se asigna automaticamente
    },

    // Fecha limite para completar la tarea
    fechaLimite: {
        type: Date,
        required: true,
    },

    // Usuario responsable de la tarea (referencia a la colección usuarios)
    responsable: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario', // IMPORTANTE: Debe coincidir con el nombre del modelo de usuario
        required: true,
    },

    // Usuario que creó la tarea (opcional, para auditoria)
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false,
    },

    // Prioridad de la tarea (opcional)
    prioridad: {
        type: String,
        enum: ['Baja', 'Media', 'Alta', 'Urgente'],
        default: 'Media',
    },

}, {
    collection: "tareas", // Nombre de la colección en MongoDB
    timestamps: true, // Agrega automaticamente createdAt y updatedAt
});

// Metodo para popular (llenar) información del responsable
tareaSchema.methods.toJSON = function () {
    const { __v, _id, ...tarea } = this.toObject();
    tarea.id = _id;
    return tarea;
}

module.exports = model('tareaModel', tareaSchema);
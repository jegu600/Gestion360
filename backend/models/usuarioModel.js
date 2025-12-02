const { Schema, model } = require('mongoose');

const usuarioSchema = Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // convierte a minusculas
        trim: true,//elimina espacios
        // validación basica de formato email
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    },

    password: {
        type: String,
        required: true,
        minlength: 8, // mínimo 8 caracteres

    },

    rol: {
        type: String,
        required: true,
        enum: ['admin', 'usuario'], // solo permite estos valores
        default: 'usuario'
    },


}, {
    collection: "usuarios",
    timestamps: true // agrega createdAt y updatedAt automáticamente
});

usuarioSchema.method('toJSON', function () {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
});



module.exports = model('Usuario', usuarioSchema);

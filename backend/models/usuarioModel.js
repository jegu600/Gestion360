const { Schema, model } = require('mongoose');

const usuarioSchema = Schema({
    nombre: {
        type: String,
        require: true,
    },

    correo: {
        type: String,
        require: true,
        unique: true,
    },

    password: {
        type: String,
        require: true,

    },

    rol: {
        type: String,
        require: true,
    }

}, {
    collection: "usuarios"
});

module.exports = model('usuarioModel', usuarioSchema);
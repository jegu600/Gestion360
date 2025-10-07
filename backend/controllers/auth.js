// se requiere para traer la ayuda de codigo- NO ES INDISPENSABLE
const { response } = require('express');
const usuarioModel = require('../models/usuarioModel');



// la funcion de divide en: ( lo que solicita el usuario, lo que respondemos ) =>{ estrutura };


// funcion para ir a regisgrar usuario login
const crearUsuario = async (req, res = response) => {

    const usuario = usuarioModel(req.body);
    await usuario.save();

    // recuperacion de varibles por desestruturacion
    // const { email, nombre, password, rol } = req.body;

    // Respuesta valida
    res.status(201).json({
        ok: true,
        msg: 'registrar',
    });
}

// funcion ir al login
const loginUsuario = (req, res = response) => {

    // manejo de errores

    // recuperacion de varibles por desestruturacion
    const { email, password } = req.body;

    res.status(201).json({
        ok: true,
        msg: 'login',
        email,
        password,
    });
}


const renovarToken = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'renovarToken'
    });
}


// exportar funciones
module.exports = {
    loginUsuario,
    crearUsuario,
    renovarToken,
} 
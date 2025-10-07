// se requiere para traer la ayuda de codigo- NO ES INDISPENSABLE
const { response } = require('express');

// importaciones
const usuarioModel = require('../models/usuarioModel');
const bcryptjs = require('bcryptjs');


// la funcion de divide en: ( lo que solicita el usuario, lo que respondemos ) =>{ estrutura };


// funcion para ir a regisgrar usuario login
const crearUsuario = async (req, res = response) => {

    const { correo, password } = req.body;


    try {

        let usuario = await usuarioModel.findOne({ correo: correo })

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya esta en uso'
            })
        }


        usuario = usuarioModel(req.body);

        //Encriptar contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        // almacenar en base de datos
        await usuario.save();

        // Respuesta valida
        res.status(201).json({
            ok: true,
            uid: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
        });
    } catch (error) {
        // Respuesta invalida
        console.log(error);
        res.status(500).json({

            ok: false,
            msg: 'Comuniquese con el administrador'
        });

    }

}

// funcion ir al login
const loginUsuario = (req, res = response) => {
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
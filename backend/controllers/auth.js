// se requiere para traer la ayuda de codigo- NO ES INDISPENSABLE
const { response } = require('express');

// importaciones
const usuarioModel = require('../models/usuarioModel');
const bcryptjs = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

// la funcion de divide en: ( lo que solicita el usuario, lo que respondemos ) =>{ estrutura };


// funcion para ir a regisgrar usuario login
const crearUsuario = async (req, res = response) => {

    const { correo, password } = req.body;

    try { // Respuesta valida

        let usuario = await usuarioModel.findOne({ correo: correo });
        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya esta en uso'
            })
        }

        //se utilza el modelo para la insercion en base de datos
        usuario = usuarioModel(req.body);

        //Encriptar contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        // almacenar en base de datos
        await usuario.save();

        // Generacion de JSON WEB TOKEN
        // const token = 
        const token = await generarJWT(usuario.id, usuario.nombre);

        // respuesta del servidor
        res.status(201).json({
            ok: true,
            uid: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            token
        });


    } catch (error) { // Respuesta invalida
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error, comuniquese con el administrador'
        });

    };

}

// funcion ir al login
const loginUsuario = async (req, res = response) => {
    // recuperacion de varibles por desestruturacion
    const { correo, password } = req.body;


    try { // respuesta valida
        const usuario = await usuarioModel.findOne({ correo: correo });

        // validacion si el usuario existe
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        // validar la contraseña
        const validarContrasena = bcryptjs.compareSync(password, usuario.password);
        if (!validarContrasena) {
            res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }

        // Generacion de JSON WEB TOKEN
        const token = await generarJWT(usuario.id, usuario.nombre);

        // respuesta del servidor
        res.json({
            ok: true,
            uid: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            token: token
        });

    } catch (error) { // respuesta valida
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error, comuniquese con el administrador'
        });
        res.json({
       ok: true,
       token,
       uid,    
       nombre, 
   });
    }

}


const renovarToken = async (req, res = response) => {

    const { uid, nombre } = req;

    // Generacion de JSON WEB TOKEN
    const token = await generarJWT(uid, nombre);

    res.json({
        ok: true,
        token,
    });
}


// exportar funciones
module.exports = {
    loginUsuario,
    crearUsuario,
    renovarToken,
} 
const { response } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const validarJWT = async (req, res = response, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'El usuario no está autenticado'
        });
    }

    try {
        const { uid } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        // Leer el usuario que corresponde al uid
        const usuario = await Usuario.findById(uid);

        if (!usuario) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido - usuario no existe en DB'
            });
        }

        req.usuario = usuario;
        req.uid = uid;

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }

    next();
};

module.exports = {
    validarJWT
};
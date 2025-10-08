const { response } = require('express');
const jwt = require('jsonwebtoken');


const validarJsonWT = (req, res = response, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'El usuario no esta autenticado'
        })
    }
    // console.log(token);
    try {

        const { uid, nombre } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        req.uid = uid;
        req.nombre = nombre;


    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no valido'
        })
    }



    next();

}





module.exports = {
    validarJsonWT,
}
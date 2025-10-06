// se instacia express
// traer expres
const { Router } = require('express');
// traer la funcion Router de express
const router = Router();
// se encarga de validar los campos
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');


// desestrurar funciones de acciones
const { renovarToken, loginUsuario, crearUsuario } = require('../controllers/auth');

// invocar los metodos (get, post, delete), y llamar las fuciones de 
// acciones para completar los empoints

// definir los enpoint

// enpoint para registrar usuario
router.post(
    '/register',
    [ // se crean los middlewares
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password debe tener minimo 8 caracteres').isLength({ min: 8 }),
        validarCampos,
    ],
    crearUsuario,
);

// enpoint para acceder a la app
router.post(
    '/',
    [ // se crean los middlewares
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password debe tener minimo 8 caracteres').isLength({ min: 8 }),
        validarCampos,
    ],
    loginUsuario,
);

// enpoint para renovar Token
router.get('/renew', renovarToken);


// exportar 
module.exports = router;
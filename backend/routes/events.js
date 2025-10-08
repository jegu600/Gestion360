const { Router } = require('express');
// traer la funcion Router de express
const router = Router();

const { validarJsonWT } = require('../middlewares/validarJWT');


const { obtenerEvento, crearEvento, actualizarEvento, eliminarEvento } = require('../controllers/events');
router.get('/', obtenerEvento);

router.use(validarJsonWT);

router.get('/', obtenerEvento);
router.post('/', crearEvento);
router.put('/:id', actualizarEvento);
router.delete('/:id', eliminarEvento);


module.exports = router;






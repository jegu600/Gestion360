const { response } = require('express');


const obtenerEvento = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'obtener evento'
    })
}

const crearEvento = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'crear evento'
    })
}

const actualizarEvento = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'actulizar evento'
    })
}


const eliminarEvento = (req, res = response) => {
    res.json({
        ok: true,
        msg: 'eliminar evento'
    })
}


module.exports = {
    obtenerEvento,
    crearEvento,
    actualizarEvento,
    eliminarEvento
}


const Usuario = require('../models/usuarioModel');

/**
 * OBTENER TODOS LOS USUARIOS
 */
const obtenerUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios, excluyendo el password
    const usuarios = await Usuario.find()
      .select('-password') // Excluir contraseña
      .sort({ nombre: 1 }); // Ordenar por nombre alfabéticamente

    res.status(200).json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener usuarios',
    });
  }
};

/**
 * OBTENER USUARIO POR ID
 */
const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar usuario por ID, excluyendo password
    const usuario = await Usuario.findById(id).select('-password');

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener usuario',
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
};
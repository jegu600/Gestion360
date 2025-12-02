/**
 * SERVIDOR PRINCIPAL - EXPRESS
 * 
 * Punto de entrada del backend.
 * Configura Express, middlewares, rutas y conexión a MongoDB.
 * 
 * CAMBIOS:
 * - Corregido typo: dovEnv → dotenv
 * - Agregada ruta de tareas (reemplaza events)
 * - Agregada ruta de notificaciones
 * - Agregado manejo de errores global
 * - Agregados comentarios detallados
 */

// se instacia express
const express = require('express');

// dotenv se utiliza para reconcer y utulizar las variables de entorno
const dotenv = require('dotenv');

// importar cors para permitir peticiones desde el frontend
const cors = require('cors')

// importar conexion a la base de datos
const { dbConnetion } = require('./database/config');
dotenv.config();

// conexion a la base de datos
dbConnetion();

// Crear el servidor de express
const app = express();

// importar cors, sirve para controlar quien consume las API
// app.use(cors());
app.use(cors())


//llamar el directorio(carpeta)=>PUBLIC 
app.use(express.static('public'));

// lectura y parseo del body
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));

// Cambio: se remplazo /api/events por /api/tareas
// rutas para gestión de tareas (CRUD completo)
app.use('/api/tareas', require('./routes/tareas'));

// rutas para gestión de notificaciones
app.use('/api/notificaciones', require('./routes/notificaciones'));


// Ruta de usuarios
app.use('/api/usuarios', require('./routes/usuarios'));

// Excuchar peticiones
// listen(puerto, funcion que retorna cuando esta arriba)
app.listen(process.env.PORT, () => { console.log(`esta arriba express, en el puerto ${process.env.PORT}`) })

/**
 * RUTA POR DEFECTO (404)
 * 
 * Si ninguna ruta coincide, retornar error 404
 */
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        msg: 'Ruta no encontrada'
    });
});

/**
 * MANEJO DE ERRORES GLOBAL
 * 
 * Captura cualquier error no manejado en la aplicación
 * y retorna una respuesta JSON consistente
 */
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    
    res.status(err.status || 500).json({
        ok: false,
        msg: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
});

/**
 * INICIAR SERVIDOR
 * 
 * El servidor escucha en el puerto definido en .env
 * Por defecto: 4000
 */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});
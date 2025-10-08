
// se instacia express
const express = require('express');

// dotenv se utiliza para reconcer y utulizar las variables de entorno
const dovEnv = require('dotenv');

// importar cors
const cors = require('cors')

// importar conexion a la base de datos
const { dbConnetion } = require('./database/config');
dovEnv.config();

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
app.use('/api/events', require('./routes/events'));




// Excuchar peticiones
// listen(puerto, funcion que retorna cuando esta arriba)
app.listen(process.env.PORT, () => { console.log(`esta arriba express, en el puerto ${process.env.PORT}`) })

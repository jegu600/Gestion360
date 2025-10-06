
// se instacia express
const express = require('express');

// dotenv se utiliza para reconcer y utulizar las variables de entorno
const dovEnv = require('dotenv');
dovEnv.config();

// Crear el servidor de express
const app = express();

//llamar el directorio(carpeta)=>PUBLIC 
app.use(express.static('public'));

// lectura y parseo del body
app.use(express.json());

// Rutas
//TODO: crear rutas para de auth, para: crear, login, renovacion del token
app.use('/api/auth', require('./routes/auth'));
//TODO: CRUD usuario, para: crear, editar, eliminar, 



// Excuchar peticiones
// listen(puerto, funcion que retorna cuando esta arriba)
app.listen(process.env.PORT, () => { console.log(`esta arriba express, en el puerto ${process.env.PORT}`) })

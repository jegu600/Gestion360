const mongoose = require('mongoose');


const dbConnetion = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.DB_CDN);
        console.log('Conectado a la base de datos')
    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la base de datos');
    }
};

module.exports = {
    dbConnetion,
}
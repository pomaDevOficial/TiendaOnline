import { Sequelize } from 'sequelize';
import 'dotenv/config' ; 
// Cargar variables de entorno desde el archivo .env

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    //port: 3000// Opcional, solo si necesitas especificar el puerto
});

export default sequelize;
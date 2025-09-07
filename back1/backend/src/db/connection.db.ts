import { Sequelize } from 'sequelize';
import 'dotenv/config' ; 
// Cargar variables de entorno desde el archivo .env

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST || '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
});

export default sequelize;
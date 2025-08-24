"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Persona extends sequelize_1.Model {
}
Persona.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idtipopersona: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    nombres: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    apellidos: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idtipoidentidad: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    nroidentidad: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    correo: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    telefono: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "persona", timestamps: false });
// Relaciones
Persona.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Persona;

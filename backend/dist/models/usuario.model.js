"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const rol_model_1 = __importDefault(require("./rol.model"));
const persona_model_1 = __importDefault(require("./persona.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Usuario extends sequelize_1.Model {
}
Usuario.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idrol: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idpersona: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    usuario: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    contrasenia: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "usuario", timestamps: false });
// Relaciones
Usuario.belongsTo(rol_model_1.default, { foreignKey: 'idrol', as: 'Rol' });
Usuario.belongsTo(persona_model_1.default, { foreignKey: 'idpersona', as: 'Persona' });
Usuario.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Usuario;

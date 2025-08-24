"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const estado_model_1 = __importDefault(require("./estado.model"));
class MetodoPago extends sequelize_1.Model {
}
MetodoPago.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: connection_db_1.default, tableName: "metodo_pago", timestamps: false });
// Relaciones
MetodoPago.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = MetodoPago;

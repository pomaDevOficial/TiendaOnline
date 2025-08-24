"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const estado_model_1 = __importDefault(require("./estado.model"));
class TipoSerie extends sequelize_1.Model {
}
TipoSerie.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "tiposerie", timestamps: false });
// Relaciones
TipoSerie.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = TipoSerie;

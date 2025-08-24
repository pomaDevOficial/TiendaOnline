"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const producto_model_1 = __importDefault(require("./producto.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Lote extends sequelize_1.Model {
}
Lote.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idproducto: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    cantidad: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    preciocompra: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    precioventa: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    imagen: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    genero: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    fechaingreso: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "lote", timestamps: false });
// Relaciones
Lote.belongsTo(producto_model_1.default, { foreignKey: 'idproducto', as: 'Producto' });
Lote.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Lote;

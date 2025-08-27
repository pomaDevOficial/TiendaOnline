"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ==================== MODELO PRODUCTO ====================
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const categoria_model_1 = __importDefault(require("./categoria.model"));
const marca_model_1 = __importDefault(require("./marca.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Producto extends sequelize_1.Model {
}
Producto.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    imagen: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idcategoria: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idmarca: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "producto", timestamps: false });
// Relaciones
Producto.belongsTo(categoria_model_1.default, { foreignKey: 'idcategoria', as: 'Categoria' });
Producto.belongsTo(marca_model_1.default, { foreignKey: 'idmarca', as: 'Marca' });
Producto.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Producto;

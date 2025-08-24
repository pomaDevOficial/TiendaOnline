"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const usuario_model_1 = __importDefault(require("./usuario.model"));
const pedido_model_1 = __importDefault(require("./pedido.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Venta extends sequelize_1.Model {
}
Venta.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fechaventa: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    idusuario: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idpedido: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "venta", timestamps: false });
// Relaciones
Venta.belongsTo(usuario_model_1.default, { foreignKey: 'idusuario', as: 'Usuario' });
Venta.belongsTo(pedido_model_1.default, { foreignKey: 'idpedido', as: 'Pedido' });
Venta.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Venta;

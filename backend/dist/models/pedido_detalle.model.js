"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const pedido_model_1 = __importDefault(require("./pedido.model"));
const lote_model_1 = __importDefault(require("./lote.model"));
class PedidoDetalle extends sequelize_1.Model {
}
PedidoDetalle.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpedido: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idlote: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    cantidad: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    precio: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    subtotal: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "pedido_detalle", timestamps: false });
// Relaciones
PedidoDetalle.belongsTo(pedido_model_1.default, { foreignKey: 'idpedido', as: 'Pedido' });
PedidoDetalle.belongsTo(lote_model_1.default, { foreignKey: 'idlote', as: 'Lote' });
exports.default = PedidoDetalle;

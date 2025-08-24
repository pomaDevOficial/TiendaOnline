"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const pedido_detalle_model_1 = __importDefault(require("./pedido_detalle.model"));
const venta_model_1 = __importDefault(require("./venta.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class DetalleVenta extends sequelize_1.Model {
}
DetalleVenta.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpedidodetalle: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idventa: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    precio_venta_real: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    subtotal_real: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "detalleventa", timestamps: false });
// Relaciones
DetalleVenta.belongsTo(pedido_detalle_model_1.default, { foreignKey: 'idpedidodetalle', as: 'PedidoDetalle' });
DetalleVenta.belongsTo(venta_model_1.default, { foreignKey: 'idventa', as: 'Venta' });
DetalleVenta.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = DetalleVenta;

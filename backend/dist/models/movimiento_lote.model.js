"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ==================== MODELO MOVIMIENTO_LOTE ====================
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const lote_talla_model_1 = __importDefault(require("./lote_talla.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class MovimientoLote extends sequelize_1.Model {
}
MovimientoLote.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idlote_talla: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    tipomovimiento: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    cantidad: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    fechamovimiento: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "movimientolote", timestamps: false });
// Relaciones
MovimientoLote.belongsTo(lote_talla_model_1.default, { foreignKey: 'idlote_talla', as: 'LoteTalla' });
MovimientoLote.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = MovimientoLote;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const venta_model_1 = __importDefault(require("./venta.model"));
const tipo_comprobante_model_1 = __importDefault(require("./tipo_comprobante.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Comprobante extends sequelize_1.Model {
}
Comprobante.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idventa: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    igv: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    descuento: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    total: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    idtipocomprobante: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    numserie: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "comprobante", timestamps: false });
// Relaciones
Comprobante.belongsTo(venta_model_1.default, { foreignKey: 'idventa', as: 'Venta' });
Comprobante.belongsTo(tipo_comprobante_model_1.default, { foreignKey: 'idtipocomprobante', as: 'TipoComprobante' });
Comprobante.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Comprobante;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const persona_model_1 = __importDefault(require("./persona.model"));
const metodo_pago_model_1 = __importDefault(require("./metodo_pago.model"));
const estado_model_1 = __importDefault(require("./estado.model"));
class Pedido extends sequelize_1.Model {
}
Pedido.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpersona: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    idmetodopago: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    fechaoperacion: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    idestado: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    totalimporte: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    adjunto: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    esWeb: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: connection_db_1.default, tableName: "pedido", timestamps: false });
// Relaciones
Pedido.belongsTo(persona_model_1.default, { foreignKey: 'idpersona', as: 'Persona' });
Pedido.belongsTo(metodo_pago_model_1.default, { foreignKey: 'idmetodopago', as: 'MetodoPago' });
Pedido.belongsTo(estado_model_1.default, { foreignKey: 'idestado', as: 'Estado' });
exports.default = Pedido;

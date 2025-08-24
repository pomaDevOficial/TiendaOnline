"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const lote_model_1 = __importDefault(require("./lote.model")); // Asegúrate de importar el modelo de lote
const MovimientoInventario = connection_db_1.default.define("MovimientoInventario", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Asegura que el id sea autoincrementable
        allowNull: false
    },
    id_lote: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: lote_model_1.default,
            key: 'id'
        }
    },
    tipo_movimiento: {
        type: sequelize_1.DataTypes.STRING(20), // VARCHAR(20)
        allowNull: false
    },
    cantidad: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2), // DECIMAL(10,2)
        allowNull: false
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE, // DATETIME
        allowNull: false
    }
}, {
    timestamps: false,
    modelName: "MovimientoInventario",
    tableName: "movimiento_inventario",
});
// Relaciones
MovimientoInventario.belongsTo(lote_model_1.default, { foreignKey: "id_lote", as: "Lote" });
exports.default = MovimientoInventario;

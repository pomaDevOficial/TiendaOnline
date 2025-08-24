"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const venta_model_1 = __importDefault(require("./venta.model"));
const lote_model_1 = __importDefault(require("./lote.model")); // Asegúrate de importar el modelo de lote
const DetalleVenta = connection_db_1.default.define("DetalleVenta", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Asegura que el id sea autoincrementable
        allowNull: false
    },
    id_venta: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: venta_model_1.default,
            key: 'id'
        }
    },
    id_lote: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: lote_model_1.default,
            key: 'id'
        }
    },
    cantidad: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2), // Cambié a DECIMAL para que coincida con la base de datos
        allowNull: false
    },
    precio_unitario: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true // Permitir null
    }
}, {
    timestamps: false,
    modelName: "DetalleVenta",
    tableName: "detalleventa",
});
// Relaciones
DetalleVenta.belongsTo(venta_model_1.default, { foreignKey: "id_venta", as: "Venta" });
DetalleVenta.belongsTo(lote_model_1.default, { foreignKey: "id_lote", as: "Lote" }); // Añadir relación con lote
exports.default = DetalleVenta;

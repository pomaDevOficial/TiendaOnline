"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const producto_model_1 = __importDefault(require("./producto.model"));
const Inventario = connection_db_1.default.define("Inventario", {
    id_producto: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    precio_compra: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    precio_venta: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    fecha_ingreso: {
        type: sequelize_1.DataTypes.DATE,
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    modelName: "Inventario",
    tableName: "inventario",
});
Inventario.belongsTo(producto_model_1.default, { foreignKey: "id_producto", as: "Producto" });
exports.default = Inventario;

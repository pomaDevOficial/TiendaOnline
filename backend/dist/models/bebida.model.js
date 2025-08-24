"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const Bebida = connection_db_1.default.define('Bebida', {
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    marca: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    sabor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    alcohol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fecha_vencimiento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
}, {
    createdAt: false,
    updatedAt: false,
    tableName: 'bebida',
});
exports.default = Bebida;

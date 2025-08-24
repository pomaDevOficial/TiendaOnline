"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const Alimento = connection_db_1.default.define('Alimento', {
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    marca: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
}, {
    createdAt: false,
    updatedAt: false,
    tableName: 'alimento',
});
exports.default = Alimento;

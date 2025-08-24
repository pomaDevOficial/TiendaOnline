"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const Cliente = connection_db_1.default.define("Cliente", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Para autoincrementar el id
        allowNull: false
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100), // Definir longitud del campo
        allowNull: true
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING(100), // Definir longitud del campo
        allowNull: true
    },
    direccion: {
        type: sequelize_1.DataTypes.STRING(100), // Definir longitud del campo
        allowNull: true
    },
    dni: {
        type: sequelize_1.DataTypes.STRING(8), // Longitud especificada
        allowNull: true
    },
    ruc: {
        type: sequelize_1.DataTypes.STRING(11), // Longitud especificada
        allowNull: true
    },
    razon_social: {
        type: sequelize_1.DataTypes.STRING(100), // Longitud especificada
        allowNull: true
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(20), // Longitud especificada
        allowNull: true
    },
    rubro: {
        type: sequelize_1.DataTypes.STRING(50), // Longitud especificada
        allowNull: true
    }
}, {
    createdAt: false,
    updatedAt: false,
    tableName: 'cliente',
});
exports.default = Cliente;

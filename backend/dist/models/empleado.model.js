"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const Empleado = connection_db_1.default.define("Empleado", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Asegura que el id sea autoincrementable
        allowNull: false,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    dni: {
        type: sequelize_1.DataTypes.STRING(8),
        allowNull: true,
    },
    direccion: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fecha_contratacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    genero: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    estado: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
}, {
    timestamps: false,
    modelName: "Empleado",
    tableName: "empleado",
});
exports.default = Empleado;

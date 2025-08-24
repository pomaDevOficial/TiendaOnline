"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const UnidadMedida = connection_db_1.default.define("UnidadMedida", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Asegura que el id sea autoincrementable
        allowNull: false
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(50), // VARCHAR(50)
        allowNull: true // Se permite null
    },
    abreviatura: {
        type: sequelize_1.DataTypes.STRING(10), // VARCHAR(10)
        allowNull: true // Se permite null
    }
}, {
    timestamps: false,
    modelName: "UnidadMedida",
    tableName: "unidadmedida",
});
exports.default = UnidadMedida;

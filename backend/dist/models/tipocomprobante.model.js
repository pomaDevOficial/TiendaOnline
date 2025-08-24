"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tipoComprobante.model.ts
const sequelize_1 = require("sequelize");
const connection_db_1 = __importDefault(require("../db/connection.db"));
const tiposerie_model_1 = __importDefault(require("./tiposerie.model"));
const TipoComprobante = connection_db_1.default.define("TipoComprobante", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Asegura que el id sea autoincrementable
        allowNull: false
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(20), // VARCHAR(20)
        allowNull: true
    },
    id_tiposerie: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        // Se define la referencia a la tabla TipoSerie:
        references: {
            model: tiposerie_model_1.default,
            key: 'id'
        }
    }
}, {
    timestamps: false,
    modelName: "TipoComprobante",
    tableName: "tipocomprobante",
});
// Establecemos la asociación: Un TipoComprobante pertenece a un TipoSerie.
// Se pueden agregar opciones onDelete y onUpdate según lo que necesites.
TipoComprobante.belongsTo(tiposerie_model_1.default, {
    foreignKey: "id_tiposerie",
    as: "TipoSerie",
    onDelete: "SET NULL", // Por ejemplo, si se elimina un TipoSerie se asigna null
    onUpdate: "CASCADE"
});
exports.default = TipoComprobante;

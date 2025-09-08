import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface MetodoPagoAttributes {
  id: number;
  nombre: string;
  idestado: number;
}

export type MetodoPagoCreationAttributes = Optional<MetodoPagoAttributes, "id">;

class MetodoPago extends Model<MetodoPagoAttributes, MetodoPagoCreationAttributes> 
  implements MetodoPagoAttributes {
  public id!: number;
  public nombre!: string;
  public idestado!: number;

  public readonly Estado?: Estado;
}

MetodoPago.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    idestado: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize: db, tableName: "metodo_pago", timestamps: false }
);

// Relaciones
MetodoPago.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default MetodoPago;
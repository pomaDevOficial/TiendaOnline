// models/estado.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";

export interface EstadoAttributes {
  id: number;
  nombre?: string | null;
  estado?: number | null;
}

export type EstadoCreationAttributes = Optional<EstadoAttributes, "id">;

class Estado extends Model<EstadoAttributes, EstadoCreationAttributes>
  implements EstadoAttributes {
  public id!: number;
  public nombre!: string | null;
  public estado!: number | null;
} 

Estado.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    estado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "estado", timestamps: false }
);

export default Estado;

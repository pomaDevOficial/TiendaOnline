import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface TallaAttributes {
  id: number;
  nombre?: number | null;
  idestado?: number | null;
}

export type TallaCreationAttributes = Optional<TallaAttributes, "id">;

class Talla extends Model<TallaAttributes, TallaCreationAttributes> 
  implements TallaAttributes {
  public id!: number;
  public nombre!: number | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

Talla.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.INTEGER, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "talla", timestamps: false }
);

// Relaciones
Talla.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Talla;
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface RolAttributes {
  id: number;
  nombre?: string | null;
  idestado?: number | null;
}

export type RolCreationAttributes = Optional<RolAttributes, "id">;

class Rol extends Model<RolAttributes, RolCreationAttributes> 
  implements RolAttributes {
  public id!: number;
  public nombre!: string | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

Rol.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "rol", timestamps: false }
);

// Relaciones
Rol.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Rol;
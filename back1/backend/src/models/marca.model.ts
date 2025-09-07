import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface MarcaAttributes {
  id: number;
  nombre?: string | null;
  idestado?: number | null;
}

export type MarcaCreationAttributes = Optional<MarcaAttributes, "id">;

class Marca extends Model<MarcaAttributes, MarcaCreationAttributes> 
  implements MarcaAttributes {
  public id!: number;
  public nombre!: string | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

Marca.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "marca", timestamps: false }
);

// Relaciones
Marca.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Marca;
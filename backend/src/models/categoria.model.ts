import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface CategoriaAttributes {
  id: number;
  nombre?: string | null;
  idestado?: number | null;
}

export type CategoriaCreationAttributes = Optional<CategoriaAttributes, "id">;

class Categoria extends Model<CategoriaAttributes, CategoriaCreationAttributes> 
  implements CategoriaAttributes {
  public id!: number;
  public nombre!: string | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

Categoria.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(50), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "categoria", timestamps: false }
);

// Relaciones
Categoria.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Categoria;
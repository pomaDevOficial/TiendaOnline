import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface TipoSerieAttributes {
  id: number;
  nombre?: string | null;
  idestado?: number | null;
}

export type TipoSerieCreationAttributes = Optional<TipoSerieAttributes, "id">;

class TipoSerie extends Model<TipoSerieAttributes, TipoSerieCreationAttributes> 
  implements TipoSerieAttributes {
  public id!: number;
  public nombre!: string | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

TipoSerie.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "tiposerie", timestamps: false }
);

// Relaciones
TipoSerie.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default TipoSerie;
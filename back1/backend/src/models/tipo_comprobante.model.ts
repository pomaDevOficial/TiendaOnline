import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import TipoSerie from "./tiposerie.model";
import Estado from "./estado.model";

export interface TipoComprobanteAttributes {
  id: number;
  idtiposerie?: number | null;
  nombre?: string | null;
  idestado?: number | null;
}

export type TipoComprobanteCreationAttributes = Optional<TipoComprobanteAttributes, "id">;

class TipoComprobante extends Model<TipoComprobanteAttributes, TipoComprobanteCreationAttributes> 
  implements TipoComprobanteAttributes {
  public id!: number;
  public idtiposerie!: number | null;
  public nombre!: string | null;
  public idestado!: number | null;

  public readonly TipoSerie?: TipoSerie;
  public readonly Estado?: Estado;
}

TipoComprobante.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idtiposerie: { type: DataTypes.INTEGER, allowNull: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "tipo_comprobante", timestamps: false }
);

// Relaciones
TipoComprobante.belongsTo(TipoSerie, { foreignKey: 'idtiposerie', as: 'TipoSerie' });
TipoComprobante.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default TipoComprobante;
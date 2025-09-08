import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Venta from "./venta.model";
import TipoComprobante from "./tipo_comprobante.model";
import Estado from "./estado.model";

export interface ComprobanteAttributes {
  id: number;
  idventa?: number | null;
  igv?: number | null;
  descuento?: number | null;
  total?: number | null;
  idtipocomprobante?: number | null;
  numserie?: string | null;
  idestado?: number | null;
}

export type ComprobanteCreationAttributes = Optional<ComprobanteAttributes, "id">;

class Comprobante extends Model<ComprobanteAttributes, ComprobanteCreationAttributes> 
  implements ComprobanteAttributes {
  public id!: number;
  public idventa!: number | null;
  public igv!: number | null;
  public descuento!: number | null;
  public total!: number | null;
  public idtipocomprobante!: number | null;
  public numserie!: string | null;
  public idestado!: number | null;

  public readonly Venta?: Venta;
  public readonly TipoComprobante?: TipoComprobante;
  public readonly Estado?: Estado;
}

Comprobante.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idventa: { type: DataTypes.INTEGER, allowNull: true },
    igv: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    descuento: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    idtipocomprobante: { type: DataTypes.INTEGER, allowNull: true },
    numserie: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "comprobante", timestamps: false }
);

// Relaciones
Comprobante.belongsTo(Venta, { foreignKey: 'idventa', as: 'Venta' });
Comprobante.belongsTo(TipoComprobante, { foreignKey: 'idtipocomprobante', as: 'TipoComprobante' });
Comprobante.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Comprobante;
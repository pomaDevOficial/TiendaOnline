// ==================== MODELO LOTE ====================
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Producto from "./producto.model";
import Estado from "./estado.model";
import LoteTalla from "./lote_talla.model";

export interface LoteAttributes {
  id: number;
  idproducto?: number | null;
  proveedor?: string | null;
  fechaingreso?: Date | null;
  idestado?: number | null;
  idRelacionado?: number | null;
}

export type LoteCreationAttributes = Optional<LoteAttributes, "id">;

class Lote extends Model<LoteAttributes, LoteCreationAttributes> 
  implements LoteAttributes {
  public id!: number;
  public idproducto!: number | null;
  public proveedor!: string | null;
  public fechaingreso!: Date | null;
  public idestado!: number | null;
  public readonly Producto?: Producto;
  public readonly Estado?: Estado;
}

Lote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idproducto: { type: DataTypes.INTEGER, allowNull: true },
    proveedor: { type: DataTypes.STRING(255), allowNull: true },
    fechaingreso: { type: DataTypes.DATE, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "lote", timestamps: false }
);

// Relaciones
Lote.belongsTo(Producto, { foreignKey: 'idproducto', as: 'Producto' });
Lote.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });
// En Lote.ts, debajo de las otras relaciones

export default Lote;
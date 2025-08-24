// ==================== MODELO MOVIMIENTO_LOTE ====================
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import LoteTalla from "./lote_talla.model";
import Estado from "./estado.model";

export interface MovimientoLoteAttributes {
  id: number;
  idlote_talla?: number | null;
  tipomovimiento?: string | null;
  cantidad?: number | null;
  fechamovimiento?: Date | null;
  idestado?: number | null;
}

export type MovimientoLoteCreationAttributes = Optional<MovimientoLoteAttributes, "id">;

class MovimientoLote extends Model<MovimientoLoteAttributes, MovimientoLoteCreationAttributes> 
  implements MovimientoLoteAttributes {
  public id!: number;
  public idlote_talla!: number | null;
  public tipomovimiento!: string | null;
  public cantidad!: number | null;
  public fechamovimiento!: Date | null;
  public idestado!: number | null;
  
  public readonly LoteTalla?: LoteTalla;
  public readonly Estado?: Estado;
}

MovimientoLote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idlote_talla: { type: DataTypes.INTEGER, allowNull: true },
    tipomovimiento: { type: DataTypes.STRING(255), allowNull: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: true },
    fechamovimiento: { type: DataTypes.DATE, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "movimientolote", timestamps: false }
);

// Relaciones
MovimientoLote.belongsTo(LoteTalla, { foreignKey: 'idlote_talla', as: 'LoteTalla' });
MovimientoLote.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default MovimientoLote;
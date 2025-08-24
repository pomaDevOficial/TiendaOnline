// ==================== MODELO LOTE_TALLA ====================
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Lote from "./lote.model";
import Talla from "./talla.model";
import Estado from "./estado.model";

export interface LoteTallaAttributes {
  id: number;
  idlote?: number | null;
  idtalla?: number | null;
  stock?: number | null;
  esGenero?: number | null;
  preciocosto?: number | null;
  precioventa?: number | null;
  idestado?: number | null;
}

export type LoteTallaCreationAttributes = Optional<LoteTallaAttributes, "id">;

class LoteTalla extends Model<LoteTallaAttributes, LoteTallaCreationAttributes> 
  implements LoteTallaAttributes {
  public id!: number;
  public idlote!: number | null;
  public idtalla!: number | null;
  public stock!: number | null;
  public esGenero!: number | null;
  public preciocosto!: number | null;
  public precioventa!: number | null;
  public idestado!: number | null;
  
  public readonly Lote?: Lote;
  public readonly Talla?: Talla;
  public readonly Estado?: Estado;
}

LoteTalla.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idlote: { type: DataTypes.INTEGER, allowNull: true },
    idtalla: { type: DataTypes.INTEGER, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: true },
    esGenero: { type: DataTypes.INTEGER, allowNull: true },
    preciocosto: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    precioventa: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "lote_talla", timestamps: false }
);

// Relaciones
LoteTalla.belongsTo(Lote, { foreignKey: 'idlote', as: 'Lote' });
LoteTalla.belongsTo(Talla, { foreignKey: 'idtalla', as: 'Talla' });
LoteTalla.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default LoteTalla;
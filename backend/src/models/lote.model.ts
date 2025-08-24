import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Producto from "./producto.model";
import Estado from "./estado.model";

export interface LoteAttributes {
  id: number;
  idproducto?: number | null;
  cantidad?: number | null;
  preciocompra?: number | null;
  precioventa?: number | null;
  imagen?: string | null;
  genero?: number | null;
  fechaingreso?: Date | null;
  idestado?: number | null;
}

export type LoteCreationAttributes = Optional<LoteAttributes, "id">;

class Lote extends Model<LoteAttributes, LoteCreationAttributes> 
  implements LoteAttributes {
  public id!: number;
  public idproducto!: number | null;
  public cantidad!: number | null;
  public preciocompra!: number | null;
  public precioventa!: number | null;
  public imagen!: string | null;
  public genero!: number | null;
  public fechaingreso!: Date | null;
  public idestado!: number | null;

  public readonly Producto?: Producto;
  public readonly Estado?: Estado;
}

Lote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idproducto: { type: DataTypes.INTEGER, allowNull: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: true },
    preciocompra: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    precioventa: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    imagen: { type: DataTypes.STRING(255), allowNull: true },
    genero: { type: DataTypes.INTEGER, allowNull: true },
    fechaingreso: { type: DataTypes.DATE, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "lote", timestamps: false }
);

// Relaciones
Lote.belongsTo(Producto, { foreignKey: 'idproducto', as: 'Producto' });
Lote.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Lote;
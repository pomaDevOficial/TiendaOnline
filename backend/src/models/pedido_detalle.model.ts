import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Pedido from "./pedido.model";
import Lote from "./lote.model";

export interface PedidoDetalleAttributes {
  id: number;
  idpedido?: number | null;
  idlote?: number | null;
  cantidad?: number | null;
  precio?: number | null;
  subtotal?: number | null;
}

export type PedidoDetalleCreationAttributes = Optional<PedidoDetalleAttributes, "id">;

class PedidoDetalle extends Model<PedidoDetalleAttributes, PedidoDetalleCreationAttributes> 
  implements PedidoDetalleAttributes {
  public id!: number;
  public idpedido!: number | null;
  public idlote!: number | null;
  public cantidad!: number | null;
  public precio!: number | null;
  public subtotal!: number | null;

  public readonly Pedido?: Pedido;
  public readonly Lote?: Lote;
}

PedidoDetalle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpedido: { type: DataTypes.INTEGER, allowNull: true },
    idlote: { type: DataTypes.INTEGER, allowNull: true },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  },
  { sequelize: db, tableName: "pedido_detalle", timestamps: false }
);

// Relaciones
PedidoDetalle.belongsTo(Pedido, { foreignKey: 'idpedido', as: 'Pedido' });
PedidoDetalle.belongsTo(Lote, { foreignKey: 'idlote', as: 'Lote' });

export default PedidoDetalle;
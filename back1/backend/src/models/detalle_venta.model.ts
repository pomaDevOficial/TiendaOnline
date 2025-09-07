import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import PedidoDetalle from "./pedido_detalle.model";
import Venta from "./venta.model";
import Estado from "./estado.model";

export interface DetalleVentaAttributes {
  id: number;
  idpedidodetalle?: number | null;
  idventa?: number | null;
  precio_venta_real?: number | null;
  subtotal_real?: number | null;
  idestado?: number | null;
}

export type DetalleVentaCreationAttributes = Optional<DetalleVentaAttributes, "id">;

class DetalleVenta extends Model<DetalleVentaAttributes, DetalleVentaCreationAttributes> 
  implements DetalleVentaAttributes {
  public id!: number;
  public idpedidodetalle!: number | null;
  public idventa!: number | null;
  public precio_venta_real!: number | null;
  public subtotal_real!: number | null;
  public idestado!: number | null;

  public readonly PedidoDetalle?: PedidoDetalle;
  public readonly Venta?: Venta;
  public readonly Estado?: Estado;
}

DetalleVenta.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpedidodetalle: { type: DataTypes.INTEGER, allowNull: true },
    idventa: { type: DataTypes.INTEGER, allowNull: true },
    precio_venta_real: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    subtotal_real: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "detalleventa", timestamps: false }
);

// Relaciones
DetalleVenta.belongsTo(PedidoDetalle, { foreignKey: 'idpedidodetalle', as: 'PedidoDetalle' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'idventa', as: 'Venta' });
DetalleVenta.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default DetalleVenta;
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Usuario from "./usuario.model";
import Pedido from "./pedido.model";
import Estado from "./estado.model";

export interface VentaAttributes {
  id: number;
  fechaventa?: Date | null;
  idusuario?: number | null;
  idpedido?: number | null;
  idestado?: number | null;
}

export type VentaCreationAttributes = Optional<VentaAttributes, "id">;

class Venta extends Model<VentaAttributes, VentaCreationAttributes> 
  implements VentaAttributes {
  public id!: number;
  public fechaventa!: Date | null;
  public idusuario!: number | null;
  public idpedido!: number | null;
  public idestado!: number | null;

  public readonly Usuario?: Usuario;
  public readonly Pedido?: Pedido;
  public readonly Estado?: Estado;
}

Venta.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fechaventa: { type: DataTypes.DATE, allowNull: true },
    idusuario: { type: DataTypes.INTEGER, allowNull: true },
    idpedido: { type: DataTypes.INTEGER, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "venta", timestamps: false }
);

// Relaciones
Venta.belongsTo(Usuario, { foreignKey: 'idusuario', as: 'Usuario' });
Venta.belongsTo(Pedido, { foreignKey: 'idpedido', as: 'Pedido' });
Venta.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Venta;
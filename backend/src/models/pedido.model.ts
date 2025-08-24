import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Persona from "./persona.model";
import MetodoPago from "./metodo_pago.model";
import Estado from "./estado.model";

export interface PedidoAttributes {
  id: number;
  idpersona?: number | null;
  idmetodopago?: number | null;
  fechaoperacion?: Date | null;
  idestado?: number | null;
  totalimporte?: number | null;
  adjunto?: string | null;
}

export type PedidoCreationAttributes = Optional<PedidoAttributes, "id">;

class Pedido extends Model<PedidoAttributes, PedidoCreationAttributes> 
  implements PedidoAttributes {
  public id!: number;
  public idpersona!: number | null;
  public idmetodopago!: number | null;
  public fechaoperacion!: Date | null;
  public idestado!: number | null;
  public totalimporte!: number | null;
  public adjunto!: string | null;

  public readonly Persona?: Persona;
  public readonly MetodoPago?: MetodoPago;
  public readonly Estado?: Estado;
}

Pedido.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idpersona: { type: DataTypes.INTEGER, allowNull: true },
    idmetodopago: { type: DataTypes.INTEGER, allowNull: true },
    fechaoperacion: { type: DataTypes.DATE, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
    totalimporte: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    adjunto: { type: DataTypes.STRING(255), allowNull: true },
  },
  { sequelize: db, tableName: "pedido", timestamps: false }
);

// Relaciones
Pedido.belongsTo(Persona, { foreignKey: 'idpersona', as: 'Persona' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'idmetodopago', as: 'MetodoPago' });
Pedido.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Pedido;
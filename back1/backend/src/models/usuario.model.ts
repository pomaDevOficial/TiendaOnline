import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Rol from "./rol.model";
import Persona from "./persona.model";
import Estado from "./estado.model";

export interface UsuarioAttributes {
  id: number;
  idrol?: number | null;
  idpersona?: number | null;
  usuario?: string | null;
  contrasenia?: string | null;
  idestado?: number | null;
}

export type UsuarioCreationAttributes = Optional<UsuarioAttributes, "id">;

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> 
  implements UsuarioAttributes {
  public id!: number;
  public idrol!: number | null;
  public idpersona!: number | null;
  public usuario!: string | null;
  public contrasenia!: string | null;
  public idestado!: number | null;

  public readonly Rol?: Rol;
  public readonly Persona?: Persona;
  public readonly Estado?: Estado;
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idrol: { type: DataTypes.INTEGER, allowNull: true },
    idpersona: { type: DataTypes.INTEGER, allowNull: true },
    usuario: { type: DataTypes.STRING(255), allowNull: true },
    contrasenia: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "usuario", timestamps: false }
);

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: 'idrol', as: 'Rol' });
Usuario.belongsTo(Persona, { foreignKey: 'idpersona', as: 'Persona' });
Usuario.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Usuario;
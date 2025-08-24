import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Estado from "./estado.model";

export interface PersonaAttributes {
  id: number;
  idtipopersona?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  idtipoidentidad?: number | null;
  nroidentidad?: string | null;
  correo?: string | null;
  telefono?: string | null;
  idestado?: number | null;
}

export type PersonaCreationAttributes = Optional<PersonaAttributes, "id">;

class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> 
  implements PersonaAttributes {
  public id!: number;
  public idtipopersona!: number | null;
  public nombres!: string | null;
  public apellidos!: string | null;
  public idtipoidentidad!: number | null;
  public nroidentidad!: string | null;
  public correo!: string | null;
  public telefono!: string | null;
  public idestado!: number | null;

  public readonly Estado?: Estado;
}

Persona.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idtipopersona: { type: DataTypes.INTEGER, allowNull: true },
    nombres: { type: DataTypes.STRING(255), allowNull: true },
    apellidos: { type: DataTypes.STRING(255), allowNull: true },
    idtipoidentidad: { type: DataTypes.INTEGER, allowNull: true },
    nroidentidad: { type: DataTypes.STRING(255), allowNull: true },
    correo: { type: DataTypes.STRING(255), allowNull: true },
    telefono: { type: DataTypes.STRING(255), allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "persona", timestamps: false }
);

// Relaciones
Persona.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Persona;
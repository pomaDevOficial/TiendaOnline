// ==================== MODELO PRODUCTO ====================
import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/connection.db";
import Categoria from "./categoria.model";
import Marca from "./marca.model";
import Estado from "./estado.model";

export interface ProductoAttributes {
  id: number;
  nombre?: string | null;
  idcategoria?: number | null;
  idmarca?: number | null;
  idestado?: number | null;
}

export type ProductoCreationAttributes = Optional<ProductoAttributes, "id">;

class Producto extends Model<ProductoAttributes, ProductoCreationAttributes> 
  implements ProductoAttributes {
  public id!: number;
  public nombre!: string | null;
  public idcategoria!: number | null;
  public idmarca!: number | null;
  public idestado!: number | null;
  
  public readonly Categoria?: Categoria;
  public readonly Marca?: Marca;
  public readonly Estado?: Estado;
}

Producto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: true },
    idcategoria: { type: DataTypes.INTEGER, allowNull: true },
    idmarca: { type: DataTypes.INTEGER, allowNull: true },
    idestado: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize: db, tableName: "producto", timestamps: false }
);

// Relaciones
Producto.belongsTo(Categoria, { foreignKey: 'idcategoria', as: 'Categoria' });
Producto.belongsTo(Marca, { foreignKey: 'idmarca', as: 'Marca' });
Producto.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

export default Producto;
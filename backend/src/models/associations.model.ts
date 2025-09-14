// src/models/associations.ts
import Lote from './lote.model';
import LoteTalla from './lote_talla.model';
import Producto from './producto.model';
import Estado from './estado.model';
import Talla from './talla.model';

export const setupAssociations = () => {
  // Asociaciones de LoteTalla
  LoteTalla.belongsTo(Lote, { foreignKey: 'idlote', as: 'Lote' });
  LoteTalla.belongsTo(Talla, { foreignKey: 'idtalla', as: 'Talla' });
  LoteTalla.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });

  // Asociaciones de Lote
  Lote.belongsTo(Producto, { foreignKey: 'idproducto', as: 'Producto' });
  Lote.belongsTo(Estado, { foreignKey: 'idestado', as: 'Estado' });
  Lote.hasMany(LoteTalla, { foreignKey: 'idlote', as: 'LoteTalla' });
};
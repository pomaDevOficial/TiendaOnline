import { Request, Response } from 'express';
import Lote from '../models/lote.model';
import Producto from '../models/producto.model';
import Estado from '../models/estado.model';
import Categoria from '../models/categoria.model';
import Marca from '../models/marca.model';
import { EstadoGeneral, LoteEstado, TipoMovimientoLote } from '../estadosTablas/estados.constans';
import LoteTalla from '../models/lote_talla.model';
import Talla from '../models/talla.model';
import MovimientoLote from '../models/movimiento_lote.model';
import { Op } from 'sequelize';
import moment from "moment-timezone";
import sequelize from '../db/connection.db';
import db from '../db/connection.db';

// CREATE - Insertar nuevo lote
export const createLote = async (req: Request, res: Response): Promise<void> => {
  const { idproducto, proveedor, fechaingreso } = req.body;

  try {
    // Validaciones
    if (!idproducto || !proveedor) {
      res.status(400).json({ 
        msg: 'Los campos idproducto y proveedor son obligatorios' 
      });
      return;
    }

    // Verificar si existe el producto
    const producto = await Producto.findByPk(idproducto);
    if (!producto) {
      res.status(400).json({ msg: 'El producto no existe' });
      return;
    }
    // Verificar si ya existe un lote activo para este producto
    const loteExistente = await Lote.findOne({
      where: {
        idproducto,
        idestado: { [Op.ne]: LoteEstado.ELIMINADO }
      }
    });

    if (loteExistente) {
      res.status(400).json({ 
        msg: 'Ya existe un lote para este producto' 
      });
      return;
    }
    // Crear nuevo lote
    const nuevoLote: any = await Lote.create({
      idproducto,
      proveedor,
      fechaingreso: fechaingreso || new Date(),
      idestado: LoteEstado.DISPONIBLE
    });

    // Obtener el lote creado con sus relaciones
    const loteCreado = await Lote.findByPk(nuevoLote.id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Lote creado exitosamente',
      data: loteCreado
    });
  } catch (error) {
    console.error('Error en createLote:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar lote
export const updateLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idproducto, proveedor, fechaingreso } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del lote es obligatorio" });
      return;
    }

    const lote: any = await Lote.findByPk(id);
    if (!lote) {
      res.status(404).json({ msg: `No existe un lote con el id ${id}` });
      return;
    }

    // Verificar si existe el producto (si se está actualizando)
    if (idproducto) {
      const producto = await Producto.findByPk(idproducto);
      if (!producto) {
        res.status(400).json({ msg: 'El producto no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idproducto) lote.idproducto = idproducto;
    if (proveedor) lote.proveedor = proveedor;
    if (fechaingreso) lote.fechaingreso = fechaingreso;
    
    // Cambiar estado a ACTUALIZADO si no está eliminado
    if (lote.idestado !== LoteEstado.ELIMINADO) {
      lote.idestado = LoteEstado.DISPONIBLE;
    }

    await lote.save();

    // Obtener el lote actualizado con relaciones
    const loteActualizado = await Lote.findByPk(id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Lote actualizado con éxito",
      data: loteActualizado
    });

  } catch (error) {
    console.error("Error en updateLote:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

export const getLoteObtenerInformacion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote = await Lote.findByPk(id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            { model: Categoria, as: 'Categoria', attributes: ['id', 'nombre'] },
            { model: Marca, as: 'Marca', attributes: ['id', 'nombre'] }
          ]
        },
        { model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }
      ]
    });

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    const detalles = await LoteTalla.findAll({
      where: { 
        idlote: id,
        idestado: { [Op.ne]: LoteEstado.ELIMINADO } // 🚀 excluye los eliminados
      },
    });

    res.json({
      msg: 'Lote obtenido exitosamente',
      data: lote,
      detalles
    });
  } catch (error) {
    console.error('Error en getLoteObtenerInformacion:', error);
    res.status(500).json({ msg: 'Error al obtener el lote' });
  }
};
// READ - Listar todos los lotes
export const getLotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de lotes obtenida exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotes:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de lotes' });
  }
};

// READ - Listar lotes disponibles (no eliminados)
export const getLotesDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      where: { 
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            },
            
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        },
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes disponibles obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener lotes disponibles' });
  }
};

// READ - Obtener lote por ID
export const getLoteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote = await Lote.findByPk(id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        },
         
      ]
    });

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    res.json({
      msg: 'Lote obtenido exitosamente',
      data: lote
    });
  } catch (error) {
    console.error('Error en getLoteById:', error);
    res.status(500).json({ msg: 'Error al obtener el lote' });
  }
};

// READ - Obtener lotes por producto
export const getLotesByProducto = async (req: Request, res: Response): Promise<void> => {
  const { idproducto } = req.params;

  try {
    const lotes = await Lote.findAll({
      where: { 
        idproducto,
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes del producto obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesByProducto:', error);
    res.status(500).json({ msg: 'Error al obtener lotes del producto' });
  }
};

// UPDATE - Cambiar estado del lote (disponible/agotado)
export const cambiarEstadoLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body; // LoteEstado.DISPONIBLE o LoteEstado.AGOTADO

  try {
    if (!estado || ![LoteEstado.DISPONIBLE, LoteEstado.AGOTADO].includes(estado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser DISPONIBLE (1) o AGOTADO (2)' 
      });
      return;
    }

    const lote: any = await Lote.findByPk(id);
    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    lote.idestado = estado;
    await lote.save();

    res.json({ 
      msg: 'Estado del lote actualizado con éxito',
      data: { id: lote.id, estado }
    });
  } catch (error) {
    console.error('Error en cambiarEstadoLote:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado del lote' });
  }
};

// DELETE - Eliminar lote (cambiar estado a eliminado)
export const deleteLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote: any = await Lote.findByPk(id);

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    lote.idestado = LoteEstado.ELIMINADO;
    await lote.save();

    res.json({ 
      msg: 'Lote eliminado con éxito',
      data: { id: lote.id, estado: LoteEstado.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteLote:', error);
    res.status(500).json({ msg: 'Error al eliminar el lote' });
  }
};

// READ - Listar lotes eliminados
export const getLotesEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      where: { idestado: LoteEstado.ELIMINADO },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes eliminados obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener lotes eliminados' });
  }
};

// UPDATE - Restaurar lote eliminado
export const restaurarLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote: any = await Lote.findByPk(id);

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    // Cambiar estado a DISPONIBLE
    lote.idestado = LoteEstado.DISPONIBLE;
    await lote.save();

    res.json({ 
      msg: 'Lote restaurado con éxito',
      data: { id: lote.id, estado: LoteEstado.DISPONIBLE }
    });
  } catch (error) {
    console.error('Error en restaurarLote:', error);
    res.status(500).json({ msg: 'Error al restaurar el lote' });
  }
};

// CREATE - Insertar lote completo con detalles y movimientos
// export const createLoteCompleto = async (req: Request, res: Response): Promise<void> => {
//   const { idproducto, proveedor, fechaingreso, detalles } = req.body;

//   const transaction = await sequelize.transaction();

//   try {
//     // Validaciones
//     if (!idproducto || !proveedor) {
//       await transaction.rollback();
//       res.status(400).json({ 
//         msg: 'Los campos idproducto y proveedor son obligatorios' 
//       });
//       return;
//     }

//     if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
//       await transaction.rollback();
//       res.status(400).json({ 
//         msg: 'El campo detalles es obligatorio y debe ser un array no vacío' 
//       });
//       return;
//     }

//     // Verificar si existe el producto
//     const producto = await Producto.findByPk(idproducto, { transaction });
//     if (!producto) {
//       await transaction.rollback();
//       res.status(400).json({ msg: 'El producto no existe' });
//       return;
//     }

//     // Verificar si ya existe un lote activo para este producto
//     const loteExistente = await Lote.findOne({
//       where: {
//         idproducto,
//         idestado: { [Op.ne]: LoteEstado.ELIMINADO }
//       },
//       transaction
//     });

//     if (loteExistente) {
//       await transaction.rollback();
//       res.status(400).json({ 
//         msg: 'Ya existe un lote activo para este producto' 
//       });
//       return;
//     }

//     // Crear nuevo lote
//     const nuevoLote: any = await Lote.create({
//       idproducto,
//       proveedor,
//       fechaingreso: fechaingreso || new Date(),
//       idestado: LoteEstado.DISPONIBLE
//     }, { transaction });

//     const detallesCreados = [];
//     const movimientosCreados = [];

//     // Crear detalles de lote_talla
//     for (const detalle of detalles) {
//       const { idtalla, stock, esGenero, preciocosto, precioventa } = detalle;

//       // Validaciones para cada detalle
//       if (!idtalla || stock === undefined || esGenero === undefined) {
//         await transaction.rollback();
//         res.status(400).json({ 
//           msg: 'Cada detalle debe tener idtalla, stock y esGenero' 
//         });
//         return;
//       }

//       // Verificar si existe la talla
//       const talla = await Talla.findByPk(idtalla, { transaction });
//       if (!talla) {
//         await transaction.rollback();
//         res.status(400).json({ msg: `La talla con id ${idtalla} no existe` });
//         return;
//       }

//       // Verificar si ya existe un registro con el mismo idlote, idtalla y esGenero
//       const loteTallaExistente = await LoteTalla.findOne({
//         where: {
//           idlote: nuevoLote.id,
//           idtalla,
//           esGenero,
//           idestado: { [Op.ne]: LoteEstado.ELIMINADO }
//         },
//         transaction
//       });

//       if (loteTallaExistente) {
//         await transaction.rollback();
//         res.status(400).json({ 
//           msg: `Ya existe un registro con la talla ${idtalla} y género ${esGenero} para este lote` 
//         });
//         return;
//       }

//       // Crear nuevo lote_talla
//       const nuevoLoteTalla: any = await LoteTalla.create({
//         idlote: nuevoLote.id,
//         idtalla,
//         stock,
//         esGenero,
//         preciocosto: preciocosto || 0,
//         precioventa: precioventa || 0,
//         idestado: LoteEstado.DISPONIBLE
//       }, { transaction });

//       // Obtener el lote_talla creado con sus relaciones
//       const loteTallaCreado = await LoteTalla.findByPk(nuevoLoteTalla.id, {
//         include: [
//           { 
//             model: Talla, 
//             as: 'Talla',
//             attributes: ['id', 'nombre'] 
//           },
//           { 
//             model: Estado, 
//             as: 'Estado',
//             attributes: ['id', 'nombre'] 
//           }
//         ],
//         transaction
//       });

//       detallesCreados.push(loteTallaCreado);

//       // Crear movimiento de ingreso para este detalle
//       const nuevoMovimiento: any = await MovimientoLote.create({
//         idlote_talla: nuevoLoteTalla.id,
//         tipomovimiento: TipoMovimientoLote.ENTRADA,
//         cantidad: stock,
//         fechamovimiento: moment().tz("America/Lima").toDate(),
//         idestado: EstadoGeneral.REGISTRADO
//       }, { transaction });

//       // Obtener el movimiento creado con sus relaciones
//       const movimientoCreado = await MovimientoLote.findByPk(nuevoMovimiento.id, {
//         include: [
//           { 
//             model: LoteTalla, 
//             as: 'LoteTalla',
//             attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
//             include: [
//               {
//                 model: Talla,
//                 as: 'Talla',
//                 attributes: ['id', 'nombre']
//               }
//             ]
//           },
//           { 
//             model: Estado, 
//             as: 'Estado',
//             attributes: ['id', 'nombre'] 
//           }
//         ],
//         transaction
//       });

//       movimientosCreados.push(movimientoCreado);
//     }

//     // 🔹 CONSULTA SEPARADA para obtener los detalles del lote
//     // Primero obtener el lote básico
//     const loteBasico = await Lote.findByPk(nuevoLote.id, {
//       include: [
//         { 
//           model: Producto, 
//           as: 'Producto',
//           attributes: ['id', 'nombre','imagen'],
//           include: [
//             {
//               model: Categoria,
//               as: 'Categoria',
//               attributes: ['id', 'nombre']
//             },
//             {
//               model: Marca,
//               as: 'Marca',
//               attributes: ['id', 'nombre']
//             }
//           ]
//         },
//         { 
//           model: Estado, 
//           as: 'Estado',
//           attributes: ['id', 'nombre'] 
//         }
//       ],
//       transaction
//     });

//     // 🔹 Luego obtener los LoteTalla relacionados por separado
//     const lotesTallaRelacionados = await LoteTalla.findAll({
//       where: {
//         idlote: nuevoLote.id
//       },
//       include: [
//         {
//           model: Talla,
//           as: 'Talla',
//           attributes: ['id', 'nombre']
//         },
//         {
//           model: Estado,
//           as: 'Estado',
//           attributes: ['id', 'nombre']
//         }
//       ],
//       transaction
//     });

//     // 🔹 Confirmar la transacción
//     await transaction.commit();

//     // 🔹 Construir la respuesta manualmente combinando los datos
//     const loteCompleto = {
//       ...loteBasico?.toJSON(),
//       LoteTallas: lotesTallaRelacionados
//     };

//     res.status(201).json({
//       msg: 'Lote completo creado exitosamente',
//       data: {
//         lote: loteCompleto,
//         detalles: detallesCreados,
//         movimientos: movimientosCreados
//       }
//     });
//   } catch (error) {
//     // 🔹 Revertir la transacción en caso de error
//     await transaction.rollback();
//     console.error('Error en createLoteCompleto:', error);
//     res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
//   }
// };
export const createLoteCompleto = async (req: Request, res: Response): Promise<void> => {
  const { idproducto, proveedor, fechaingreso, detalles } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Validaciones
    if (!idproducto || !proveedor) {
      await transaction.rollback();
      res.status(400).json({ 
        msg: 'Los campos idproducto y proveedor son obligatorios' 
      });
      return;
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await transaction.rollback();
      res.status(400).json({ 
        msg: 'El campo detalles es obligatorio y debe ser un array no vacío' 
      });
      return;
    }
    // Verificar si existe el producto
    const producto = await Producto.findByPk(idproducto.id, { transaction });
    if (!producto) {
      await transaction.rollback();
      res.status(400).json({ msg: 'El producto no existe' });
      return;
    }

    // Verificar si ya existe un lote activo para este producto
    const loteExistente = await Lote.findOne({
      where: {
        idproducto: idproducto.id,
        idestado: { [Op.ne]: LoteEstado.ELIMINADO }
      },
      transaction
    });

    if (loteExistente) {
      await transaction.rollback();
      res.status(400).json({ 
        msg: 'Ya existe un lote activo para este producto' 
      });
      return;
    }

    // Crear nuevo lote
    const nuevoLote: any = await Lote.create({
      idproducto: idproducto.id,
      proveedor,
      fechaingreso: fechaingreso || new Date(),
      idestado: LoteEstado.DISPONIBLE
    }, { transaction });

    const detallesCreados = [];
    const movimientosCreados = [];

    // Crear detalles de lote_talla
    for (const detalle of detalles) {
      const { idtalla, stock, esGenero, preciocosto, precioventa } = detalle;

      // Validaciones para cada detalle
      if (!idtalla || stock === undefined || esGenero === undefined) {
        await transaction.rollback();
        res.status(400).json({ 
          msg: 'Cada detalle debe tener idtalla, stock y esGenero' 
        });
        return;
      }

      // Verificar si existe la talla
      const talla = await Talla.findByPk(idtalla, { transaction });
      if (!talla) {
        await transaction.rollback();
        res.status(400).json({ msg: `La talla con id ${idtalla} no existe` });
        return;
      }

      // Verificar si ya existe un registro con el mismo idlote, idtalla y esGenero
      const loteTallaExistente = await LoteTalla.findOne({
        where: {
          idlote: nuevoLote.get('id'),
          idtalla,
          esGenero,
          idestado: { [Op.ne]: LoteEstado.ELIMINADO }
        },
        transaction
      });

      if (loteTallaExistente) {
        await transaction.rollback();
        res.status(400).json({ 
          msg: `Ya existe un registro con la talla ${idtalla} y género ${esGenero} para este lote` 
        });
        return;
      }

      // Crear nuevo lote_talla
      const nuevoLoteTalla: any = await LoteTalla.create({
        idlote: nuevoLote.get('id'),
        idtalla,
        stock,
        esGenero,
        preciocosto: preciocosto || 0,
        precioventa: precioventa || 0,
        idestado: LoteEstado.DISPONIBLE
      }, { transaction });

      // Obtener el lote_talla creado con sus relaciones
      const loteTallaCreado = await LoteTalla.findByPk(nuevoLoteTalla.get('id'), {
        include: [
          { 
            model: Talla, 
            as: 'Talla',
            attributes: ['id', 'nombre'] 
          },
          { 
            model: Estado, 
            as: 'Estado',
            attributes: ['id', 'nombre'] 
          }
        ],
        transaction
      });

      detallesCreados.push(loteTallaCreado);

      // Crear movimiento de ingreso para este detalle
      const nuevoMovimiento: any = await MovimientoLote.create({
        idlote_talla: nuevoLoteTalla.get('id'),
        tipomovimiento: TipoMovimientoLote.ENTRADA,
        cantidad: stock,
        fechamovimiento: moment().tz("America/Lima").toDate(),
        idestado: EstadoGeneral.REGISTRADO
      }, { transaction });

      // Obtener el movimiento creado con sus relaciones
      const movimientoCreado = await MovimientoLote.findByPk(nuevoMovimiento.get('id'), {
        include: [
          { 
            model: LoteTalla, 
            as: 'LoteTalla',
            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
            include: [
              {
                model: Talla,
                as: 'Talla',
                attributes: ['id', 'nombre']
              }
            ]
          },
          { 
            model: Estado, 
            as: 'Estado',
            attributes: ['id', 'nombre'] 
          }
        ],
        transaction
      });

      movimientosCreados.push(movimientoCreado);
    }

    // 🔹 CONSULTA SEPARADA para obtener los detalles del lote
    // Primero obtener el lote básico
    const loteBasico = await Lote.findByPk(nuevoLote.get('id'), {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre','imagen'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      transaction
    });

    // 🔹 Luego obtener los LoteTalla relacionados por separado
    const lotesTallaRelacionados = await LoteTalla.findAll({
      where: {
        idlote: nuevoLote.get('id')
      },
      include: [
        {
          model: Talla,
          as: 'Talla',
          attributes: ['id', 'nombre']
        },
        {
          model: Estado,
          as: 'Estado',
          attributes: ['id', 'nombre']
        }
      ],
      transaction
    });

    // 🔹 Confirmar la transacción
    await transaction.commit();

    // 🔹 Construir la respuesta manualmente combinando los datos
    const loteCompleto = {
      ...loteBasico?.toJSON(),
      LoteTallas: lotesTallaRelacionados
    };

    res.status(201).json({
      msg: 'Lote completo creado exitosamente',
      data: {
        lote: loteCompleto,
        detalles: detallesCreados,
        movimientos: movimientosCreados
      }
    });
  } catch (error) {
    // 🔹 Revertir la transacción en caso de error
    await transaction.rollback();
    console.error('Error en createLoteCompleto:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};



export const getLotesBuscar = async (req: Request, res: Response): Promise<void> => {
  const qraw = req.query.q;
  const q = typeof qraw === 'string' ? qraw.trim() : '';

  try {
    if (!q) {
      res.status(400).json({ msg: 'El parámetro q (búsqueda) es obligatorio' });
      return;
    }

    const like = `%${q}%`;

    const lotes = await Lote.findAll({
      where: {
        idestado: LoteEstado.DISPONIBLE, // 🔹 Solo lotes disponibles
        [Op.or]: [
          { proveedor: { [Op.like]: like } },
          { '$Producto.nombre$': { [Op.like]: like } },
          { '$Producto.Categoria.nombre$': { [Op.like]: like } },
          { '$Producto.Marca.nombre$': { [Op.like]: like } }
        ]
      },
      include: [
        {
          model: Producto,
          as: 'Producto',
          attributes: ['id', 'nombre'],
          required: false,
          include: [
            { model: Categoria, as: 'Categoria', attributes: ['id', 'nombre'], required: false },
            { model: Marca, as: 'Marca', attributes: ['id', 'nombre'], required: false }
          ]
        },
        { model: Estado, as: 'Estado', attributes: ['id', 'nombre'], required: false }
      ],
      order: [['fechaingreso', 'DESC']],
      group: ['Lote.id'] // evita duplicados sin usar "distinct"
    });

    res.json({
      msg: 'Resultados de búsqueda obtenidos exitosamente',
      data: lotes
    });

  } catch (error) {
    console.error('Error en getLotesBuscar:', error);
    res.status(500).json({ msg: 'Error al buscar lotes' });
  }
};

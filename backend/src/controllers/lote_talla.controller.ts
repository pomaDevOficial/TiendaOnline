import { Request, Response } from 'express';
import LoteTalla from '../models/lote_talla.model';
import Lote from '../models/lote.model';
import Talla from '../models/talla.model';
import Estado from '../models/estado.model';
import Producto from '../models/producto.model';
import Categoria from '../models/categoria.model';
import Marca from '../models/marca.model';
import { EstadoGeneral, LoteEstado, TipoMovimientoLote } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';
import MovimientoLote from '../models/movimiento_lote.model';
import moment from "moment-timezone";
import sequelize from '../db/connection.db';

// CREATE - Insertar nuevo lote_talla
export const createLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { idlote, idtalla, stock, esGenero, preciocosto, precioventa } = req.body;

  try {
    // Validaciones
    if (!idlote || !idtalla || stock === undefined || esGenero === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idlote, idtalla, stock y esGenero son obligatorios' 
      });
      return;
    }

    // Verificar si existe el lote
    const lote = await Lote.findByPk(idlote);
    if (!lote) {
      res.status(400).json({ msg: 'El lote no existe' });
      return;
    }

    // Verificar si existe la talla
    const talla = await Talla.findByPk(idtalla);
    if (!talla) {
      res.status(400).json({ msg: 'La talla no existe' });
      return;
    }

    // Verificar si ya existe un registro con el mismo idlote, idtalla y esGenero
    const loteTallaExistente = await LoteTalla.findOne({
      where: {
        idlote,
        idtalla,
        esGenero,
        idestado: { [Op.ne]: LoteEstado.ELIMINADO }
      }
    });

    if (loteTallaExistente) {
      res.status(400).json({ 
        msg: 'Ya existe un registro con la misma talla y género para este lote' 
      });
      return;
    }

    // Crear nuevo lote_talla
    const nuevoLoteTalla: any = await LoteTalla.create({
      idlote,
      idtalla,
      stock,
      esGenero,
      preciocosto: preciocosto || 0,
      precioventa: precioventa || 0,
      idestado: LoteEstado.DISPONIBLE
    });

    // Obtener el lote_talla creado con sus relaciones
    const loteTallaCreado = await LoteTalla.findByPk(nuevoLoteTalla.id, {
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
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
      ]
    });

    res.status(201).json({
      msg: 'LoteTalla creado exitosamente',
      data: loteTallaCreado
    });
  } catch (error) {
    console.error('Error en createLoteTalla:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar lote_talla
export const updateLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idlote, idtalla, stock, esGenero, preciocosto, precioventa } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del lote_talla es obligatorio" });
      return;
    }

    const loteTalla: any = await LoteTalla.findByPk(id);
    if (!loteTalla) {
      res.status(404).json({ msg: `No existe un lote_talla con el id ${id}` });
      return;
    }

    // Verificar si existe el lote (si se está actualizando)
    if (idlote) {
      const lote = await Lote.findByPk(idlote);
      if (!lote) {
        res.status(400).json({ msg: 'El lote no existe' });
        return;
      }
    }

    // Verificar si existe la talla (si se está actualizando)
    if (idtalla) {
      const talla = await Talla.findByPk(idtalla);
      if (!talla) {
        res.status(400).json({ msg: 'La talla no existe' });
        return;
      }
    }

    // Verificar si ya existe otro registro con el mismo idlote, idtalla y esGenero
    if ((idlote || loteTalla.idlote) && (idtalla || loteTalla.idtalla) && (esGenero !== undefined || loteTalla.esGenero)) {
      const loteTallaExistente = await LoteTalla.findOne({
        where: {
          id: { [Op.ne]: id },
          idlote: idlote || loteTalla.idlote,
          idtalla: idtalla || loteTalla.idtalla,
          esGenero: esGenero !== undefined ? esGenero : loteTalla.esGenero,
          idestado: { [Op.ne]: LoteEstado.ELIMINADO }
        }
      });

      if (loteTallaExistente) {
        res.status(400).json({ 
          msg: 'Ya existe otro registro con la misma talla y género para este lote' 
        });
        return;
      }
    }

    // Actualizar campos
    if (idlote) loteTalla.idlote = idlote;
    if (idtalla) loteTalla.idtalla = idtalla;
    if (stock !== undefined) loteTalla.stock = stock;
    if (esGenero !== undefined) loteTalla.esGenero = esGenero;
    if (preciocosto !== undefined) loteTalla.preciocosto = preciocosto;
    if (precioventa !== undefined) loteTalla.precioventa = precioventa;
    
    // Cambiar estado a DISPONIBLE si no está eliminado
    if (loteTalla.idestado !== LoteEstado.ELIMINADO) {
      loteTalla.idestado = LoteEstado.DISPONIBLE;
    }

    await loteTalla.save();

    // Obtener el lote_talla actualizado con relaciones
    const loteTallaActualizado = await LoteTalla.findByPk(id, {
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
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
      ]
    });

    res.json({
      msg: "LoteTalla actualizado con éxito",
      data: loteTallaActualizado
    });

  } catch (error) {
    console.error("Error en updateLoteTalla:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los lote_talla
export const getLotesTalla = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotesTalla = await LoteTalla.findAll({
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
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
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de lotes_talla obtenida exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getLotesTalla:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de lotes_talla' });
  }
};

// READ - Listar lotes_talla disponibles (no eliminados)
export const getLotesTallaDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotesTalla = await LoteTalla.findAll({
      where: { 
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lotes_talla disponibles obtenidos exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getLotesTallaDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener lotes_talla disponibles' });
  }
};

// READ - Obtener lote_talla por ID
export const getLoteTallaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const loteTalla = await LoteTalla.findByPk(id, {
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
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
      ]
    });

    if (!loteTalla) {
      res.status(404).json({ msg: 'LoteTalla no encontrado' });
      return;
    }

    res.json({
      msg: 'LoteTalla obtenido exitosamente',
      data: loteTalla
    });
  } catch (error) {
    console.error('Error en getLoteTallaById:', error);
    res.status(500).json({ msg: 'Error al obtener el lote_talla' });
  }
};

// READ - Obtener lotes_talla por lote
export const getLotesTallaByLote = async (req: Request, res: Response): Promise<void> => {
  const { idlote } = req.params;

  try {
    const lotesTalla = await LoteTalla.findAll({
      where: { 
        idlote,
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
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
      order: [['idtalla', 'ASC']]
    });

    res.json({
      msg: 'Lotes_talla del lote obtenidos exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getLotesTallaByLote:', error);
    res.status(500).json({ msg: 'Error al obtener lotes_talla del lote' });
  }
};

// UPDATE - Cambiar estado del lote_talla (disponible/agotado)
export const cambiarEstadoLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body; // LoteEstado.DISPONIBLE o LoteEstado.AGOTADO

  try {
    if (!estado || ![LoteEstado.DISPONIBLE, LoteEstado.AGOTADO].includes(estado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser DISPONIBLE (1) o AGOTADO (2)' 
      });
      return;
    }

    const loteTalla: any = await LoteTalla.findByPk(id);
    if (!loteTalla) {
      res.status(404).json({ msg: 'LoteTalla no encontrado' });
      return;
    }

    loteTalla.idestado = estado;
    await loteTalla.save();

    res.json({ 
      msg: 'Estado del lote_talla actualizado con éxito',
      data: { id: loteTalla.id, estado }
    });
  } catch (error) {
    console.error('Error en cambiarEstadoLoteTalla:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado del lote_talla' });
  }
};

// DELETE - Eliminar lote_talla (cambiar estado a eliminado)
export const deleteLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const loteTalla: any = await LoteTalla.findByPk(id);

    if (!loteTalla) {
      res.status(404).json({ msg: 'LoteTalla no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    loteTalla.idestado = LoteEstado.ELIMINADO;
    await loteTalla.save();

    res.json({ 
      msg: 'LoteTalla eliminado con éxito',
      data: { id: loteTalla.id, estado: LoteEstado.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteLoteTalla:', error);
    res.status(500).json({ msg: 'Error al eliminar el lote_talla' });
  }
};

// READ - Listar lotes_talla eliminados
export const getLotesTallaEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotesTalla = await LoteTalla.findAll({
      where: { idestado: LoteEstado.ELIMINADO },
      include: [
        { 
          model: Lote, 
          as: 'Lote',
          attributes: ['id', 'proveedor', 'fechaingreso'],
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
          ]
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lotes_talla eliminados obtenidos exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getLotesTallaEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener lotes_talla eliminados' });
  }
};

// UPDATE - Restaurar lote_talla eliminado
export const restaurarLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const loteTalla: any = await LoteTalla.findByPk(id);

    if (!loteTalla) {
      res.status(404).json({ msg: 'LoteTalla no encontrado' });
      return;
    }

    // Cambiar estado a DISPONIBLE
    loteTalla.idestado = LoteEstado.DISPONIBLE;
    await loteTalla.save();

    res.json({ 
      msg: 'LoteTalla restaurado con éxito',
      data: { id: loteTalla.id, estado: LoteEstado.DISPONIBLE }
    });
  } catch (error) {
    console.error('Error en restaurarLoteTalla:', error);
    res.status(500).json({ msg: 'Error al restaurar el lote_talla' });
  }
};

// READ - Listar productos disponibles por talla y género (para catálogo)
export const getProductosDisponiblesPorTalla = async (req: Request, res: Response): Promise<void> => {
  const { idtalla, esGenero, idcategoria, idmarca } = req.query;

  try {
    // Construir condiciones de filtrado
    const whereConditions: any = {
      idestado: LoteEstado.DISPONIBLE,
      stock: { [Op.gt]: 0 } // Solo productos con stock disponible
    };

    if (idtalla) whereConditions.idtalla = idtalla;
    if (esGenero !== undefined) whereConditions.esGenero = esGenero;

    // Construir condiciones para las relaciones
    const includeLoteConditions: any = {
      model: Lote,
      as: 'Lote',
      where: { idestado: LoteEstado.DISPONIBLE },
      include: [
        {
          model: Producto,
          as: 'Producto',
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              where: idcategoria ? { id: idcategoria } : undefined,
              attributes: ['id', 'nombre'],
              required: !!idcategoria
            },
            {
              model: Marca,
              as: 'Marca',
              where: idmarca ? { id: idmarca } : undefined,
              attributes: ['id', 'nombre'],
              required: !!idmarca
            }
          ]
        }
      ]
    };

    const lotesTalla = await LoteTalla.findAll({
      where: whereConditions,
      include: [
        includeLoteConditions,
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [
        [{ model: Lote, as: 'Lote' }, { model: Producto, as: 'Producto' }, 'nombre', 'ASC']
      ]
    });

    res.json({
      msg: 'Productos disponibles por talla obtenidos exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getProductosDisponiblesPorTalla:', error);
    res.status(500).json({ msg: 'Error al obtener productos disponibles por talla' });
  }
};

// // READ - Listar productos disponibles con filtros (para página de ventas)
// export const getProductosDisponibles = async (req: Request, res: Response): Promise<void> => {
//   const { idcategoria, idmarca, esGenero, idtalla } = req.query;

//   try {
//     // Construir condiciones para lote_talla
//     const whereLoteTallaConditions: any = {
//       idestado: LoteEstado.DISPONIBLE,
//       stock: { [Op.gt]: 0 } // Solo productos con stock disponible
//     };

//     if (esGenero !== undefined) whereLoteTallaConditions.esGenero = esGenero;
//     if (idtalla) whereLoteTallaConditions.idtalla = idtalla;

//     // Construir condiciones para las relaciones
//     const includeLoteConditions: any = {
//       model: Lote,
//       as: 'Lote',
//       where: { idestado: LoteEstado.DISPONIBLE },
//       include: [
//         {
//           model: Producto,
//           as: 'Producto',
//           include: [
//             {
//               model: Categoria,
//               as: 'Categoria',
//               where: idcategoria ? { id: idcategoria } : undefined,
//               attributes: ['id', 'nombre'],
//               required: !!idcategoria
//             },
//             {
//               model: Marca,
//               as: 'Marca',
//               where: idmarca ? { id: idmarca } : undefined,
//               attributes: ['id', 'nombre'],
//               required: !!idmarca
//             }
//           ]
//         }
//       ]
//     };

//     const lotesTalla = await LoteTalla.findAll({
//       where: whereLoteTallaConditions,
//       include: [
//         includeLoteConditions,
//         { 
//           model: Talla, 
//           as: 'Talla',
//           attributes: ['id', 'nombre'] 
//         }
//       ],
//       order: [
//         [{ model: Lote, as: 'Lote' }, { model: Producto, as: 'Producto' }, 'nombre', 'ASC'],
//         ['idtalla', 'ASC']
//       ]
//     });

//     res.json({
//       msg: 'Productos disponibles obtenidos exitosamente',
//       data: lotesTalla
//     });
//   } catch (error) {
//     console.error('Error en getProductosDisponibles:', error);
//     res.status(500).json({ msg: 'Error al obtener productos disponibles' });
//   }
// };

// READ - Listar productos disponibles con filtros (OPTIMIZADO)
export const getProductosDisponibles = async (req: Request, res: Response): Promise<void> => {
  const { idcategoria, idmarca, esGenero, idtalla, nombre, minPrecio, maxPrecio, page = 1, limit = 12 } = req.query;

  try {
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    // Construir condiciones
    const whereConditions: any = {
      idestado: LoteEstado.DISPONIBLE,
      stock: { [Op.gt]: 0 }
    };

    if (minPrecio) whereConditions.precioventa = { ...whereConditions.precioventa, [Op.gte]: parseFloat(minPrecio as string) };
    if (maxPrecio) whereConditions.precioventa = { ...whereConditions.precioventa, [Op.lte]: parseFloat(maxPrecio as string) };
    if (esGenero !== undefined) whereConditions.esGenero = esGenero;
    if (idtalla) whereConditions.idtalla = idtalla;

    // Primero obtener los IDs de productos que cumplen con los filtros
    const lotesTallaIds = await LoteTalla.findAll({
      where: whereConditions,
      include: [
        {
          model: Lote,
          as: 'Lote',
          where: { idestado: LoteEstado.DISPONIBLE },
          include: [
            {
              model: Producto,
              as: 'Producto',
              where: nombre ? { nombre: { [Op.like]: `%${nombre}%` } } : undefined,
              include: [
                {
                  model: Categoria,
                  as: 'Categoria',
                  where: idcategoria ? { id: idcategoria } : undefined,
                  required: !!idcategoria
                },
                {
                  model: Marca,
                  as: 'Marca',
                  where: idmarca ? { id: idmarca } : undefined,
                  required: !!idmarca
                }
              ]
            }
          ]
        }
      ],
      attributes: ['id'],
      limit: limitNumber,
      offset: offset
    });

    const ids = lotesTallaIds.map(item => item.id);

    // Ahora obtener los datos completos solo para esos IDs
    const lotesTalla = await LoteTalla.findAll({
      where: {
        id: { [Op.in]: ids },
        ...whereConditions
      },
      include: [
        {
          model: Lote,
          as: 'Lote',
          include: [
            {
              model: Producto,
              as: 'Producto',
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
          ]
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [
        [{ model: Lote, as: 'Lote' }, { model: Producto, as: 'Producto' }, 'nombre', 'ASC'],
        ['idtalla', 'ASC']
      ]
    });

    // Obtener total para paginación
    const total = await LoteTalla.count({
  where: whereConditions,
  include: [
    {
      model: Lote,
      as: 'Lote',
      where: { idestado: LoteEstado.DISPONIBLE },
      include: [
        {
          model: Producto,
          as: 'Producto',
          where: nombre ? { nombre: { [Op.like]: `%${nombre}%` } } : undefined,
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              where: idcategoria ? { id: idcategoria } : undefined,
              required: !!idcategoria
            },
            {
              model: Marca,
              as: 'Marca',
              where: idmarca ? { id: idmarca } : undefined,
              required: !!idmarca
            }
          ]
        }
      ]
    }
  ],
  distinct: true,
  col: 'id'   // ✅ Ajuste aquí
});


    // Transformar datos
    const productosTransformados = lotesTalla.map(item => ({
      id: item.id,
      producto_id: item.Lote?.Producto?.id,
      nombre: item.Lote?.Producto?.nombre,
      imagen: item.Lote?.Producto?.imagen,
      categoria: item.Lote?.Producto?.Categoria,
      marca: item.Lote?.Producto?.Marca,
      talla: item.Talla,
      genero: item.esGenero,
      precio: item.precioventa,
      stock: item.stock,
    }));

    res.json({
      msg: 'Productos disponibles obtenidos exitosamente',
      data: productosTransformados,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems: total,
        itemsPerPage: limitNumber
      }
    });
  } catch (error) {
    console.error('Error en getProductosDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener productos disponibles' });
  }
};


// GET - Obtener tallas disponibles para un producto específico (Versión simplificada)
export const getTallasDisponibles = async (req: Request, res: Response): Promise<void> => {
  const { productoId, genero } = req.query;

  try {
    // Validaciones
    if (!productoId || typeof productoId !== 'string') {
      res.status(400).json({ msg: 'El ID del producto es requerido' });
      return;
    }

    const productoIdNumero = parseInt(productoId);
    if (isNaN(productoIdNumero)) {
      res.status(400).json({ msg: 'El ID del producto debe ser un número válido' });
      return;
    }

    // Construir objeto where de forma explícita
    const whereOptions: any = {
      idestado: LoteEstado.DISPONIBLE,
      stock: { [Op.gt]: 0 }
    };

    // Agregar filtro de género si está presente
    if (genero && typeof genero === 'string' && !isNaN(parseInt(genero))) {
      whereOptions.esGenero = parseInt(genero);
    }

    const tallas = await LoteTalla.findAll({
      where: whereOptions,
      include: [
        {
          model: Lote,
          as: 'Lote',
          where: { 
            idproducto: productoIdNumero,
            idestado: LoteEstado.DISPONIBLE 
          },
          include: [
            {
              model: Producto,
              as: 'Producto',
              attributes: ['id', 'nombre','imagen'] // Solo los atributos necesarios
            }
          ]
        },
        {
          model: Talla,
          as: 'Talla',
          attributes: ['id', 'nombre'] // Solo los atributos necesarios
        }
      ],
      attributes: ['id', 'stock', 'precioventa' ,'preciocosto'],
      order: [[{ model: Talla, as: 'Talla' }, 'nombre', 'ASC']]
    });

    res.json({
      msg: 'Tallas disponibles obtenidas exitosamente',
      data: tallas
    });
  } catch (error) {
    console.error('Error en getTallasDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener tallas disponibles' });
  }
};

// GET - Verificar stock en tiempo real
export const verificarStock = async (req: Request, res: Response): Promise<void> => {
  const { loteTallaId, cantidad } = req.query;

  try {
    const loteTalla = await LoteTalla.findByPk(loteTallaId as string, {
      attributes: ['id', 'stock', 'precioventa']
    });

    if (!loteTalla) {
      res.status(404).json({ msg: 'Producto no encontrado' });
      return;
    }

    const stockDisponible = loteTalla.stock || 0;
    const cantidadSolicitada = parseInt(cantidad as string) || 1;

    res.json({
      msg: 'Stock verificado exitosamente',
      data: {
        disponible: stockDisponible >= cantidadSolicitada,
        stockActual: stockDisponible,
        puedeComprar: stockDisponible >= cantidadSolicitada
      }
    });
  } catch (error) {
    console.error('Error en verificarStock:', error);
    res.status(500).json({ msg: 'Error al verificar stock' });
  }
};

// UPDATE - Agregar stock a un detalle de lote_talla específico
export const agregarStockPorLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { idLoteTalla, cantidad } = req.body;

  const transaction = await sequelize.transaction(); // 🔹 iniciamos transacción

  try {
    // Validaciones iniciales
    if (!idLoteTalla || cantidad === undefined) {
      res.status(400).json({ msg: 'Los campos idLoteTalla y cantidad son obligatorios' });
      return;
    }

    if (cantidad <= 0) {
      res.status(400).json({ msg: 'La cantidad debe ser un valor positivo' });
      return;
    }

    // Buscar el detalle de lote_talla existente con sus relaciones
    const loteTalla = await LoteTalla.findByPk(idLoteTalla, {
      include: [
        { model: Talla, as: 'Talla', attributes: ['id', 'nombre'] },
        {
          model: Lote,
          as: 'Lote',
          include: [{ model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }]
        },
        { model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }
      ],
      transaction
    });

    if (!loteTalla) {
      await transaction.rollback();
      res.status(404).json({ msg: 'El detalle de lote-talla no existe' });
      return;
    }

    // Verificar que el lote esté disponible
    if (loteTalla.Lote?.idestado !== LoteEstado.DISPONIBLE) {
      await transaction.rollback();
      res.status(400).json({ msg: 'No se puede agregar stock a un lote no disponible' });
      return;
    }

    // Verificar que el detalle de lote-talla esté disponible
    if (loteTalla.idestado !== LoteEstado.DISPONIBLE) {
      await transaction.rollback();
      res.status(400).json({ msg: 'No se puede agregar stock a un detalle no disponible' });
      return;
    }

    // 🔹 Incrementar stock de forma segura
    await loteTalla.increment('stock', { by: cantidad, transaction });

    // Crear movimiento de ingreso
    const nuevoMovimiento: any = await MovimientoLote.create({
      idlote_talla: idLoteTalla,
      tipomovimiento: TipoMovimientoLote.ENTRADA,
      cantidad,
      fechamovimiento: moment().tz("America/Lima").toDate(),
      idestado: EstadoGeneral.REGISTRADO
    }, { transaction });

    // Confirmar la transacción
    await transaction.commit();

    // Obtener el movimiento creado con sus relaciones
    const movimientoCreado = await MovimientoLote.findByPk(nuevoMovimiento.id, {
      include: [
        {
          model: LoteTalla,
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            { model: Talla, as: 'Talla', attributes: ['id', 'nombre'] },
            {
              model: Lote,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [{ model: Producto, as: 'Producto', attributes: ['id', 'nombre'] }]
            }
          ]
        },
        { model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }
      ]
    });

    // Obtener el detalle actualizado
    const loteTallaActualizado = await LoteTalla.findByPk(idLoteTalla, {
      include: [
        { model: Talla, as: 'Talla', attributes: ['id', 'nombre'] },
        {
          model: Lote,
          as: 'Lote',
          include: [
            { model: Producto, as: 'Producto', attributes: ['id', 'nombre'] },
            { model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }
          ]
        },
        { model: Estado, as: 'Estado', attributes: ['id', 'nombre'] }
      ]
    });

    res.status(200).json({
      msg: 'Stock agregado exitosamente',
      idLoteTalla,
      idMovimiento: nuevoMovimiento.id,
      data: {
        loteTalla: loteTallaActualizado,
        movimiento: movimientoCreado
      }
    });

  } catch (error: any) {
    await transaction.rollback();
    console.error('Error en agregarStockPorLoteTalla:', error.message, error.stack);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Obtener productos en formato similar al servicio (valores estáticos)
// export const getProductosFormatoService = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Obtener productos con sus relaciones
//     const productos = await Producto.findAll({
//       where: { idestado: EstadoGeneral.REGISTRADO },
//       include: [
//         {
//           model: Categoria,
//           as: 'Categoria',
//           attributes: ['id', 'nombre']
//         },
//         {
//           model: Marca,
//           as: 'Marca',
//           attributes: ['id', 'nombre']
//         },
//         {
//           model: Lote,
//           as: 'Lotes',
//           where: { idestado: LoteEstado.DISPONIBLE },
//           required: false,
//           include: [
//             {
//               model: LoteTalla,
//               as: 'LoteTallas',
//               where: { idestado: LoteEstado.DISPONIBLE, stock: { [Op.gt]: 0 } },
//               required: false,
//               include: [
//                 {
//                   model: Talla,
//                   as: 'Talla',
//                   attributes: ['id', 'nombre']
//                 }
//               ]
//             }
//           ]
//         }
//       ],
//       order: [['id', 'ASC']]
//     });

//     // Transformar los datos al formato del servicio
//     const productosFormateados = productos.map((producto: any, index: number) => {
//       // Obtener tallas disponibles
//       const tallasDisponibles = producto.Lotes?.flatMap((lote: any) =>
//         lote.LoteTallas?.map((lt: any) => lt.Talla?.nombre).filter(Boolean)
//       ).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) || [];

//       // Calcular stock total
//       const stockTotal = producto.Lotes?.reduce((total: number, lote: any) =>
//         total + (lote.LoteTallas?.reduce((subtotal: number, lt: any) => subtotal + (lt.stock || 0), 0) || 0), 0
//       ) || 0;

//       // Obtener precio (usar el precio de venta del primer lote_talla disponible)
//       const precio = producto.Lotes?.[0]?.LoteTallas?.[0]?.precioventa || 0;

//       // Generar colores basados en la marca (simulación)
//       const coloresPorMarca: { [key: string]: string[] } = {
//         'Nike': ['Blanco', 'Negro', 'Azul'],
//         'Adidas': ['Blanco', 'Negro', 'Rojo'],
//         'Puma': ['Negro', 'Azul', 'Rosa'],
//         'Levi\'s': ['Azul', 'Negro', 'Gris'],
//         'H&M': ['Blanco', 'Rosa', 'Azul'],
//         'Zara': ['Beige', 'Azul', 'Negro']
//       };

//       const colores = coloresPorMarca[producto.Marca?.nombre] || ['Negro', 'Blanco', 'Gris'];

//       // Generar imágenes placeholder
//       const imagenes = [
//         `https://via.placeholder.com/400x300?text=${encodeURIComponent(producto.nombre || 'Producto')}+1`,
//         `https://via.placeholder.com/400x300?text=${encodeURIComponent(producto.nombre || 'Producto')}+2`,
//         `https://via.placeholder.com/400x300?text=${encodeURIComponent(producto.nombre || 'Producto')}+3`
//       ];

//       return {
//         id: producto.id || index + 1,
//         nombre: producto.nombre || 'Producto sin nombre',
//         marca: producto.Marca?.nombre || 'Sin marca',
//         precio: precio,
//         descripcion: producto.descripcion || `Descripción del producto ${producto.nombre}`,
//         imagenes: imagenes,
//         categoria: producto.Categoria?.nombre || 'Sin categoría',
//         genero: producto.Lotes?.[0]?.LoteTallas?.[0]?.esGenero === 1 ? 'Hombre' :
//                producto.Lotes?.[0]?.LoteTallas?.[0]?.esGenero === 2 ? 'Mujer' : 'Unisex',
//         tallas: tallasDisponibles.length > 0 ? tallasDisponibles : ['Única'],
//         colores: colores,
//         stock: stockTotal
//       };
//     });

//     res.json({
//       msg: 'Productos obtenidos en formato servicio exitosamente',
//       data: productosFormateados
//     });
//   } catch (error) {
//     console.error('Error en getProductosFormatoService:', error);
//     res.status(500).json({ msg: 'Error al obtener productos en formato servicio' });
//   }
// };
export const getProductosFormatoService = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener productos disponibles siguiendo el patrón de consultas existentes
    const lotesTalla = await LoteTalla.findAll({
      where: {
        idestado: LoteEstado.DISPONIBLE,
        stock: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Lote,
          as: 'Lote',
          where: { idestado: LoteEstado.DISPONIBLE },
          include: [
            {
              model: Producto,
              as: 'Producto',
              where: { idestado: [EstadoGeneral.REGISTRADO, EstadoGeneral.ACTUALIZADO] },
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
          ]
        },
        {
          model: Talla,
          as: 'Talla',
          attributes: ['id', 'nombre']
        }
      ],
      order: [
        [{ model: Lote, as: 'Lote' }, { model: Producto, as: 'Producto' }, 'nombre', 'ASC']
      ]
    });

    // Agrupar por producto para evitar duplicados
    const productosMap = new Map();

    lotesTalla.forEach((item: any) => {
      const producto = item.Lote?.Producto;
      if (!producto) return;

      const productoId = producto.id;

      if (!productosMap.has(productoId)) {
        // Generar colores basados en la marca (simulación)
        const coloresPorMarca: { [key: string]: string[] } = {
          'Nike': ['Blanco', 'Negro', 'Azul'],
          'Adidas': ['Blanco', 'Negro', 'Rojo'],
          'Puma': ['Negro', 'Azul', 'Rosa'],
          'Levi\'s': ['Azul', 'Negro', 'Gris'],
          'H&M': ['Blanco', 'Rosa', 'Azul'],
          'Zara': ['Beige', 'Azul', 'Negro']
        };

        const colores = coloresPorMarca[producto.Marca?.nombre] || ['Negro', 'Blanco', 'Gris'];

        // Generar imágenes placeholder
        const imagenes = [
         producto.imagen || 'Producto'
        ];

        productosMap.set(productoId, {
          id: producto.id,
          nombre: producto.nombre || 'Producto sin nombre',
          marca: producto.Marca?.nombre || 'Sin marca',
          precio: item.precioventa || 0,
          preciosPorTalla: {}, // Nuevo campo para precios por talla
          descripcion: producto.descripcion || `Descripción del producto ${producto.nombre}`,
          imagenes: imagenes,
          categoria: producto.Categoria?.nombre || 'Sin categoría',
          genero: item.esGenero === 1 ? 'Hombre' : item.esGenero === 2 ? 'Mujer' : 'Unisex',
          tallas: [],
          colores: colores,
          stock: 0
        });
      }

      // Agregar talla y precio por talla si no existe
      const productoData = productosMap.get(productoId);
      if (item.Talla?.nombre && !productoData.tallas.includes(item.Talla.nombre)) {
        productoData.tallas.push(item.Talla.nombre);
        // Agregar precio por talla usando preciocosto
        productoData.preciosPorTalla[item.Talla.nombre] = item.precioVenta || 0;
      }

      // Sumar stock
      productoData.stock += item.stock || 0;
    });

    // Convertir el mapa a array
    const productosFormateados = Array.from(productosMap.values());

    res.json({
      msg: 'Productos obtenidos en formato servicio exitosamente',
      data: productosFormateados
    });
  } catch (error) {
    console.error('Error en getProductosFormatoService:', error);
    res.status(500).json({ msg: 'Error al obtener productos en formato servicio' });
  }
};


// UPDATE OR CREATE MULTIPLE - Crear o actualizar múltiples lote_talla
export const updateOrCreateMultipleLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { lotesTalla } = req.body; // Array de objetos lote_talla a procesar

  try {
    if (!lotesTalla || !Array.isArray(lotesTalla) || lotesTalla.length === 0) {
      res.status(400).json({ msg: "El array de lotes_talla es obligatorio" });
      return;
    }

    const resultados = [];
    const errores = [];

    for (const item of lotesTalla) {
      try {
        const { id, idlote, idtalla, stock, esGenero, preciocosto, precioventa } = item;

        // VALIDACIONES OBLIGATORIAS
        if (!idlote) {
          errores.push({ item, error: "El idlote es obligatorio" });
          continue;
        }

        if (!idtalla) {
          errores.push({ item, error: "El idtalla es obligatorio" });
          continue;
        }

        if (esGenero === undefined) {
          errores.push({ item, error: "El campo esGenero es obligatorio" });
          continue;
        }

        // Verificar si existe el lote
        const lote = await Lote.findByPk(idlote);
        if (!lote) {
          errores.push({ item, error: 'El lote no existe' });
          continue;
        }

        // Verificar si existe la talla
        const talla = await Talla.findByPk(idtalla);
        if (!talla) {
          errores.push({ item, error: 'La talla no existe' });
          continue;
        }

        let loteTalla: LoteTalla | null = null;
        let esNuevo = false;

        if (id) {
          // ========== ACTUALIZACIÓN ==========
          // Buscar registro existente
          loteTalla = await LoteTalla.findByPk(id);
          if (!loteTalla) {
            errores.push({ item, error: `No existe un lote_talla con el id ${id}` });
            continue;
          }

          // Verificar duplicados SOLO para actualizaciones
          const whereClause: any = {
            id: { [Op.ne]: id }, // Excluir el registro actual
            idlote,
            idtalla,
            esGenero,
            idestado: { [Op.ne]: LoteEstado.ELIMINADO }
          };

          const loteTallaExistente = await LoteTalla.findOne({ where: whereClause });

          if (loteTallaExistente) {
            errores.push({ 
              item, 
              error: 'Ya existe otro registro con la misma talla y género para este lote' 
            });
            continue;
          }

          // Actualizar campos (EXCLUYENDO el stock para actualizaciones)
          if (preciocosto !== undefined) loteTalla.preciocosto = preciocosto;
          if (precioventa !== undefined) loteTalla.precioventa = precioventa;
          
          // Cambiar estado a DISPONIBLE si no está eliminado
          if (loteTalla.idestado !== LoteEstado.ELIMINADO) {
            loteTalla.idestado = LoteEstado.DISPONIBLE;
          }

        } else {
          // ========== CREACIÓN ==========
          esNuevo = true;
          
          // Validar que el stock esté presente para nuevos registros
          if (stock === undefined || stock === null) {
            errores.push({ item, error: "El stock es obligatorio para nuevos registros" });
            continue;
          }

          // Verificar duplicados SOLO para creaciones (sin excluir ningún ID)
          const whereClause: any = {
            idlote,
            idtalla,
            esGenero,
            idestado: { [Op.ne]: LoteEstado.ELIMINADO }
          };

          const loteTallaExistente = await LoteTalla.findOne({ where: whereClause });

          if (loteTallaExistente) {
            errores.push({ 
              item, 
              error: 'Ya existe un registro con la misma talla y género para este lote' 
            });
            continue;
          }

          // Crear nuevo registro
          loteTalla = await LoteTalla.create({
            idlote,
            idtalla,
            stock: stock || 0,
            esGenero,
            preciocosto: preciocosto || 0,
            precioventa: precioventa || 0,
            idestado: LoteEstado.DISPONIBLE
          });

          // Registrar movimiento de ENTRADA por el stock inicial
          if (stock && stock > 0) {
            await MovimientoLote.create({
              idlote_talla: loteTalla.id,
              tipomovimiento: TipoMovimientoLote.ENTRADA,
              cantidad: Number(stock),
              fechamovimiento: moment().tz("America/Lima").toDate(),
              idestado: EstadoGeneral.REGISTRADO
            });
          }
        }

        await loteTalla.save();

        // Obtener el lote_talla actualizado/creado con relaciones
        const loteTallaCompleto = await LoteTalla.findByPk(loteTalla.id, {
          include: [
            { 
              model: Lote, 
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
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
              ]
            },
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
          ]
        });

        // Verificar que loteTallaCompleto no sea null antes de usarlo
        if (!loteTallaCompleto) {
          errores.push({ item, error: "Error al recuperar el registro después de guardar" });
          continue;
        }

        resultados.push({
          ...loteTallaCompleto.toJSON(),
          accion: esNuevo ? 'creado' : 'actualizado'
        });

      } catch (error) {
        console.error(`Error procesando lote_talla ${item.id || 'nuevo'}:`, error);
        errores.push({ item, error: "Error interno al procesar el registro" });
      }
    }

    if (errores.length > 0) {
      res.status(207).json({ // 207 Multi-Status
        msg: "Algunos registros no se pudieron procesar",
        data: resultados,
        errores: errores,
        total: lotesTalla.length,
        exitosos: resultados.length,
        fallidos: errores.length
      });
    } else {
      res.json({
        msg: "Todos los lote_talla fueron procesados con éxito",
        data: resultados,
        total: resultados.length
      });
    }

  } catch (error) {
    console.error("Error en updateOrCreateMultipleLoteTalla:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};
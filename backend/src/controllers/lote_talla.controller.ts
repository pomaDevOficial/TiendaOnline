import { Request, Response } from 'express';
import LoteTalla from '../models/lote_talla.model';
import Lote from '../models/lote.model';
import Talla from '../models/talla.model';
import Estado from '../models/estado.model';
import Producto from '../models/producto.model';
import Categoria from '../models/categoria.model';
import Marca from '../models/marca.model';
import { LoteEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

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

// READ - Listar productos disponibles con filtros (para página de ventas)
export const getProductosDisponibles = async (req: Request, res: Response): Promise<void> => {
  const { idcategoria, idmarca, esGenero, idtalla } = req.query;

  try {
    // Construir condiciones para lote_talla
    const whereLoteTallaConditions: any = {
      idestado: LoteEstado.DISPONIBLE,
      stock: { [Op.gt]: 0 } // Solo productos con stock disponible
    };

    if (esGenero !== undefined) whereLoteTallaConditions.esGenero = esGenero;
    if (idtalla) whereLoteTallaConditions.idtalla = idtalla;

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
      where: whereLoteTallaConditions,
      include: [
        includeLoteConditions,
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

    res.json({
      msg: 'Productos disponibles obtenidos exitosamente',
      data: lotesTalla
    });
  } catch (error) {
    console.error('Error en getProductosDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener productos disponibles' });
  }
};
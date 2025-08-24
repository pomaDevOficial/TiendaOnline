import { Request, Response } from 'express';
import MovimientoLote from '../models/movimiento_lote.model';
import LoteTalla from '../models/lote_talla.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Insertar nuevo movimiento de lote
export const createMovimientoLote = async (req: Request, res: Response): Promise<void> => {
  const { idlote_talla, tipomovimiento, cantidad, fechamovimiento } = req.body;

  try {
    // Validaciones
    if (!idlote_talla || !tipomovimiento || cantidad === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idlote_talla, tipomovimiento y cantidad son obligatorios' 
      });
      return;
    }

    // Verificar si existe el lote_talla
    const loteTalla = await LoteTalla.findByPk(idlote_talla);
    if (!loteTalla) {
      res.status(400).json({ msg: 'El lote_talla no existe' });
      return;
    }

    // Validar tipo de movimiento
    const tiposPermitidos = ['INGRESO', 'SALIDA', 'AJUSTE'];
    if (!tiposPermitidos.includes(tipomovimiento.toUpperCase())) {
      res.status(400).json({ 
        msg: 'Tipo de movimiento inválido. Debe ser: INGRESO, SALIDA o AJUSTE' 
      });
      return;
    }

    // Crear nuevo movimiento de lote
    const nuevoMovimiento: any = await MovimientoLote.create({
      idlote_talla,
      tipomovimiento: tipomovimiento.toUpperCase(),
      cantidad,
      fechamovimiento: fechamovimiento || new Date(),
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el movimiento creado con sus relaciones
    const movimientoCreado = await MovimientoLote.findByPk(nuevoMovimiento.id, {
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      ]
    });

    res.status(201).json({
      msg: 'Movimiento de lote creado exitosamente',
      data: movimientoCreado
    });
  } catch (error) {
    console.error('Error en createMovimientoLote:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar movimiento de lote
export const updateMovimientoLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idlote_talla, tipomovimiento, cantidad, fechamovimiento } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del movimiento es obligatorio" });
      return;
    }

    const movimiento: any = await MovimientoLote.findByPk(id);
    if (!movimiento) {
      res.status(404).json({ msg: `No existe un movimiento con el id ${id}` });
      return;
    }

    // Verificar si existe el lote_talla (si se está actualizando)
    if (idlote_talla) {
      const loteTalla = await LoteTalla.findByPk(idlote_talla);
      if (!loteTalla) {
        res.status(400).json({ msg: 'El lote_talla no existe' });
        return;
      }
    }

    // Validar tipo de movimiento (si se está actualizando)
    if (tipomovimiento) {
      const tiposPermitidos = ['INGRESO', 'SALIDA', 'AJUSTE'];
      if (!tiposPermitidos.includes(tipomovimiento.toUpperCase())) {
        res.status(400).json({ 
          msg: 'Tipo de movimiento inválido. Debe ser: INGRESO, SALIDA o AJUSTE' 
        });
        return;
      }
    }

    // Actualizar campos
    if (idlote_talla) movimiento.idlote_talla = idlote_talla;
    if (tipomovimiento) movimiento.tipomovimiento = tipomovimiento.toUpperCase();
    if (cantidad !== undefined) movimiento.cantidad = cantidad;
    if (fechamovimiento) movimiento.fechamovimiento = fechamovimiento;
    
    // Cambiar estado a ACTUALIZADO si no está eliminado
    if (movimiento.idestado !== EstadoGeneral.ELIMINADO) {
      movimiento.idestado = EstadoGeneral.ACTUALIZADO;
    }

    await movimiento.save();

    // Obtener el movimiento actualizado con relaciones
    const movimientoActualizado = await MovimientoLote.findByPk(id, {
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      ]
    });

    res.json({
      msg: "Movimiento de lote actualizado con éxito",
      data: movimientoActualizado
    });

  } catch (error) {
    console.error("Error en updateMovimientoLote:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los movimientos de lote
export const getMovimientosLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const movimientos = await MovimientoLote.findAll({
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      order: [['fechamovimiento', 'DESC']]
    });

    res.json({
      msg: 'Lista de movimientos obtenida exitosamente',
      data: movimientos
    });
  } catch (error) {
    console.error('Error en getMovimientosLote:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de movimientos' });
  }
};

// READ - Listar movimientos registrados/actualizados (no eliminados)
export const getMovimientosRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const movimientos = await MovimientoLote.findAll({
      where: { 
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } 
      },
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      order: [['fechamovimiento', 'DESC']]
    });

    res.json({
      msg: 'Movimientos registrados obtenidos exitosamente',
      data: movimientos
    });
  } catch (error) {
    console.error('Error en getMovimientosRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener movimientos registrados' });
  }
};

// READ - Obtener movimiento por ID
export const getMovimientoLoteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimiento = await MovimientoLote.findByPk(id, {
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      ]
    });

    if (!movimiento) {
      res.status(404).json({ msg: 'Movimiento no encontrado' });
      return;
    }

    res.json({
      msg: 'Movimiento obtenido exitosamente',
      data: movimiento
    });
  } catch (error) {
    console.error('Error en getMovimientoLoteById:', error);
    res.status(500).json({ msg: 'Error al obtener el movimiento' });
  }
};

// READ - Obtener movimientos por lote_talla
export const getMovimientosByLoteTalla = async (req: Request, res: Response): Promise<void> => {
  const { idlote_talla } = req.params;

  try {
    const movimientos = await MovimientoLote.findAll({
      where: { 
        idlote_talla,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } 
      },
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
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
      order: [['fechamovimiento', 'DESC']]
    });

    res.json({
      msg: 'Movimientos del lote_talla obtenidos exitosamente',
      data: movimientos
    });
  } catch (error) {
    console.error('Error en getMovimientosByLoteTalla:', error);
    res.status(500).json({ msg: 'Error al obtener movimientos del lote_talla' });
  }
};

// READ - Listar movimientos eliminados
export const getMovimientosEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const movimientos = await MovimientoLote.findAll({
      where: { idestado: EstadoGeneral.ELIMINADO },
      include: [
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso']
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fechamovimiento', 'DESC']]
    });

    res.json({
      msg: 'Movimientos eliminados obtenidos exitosamente',
      data: movimientos
    });
  } catch (error) {
    console.error('Error en getMovimientosEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener movimientos eliminados' });
  }
};

// DELETE - Eliminar movimiento (cambiar estado a eliminado)
export const deleteMovimientoLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimiento: any = await MovimientoLote.findByPk(id);

    if (!movimiento) {
      res.status(404).json({ msg: 'Movimiento no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    movimiento.idestado = EstadoGeneral.ELIMINADO;
    await movimiento.save();

    res.json({ 
      msg: 'Movimiento eliminado con éxito',
      data: { id: movimiento.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteMovimientoLote:', error);
    res.status(500).json({ msg: 'Error al eliminar el movimiento' });
  }
};

// UPDATE - Restaurar movimiento eliminado
export const restaurarMovimientoLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimiento: any = await MovimientoLote.findByPk(id);

    if (!movimiento) {
      res.status(404).json({ msg: 'Movimiento no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    movimiento.idestado = EstadoGeneral.REGISTRADO;
    await movimiento.save();

    res.json({ 
      msg: 'Movimiento restaurado con éxito',
      data: { id: movimiento.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarMovimientoLote:', error);
    res.status(500).json({ msg: 'Error al restaurar el movimiento' });
  }
};
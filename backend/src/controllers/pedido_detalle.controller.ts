import { Request, Response } from 'express';
import PedidoDetalle from '../models/pedido_detalle.model';
import Pedido from '../models/pedido.model';
import LoteTalla from '../models/lote_talla.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Insertar nuevo detalle de pedido
export const createPedidoDetalle = async (req: Request, res: Response): Promise<void> => {
  const { idpedido, idlote_talla, cantidad, precio, subtotal } = req.body;

  try {
    // Validaciones
    if (!idpedido || !idlote_talla || cantidad === undefined || precio === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idpedido, idlote_talla, cantidad y precio son obligatorios' 
      });
      return;
    }

    // Verificar si existe el pedido
    const pedido = await Pedido.findByPk(idpedido);
    if (!pedido) {
      res.status(400).json({ msg: 'El pedido no existe' });
      return;
    }

    // Verificar si existe el lote_talla
    const loteTalla = await LoteTalla.findByPk(idlote_talla);
    if (!loteTalla) {
      res.status(400).json({ msg: 'El lote_talla no existe' });
      return;
    }

    // Calcular subtotal si no se proporciona
    const calculatedSubtotal = subtotal || (cantidad * precio);

    // Crear nuevo detalle de pedido
    const nuevoDetalle: any = await PedidoDetalle.create({
      idpedido,
      idlote_talla,
      cantidad,
      precio,
      subtotal: calculatedSubtotal,
    });

    // Obtener el detalle creado con sus relaciones
    const detalleCreado = await PedidoDetalle.findByPk(nuevoDetalle.id, {
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte']
        },
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [
                {
                  model: LoteTalla.associations.Lote.target.associations.Producto.target,
                  as: 'Producto',
                  attributes: ['id', 'nombre']
                }
              ]
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      msg: 'Detalle de pedido creado exitosamente',
      data: detalleCreado
    });
  } catch (error) {
    console.error('Error en createPedidoDetalle:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// CREATE - Insertar múltiples detalles de pedido
export const createMultiplePedidoDetalle = async (req: Request, res: Response): Promise<void> => {
  const { detalles } = req.body;

  try {
    // Validaciones
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      res.status(400).json({ 
        msg: 'El campo detalles es obligatorio y debe ser un array no vacío' 
      });
      return;
    }

    const detallesCreados = [];

    for (const detalle of detalles) {
      const { idpedido, idlote_talla, cantidad, precio, subtotal } = detalle;

      // Validaciones para cada detalle
      if (!idpedido || !idlote_talla || cantidad === undefined || precio === undefined) {
        res.status(400).json({ 
          msg: 'Cada detalle debe tener idpedido, idlote_talla, cantidad y precio' 
        });
        return;
      }

      // Verificar si existe el pedido
      const pedido = await Pedido.findByPk(idpedido);
      if (!pedido) {
        res.status(400).json({ msg: `El pedido con id ${idpedido} no existe` });
        return;
      }

      // Verificar si existe el lote_talla
      const loteTalla = await LoteTalla.findByPk(idlote_talla);
      if (!loteTalla) {
        res.status(400).json({ msg: `El lote_talla con id ${idlote_talla} no existe` });
        return;
      }

      // Calcular subtotal si no se proporciona
      const calculatedSubtotal = subtotal || (cantidad * precio);

      // Crear nuevo detalle de pedido
      const nuevoDetalle: any = await PedidoDetalle.create({
        idpedido,
        idlote_talla,
        cantidad,
        precio,
        subtotal: calculatedSubtotal,
      });

      // Obtener el detalle creado con sus relaciones
      const detalleCreado = await PedidoDetalle.findByPk(nuevoDetalle.id, {
        include: [
          { 
            model: Pedido, 
            as: 'Pedido',
            attributes: ['id', 'fechaoperacion', 'totalimporte']
          },
          { 
            model: LoteTalla, 
            as: 'LoteTalla',
            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
            include: [
              {
                model: LoteTalla.associations.Lote.target,
                as: 'Lote',
                attributes: ['id', 'proveedor', 'fechaingreso'],
                include: [
                  {
                    model: LoteTalla.associations.Lote.target.associations.Producto.target,
                    as: 'Producto',
                    attributes: ['id', 'nombre']
                  }
                ]
              },
              {
                model: LoteTalla.associations.Talla.target,
                as: 'Talla',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      detallesCreados.push(detalleCreado);
    }

    res.status(201).json({
      msg: 'Detalles de pedido creados exitosamente',
      data: detallesCreados
    });
  } catch (error) {
    console.error('Error en createMultiplePedidoDetalle:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar detalle de pedido
export const updatePedidoDetalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idpedido, idlote_talla, cantidad, precio, subtotal } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del detalle es obligatorio" });
      return;
    }

    const detalle: any = await PedidoDetalle.findByPk(id);
    if (!detalle) {
      res.status(404).json({ msg: `No existe un detalle con el id ${id}` });
      return;
    }

    // Verificar si existe el pedido (si se está actualizando)
    if (idpedido) {
      const pedido = await Pedido.findByPk(idpedido);
      if (!pedido) {
        res.status(400).json({ msg: 'El pedido no existe' });
        return;
      }
    }

    // Verificar si existe el lote_talla (si se está actualizando)
    if (idlote_talla) {
      const loteTalla = await LoteTalla.findByPk(idlote_talla);
      if (!loteTalla) {
        res.status(400).json({ msg: 'El lote_talla no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idpedido) detalle.idpedido = idpedido;
    if (idlote_talla) detalle.idlote_talla = idlote_talla;
    if (cantidad !== undefined) detalle.cantidad = cantidad;
    if (precio !== undefined) detalle.precio = precio;
    
    // Calcular nuevo subtotal si cambió cantidad o precio
    if (cantidad !== undefined || precio !== undefined) {
      const newCantidad = cantidad !== undefined ? cantidad : detalle.cantidad;
      const newPrecio = precio !== undefined ? precio : detalle.precio;
      detalle.subtotal = newCantidad * newPrecio;
    } else if (subtotal !== undefined) {
      detalle.subtotal = subtotal;
    }

    await detalle.save();

    // Obtener el detalle actualizado con relaciones
    const detalleActualizado = await PedidoDetalle.findByPk(id, {
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte']
        },
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [
                {
                  model: LoteTalla.associations.Lote.target.associations.Producto.target,
                  as: 'Producto',
                  attributes: ['id', 'nombre']
                }
              ]
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });

    res.json({
      msg: "Detalle de pedido actualizado con éxito",
      data: detalleActualizado
    });

  } catch (error) {
    console.error("Error en updatePedidoDetalle:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los detalles de pedido
export const getPedidosDetalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalles = await PedidoDetalle.findAll({
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte']
        },
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [
                {
                  model: LoteTalla.associations.Lote.target.associations.Producto.target,
                  as: 'Producto',
                  attributes: ['id', 'nombre']
                }
              ]
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de detalles de pedido obtenida exitosamente',
      data: detalles
    });
  } catch (error) {
    console.error('Error en getPedidosDetalle:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de detalles' });
  }
};

// READ - Obtener detalle por ID
export const getPedidoDetalleById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalle = await PedidoDetalle.findByPk(id, {
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte']
        },
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [
                {
                  model: LoteTalla.associations.Lote.target.associations.Producto.target,
                  as: 'Producto',
                  attributes: ['id', 'nombre']
                }
              ]
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });

    if (!detalle) {
      res.status(404).json({ msg: 'Detalle de pedido no encontrado' });
      return;
    }

    res.json({
      msg: 'Detalle de pedido obtenido exitosamente',
      data: detalle
    });
  } catch (error) {
    console.error('Error en getPedidoDetalleById:', error);
    res.status(500).json({ msg: 'Error al obtener el detalle' });
  }
};

// READ - Obtener detalles por pedido
export const getDetallesByPedido = async (req: Request, res: Response): Promise<void> => {
  const { idpedido } = req.params;

  try {
    const detalles = await PedidoDetalle.findAll({
      where: { idpedido },
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte']
        },
        { 
          model: LoteTalla, 
          as: 'LoteTalla',
          attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
          include: [
            {
              model: LoteTalla.associations.Lote.target,
              as: 'Lote',
              attributes: ['id', 'proveedor', 'fechaingreso'],
              include: [
                {
                  model: LoteTalla.associations.Lote.target.associations.Producto.target,
                  as: 'Producto',
                  attributes: ['id', 'nombre','imagen']
                }
              ]
            },
            {
              model: LoteTalla.associations.Talla.target,
              as: 'Talla',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Detalles del pedido obtenidos exitosamente',
      data: detalles
    });
  } catch (error) {
    console.error('Error en getDetallesByPedido:', error);
    res.status(500).json({ msg: 'Error al obtener detalles del pedido' });
  }
};

// DELETE - Eliminar detalle de pedido
export const deletePedidoDetalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalle: any = await PedidoDetalle.findByPk(id);

    if (!detalle) {
      res.status(404).json({ msg: 'Detalle de pedido no encontrado' });
      return;
    }

    // Eliminar físicamente el detalle (no se usa eliminación lógica aquí)
    await detalle.destroy();

    res.json({ 
      msg: 'Detalle de pedido eliminado con éxito',
      data: { id }
    });
  } catch (error) {
    console.error('Error en deletePedidoDetalle:', error);
    res.status(500).json({ msg: 'Error al eliminar el detalle' });
  }
};

// DELETE - Eliminar múltiples detalles de pedido
export const deleteMultiplePedidoDetalle = async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;

  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ 
        msg: 'El campo ids es obligatorio y debe ser un array no vacío' 
      });
      return;
    }

    // Eliminar físicamente los detalles
    await PedidoDetalle.destroy({
      where: {
        id: ids
      }
    });

    res.json({ 
      msg: 'Detalles de pedido eliminados con éxito',
      data: { ids }
    });
  } catch (error) {
    console.error('Error en deleteMultiplePedidoDetalle:', error);
    res.status(500).json({ msg: 'Error al eliminar los detalles' });
  }
};
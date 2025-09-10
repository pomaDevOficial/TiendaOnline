import { Request, Response } from 'express';
import DetalleVenta from '../models/detalle_venta.model';
import PedidoDetalle from '../models/pedido_detalle.model';
import Venta from '../models/venta.model';
import Estado from '../models/estado.model';
import { VentaEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';
import moment from 'moment-timezone';

// CREATE - Insertar nuevo detalle de venta
export const createDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = req.body;

  try {
    // Validaciones
    if (!idpedidodetalle || !idventa || precio_venta_real === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idpedidodetalle, idventa y precio_venta_real son obligatorios' 
      });
      return;
    }

    // Verificar si existe el detalle de pedido
    const pedidoDetalle = await PedidoDetalle.findByPk(idpedidodetalle);
    if (!pedidoDetalle) {
      res.status(400).json({ msg: 'El detalle de pedido no existe' });
      return;
    }

    // Verificar si existe la venta
    const venta = await Venta.findByPk(idventa);
    if (!venta) {
      res.status(400).json({ msg: 'La venta no existe' });
      return;
    }

    // Calcular subtotal_real si no se proporciona
    let calculatedSubtotal = subtotal_real;
    if (subtotal_real === undefined && pedidoDetalle.cantidad !== null) {
      calculatedSubtotal = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
    } else if (subtotal_real === undefined) {
      res.status(400).json({ 
        msg: 'El campo subtotal_real es obligatorio cuando cantidad es null' 
      });
      return;
    }

    // Crear nuevo detalle de venta
    const nuevoDetalleVenta: any = await DetalleVenta.create({
      idpedidodetalle,
      idventa,
      precio_venta_real,
      subtotal_real: calculatedSubtotal,
      idestado: VentaEstado.REGISTRADO
    });

    // Obtener el detalle de venta creado con sus relaciones
    const detalleVentaCreado = await DetalleVenta.findByPk(nuevoDetalleVenta.id, {
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre','imagen']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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
      msg: 'Detalle de venta creado exitosamente',
      data: detalleVentaCreado
    });
  } catch (error) {
    console.error('Error en createDetalleVenta:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// CREATE - Insertar múltiples detalles de venta
export const createMultipleDetalleVenta = async (req: Request, res: Response): Promise<void> => {
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
      const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = detalle;

      // Validaciones para cada detalle
      if (!idpedidodetalle || !idventa || precio_venta_real === undefined) {
        res.status(400).json({ 
          msg: 'Cada detalle debe tener idpedidodetalle, idventa y precio_venta_real' 
        });
        return;
      }

      // Verificar si existe el detalle de pedido
      const pedidoDetalle = await PedidoDetalle.findByPk(idpedidodetalle);
      if (!pedidoDetalle) {
        res.status(400).json({ msg: `El detalle de pedido con id ${idpedidodetalle} no existe` });
        return;
      }

      // Verificar si existe la venta
      const venta = await Venta.findByPk(idventa);
      if (!venta) {
        res.status(400).json({ msg: `La venta con id ${idventa} no existe` });
        return;
      }

      // Calcular subtotal_real si no se proporciona
      let calculatedSubtotal = subtotal_real;
      if (subtotal_real === undefined && pedidoDetalle.cantidad !== null) {
        calculatedSubtotal = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
      } else if (subtotal_real === undefined) {
        res.status(400).json({ 
          msg: 'El campo subtotal_real es obligatorio cuando cantidad es null' 
        });
        return;
      }

      // Crear nuevo detalle de venta
      const nuevoDetalleVenta: any = await DetalleVenta.create({
        idpedidodetalle,
        idventa,
        precio_venta_real,
        subtotal_real: calculatedSubtotal,
        idestado: VentaEstado.REGISTRADO
      });

      // Obtener el detalle de venta creado con sus relaciones
      const detalleVentaCreado = await DetalleVenta.findByPk(nuevoDetalleVenta.id, {
        include: [
          { 
            model: PedidoDetalle, 
            as: 'PedidoDetalle',
            attributes: ['id', 'cantidad', 'precio', 'subtotal'],
            include: [
              {
                model: PedidoDetalle.associations.LoteTalla.target,
                as: 'LoteTalla',
                attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                include: [
                  {
                    model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                    as: 'Lote',
                    attributes: ['id', 'proveedor', 'fechaingreso'],
                    include: [
                      {
                        model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                        as: 'Producto',
                        attributes: ['id', 'nombre']
                      }
                    ]
                  },
                  {
                    model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                    as: 'Talla',
                    attributes: ['id', 'nombre']
                  }
                ]
              }
            ]
          },
          { 
            model: Venta, 
            as: 'Venta',
            attributes: ['id', 'fechaventa']
          },
          { 
            model: Estado, 
            as: 'Estado',
            attributes: ['id', 'nombre'] 
          }
        ]
      });

      detallesCreados.push(detalleVentaCreado);
    }

    res.status(201).json({
      msg: 'Detalles de venta creados exitosamente',
      data: detallesCreados
    });
  } catch (error) {
    console.error('Error en createMultipleDetalleVenta:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar detalle de venta
export const updateDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del detalle de venta es obligatorio" });
      return;
    }

    const detalleVenta: any = await DetalleVenta.findByPk(id);
    if (!detalleVenta) {
      res.status(404).json({ msg: `No existe un detalle de venta con el id ${id}` });
      return;
    }

    // Verificar si existe el detalle de pedido (si se está actualizando)
    if (idpedidodetalle) {
      const pedidoDetalle = await PedidoDetalle.findByPk(idpedidodetalle);
      if (!pedidoDetalle) {
        res.status(400).json({ msg: 'El detalle de pedido no existe' });
        return;
      }
    }

    // Verificar si existe la venta (si se está actualizando)
    if (idventa) {
      const venta = await Venta.findByPk(idventa);
      if (!venta) {
        res.status(400).json({ msg: 'La venta no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idpedidodetalle) detalleVenta.idpedidodetalle = idpedidodetalle;
    if (idventa) detalleVenta.idventa = idventa;
    if (precio_venta_real !== undefined) detalleVenta.precio_venta_real = precio_venta_real;
    
    // Calcular nuevo subtotal_real si cambió precio_venta_real
    if (precio_venta_real !== undefined) {
      const pedidoDetalleId = idpedidodetalle || detalleVenta.idpedidodetalle;
      if (pedidoDetalleId) {
        const pedidoDetalle = await PedidoDetalle.findByPk(pedidoDetalleId);
        if (pedidoDetalle && pedidoDetalle.cantidad !== null) {
          detalleVenta.subtotal_real = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
        } else if (subtotal_real === undefined) {
          res.status(400).json({ 
            msg: 'El campo subtotal_real es obligatorio cuando cantidad es null' 
          });
          return;
        }
      }
    } else if (subtotal_real !== undefined) {
      detalleVenta.subtotal_real = subtotal_real;
    }

    await detalleVenta.save();

    // Obtener el detalle de venta actualizado con relaciones
    const detalleVentaActualizado = await DetalleVenta.findByPk(id, {
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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
      msg: "Detalle de venta actualizado con éxito",
      data: detalleVentaActualizado
    });

  } catch (error) {
    console.error("Error in updateDetalleVenta:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los detalles de venta
export const getDetallesVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const detallesVenta = await DetalleVenta.findAll({
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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
      msg: 'Lista de detalles de venta obtenida exitosamente',
      data: detallesVenta
    });
  } catch (error) {
    console.error('Error en getDetallesVenta:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de detalles de venta' });
  }
};

// READ - Listar detalles de venta registrados (no anulados)
export const getDetallesVentaRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const detallesVenta = await DetalleVenta.findAll({
      where: { 
        idestado: VentaEstado.REGISTRADO
      },
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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
      msg: 'Detalles de venta registrados obtenidos exitosamente',
      data: detallesVenta
    });
  } catch (error) {
    console.error('Error en getDetallesVentaRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener detalles de venta registrados' });
  }
};

// READ - Obtener detalle de venta por ID
export const getDetalleVentaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalleVenta = await DetalleVenta.findByPk(id, {
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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

    if (!detalleVenta) {
      res.status(404).json({ msg: 'Detalle de venta no encontrado' });
      return;
    }

    res.json({
      msg: 'Detalle de venta obtenido exitosamente',
      data: detalleVenta
    });
  } catch (error) {
    console.error('Error en getDetalleVentaById:', error);
    res.status(500).json({ msg: 'Error al obtener el detalle de venta' });
  }
};

// READ - Obtener detalles de venta por venta
export const getDetallesVentaByVenta = async (req: Request, res: Response): Promise<void> => {
  const { idventa } = req.params;

  try {
    const detallesVenta = await DetalleVenta.findAll({
      where: { idventa },
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                    ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte']
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
      msg: 'Detalles de la venta obtenidos exitosamente',
      data: detallesVenta
    });
  } catch (error) {
    console.error('Error en getDetallesVentaByVenta:', error);
    res.status(500).json({ msg: 'Error al obtener detalles de la venta' });
  }
};

// READ - Listar detalles de venta anulados
export const getDetallesVentaAnulados = async (req: Request, res: Response): Promise<void> => {
  try {
    const detallesVenta = await DetalleVenta.findAll({
      where: { idestado: VentaEstado.ANULADO },
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad', 'precio', 'subtotal'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id', 'proveedor', 'fechaingreso'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre']
                    }
                  ]
                },
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Talla.target,
                  as: 'Talla',
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa']
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Detalles de venta anulados obtenidos exitosamente',
      data: detallesVenta
    });
  } catch (error) {
    console.error('Error en getDetallesVentaAnulados:', error);
    res.status(500).json({ msg: 'Error al obtener detalles de venta anulados' });
  }
};

// UPDATE - Anular detalle de venta
export const anularDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalleVenta: any = await DetalleVenta.findByPk(id);
    if (!detalleVenta) {
      res.status(404).json({ msg: 'Detalle de venta no encontrado' });
      return;
    }

    detalleVenta.idestado = VentaEstado.ANULADO;
    await detalleVenta.save();

    res.json({ 
      msg: 'Detalle de venta anulado con éxito',
      data: { id: detalleVenta.id, estado: VentaEstado.ANULADO }
    });
  } catch (error) {
    console.error('Error en anularDetalleVenta:', error);
    res.status(500).json({ msg: 'Error al anular el detalle de venta' });
  }
};

// UPDATE - Restaurar detalle de venta anulado
export const restaurarDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalleVenta: any = await DetalleVenta.findByPk(id);

    if (!detalleVenta) {
      res.status(404).json({ msg: 'Detalle de venta no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    detalleVenta.idestado = VentaEstado.REGISTRADO;
    await detalleVenta.save();

    res.json({ 
      msg: 'Detalle de venta restaurado con éxito',
      data: { id: detalleVenta.id, estado: VentaEstado.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarDetalleVenta:', error);
    res.status(500).json({ msg: 'Error al restaurar el detalle de venta' });
  }
};

// DELETE - Eliminar detalle de venta físicamente
export const deleteDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const detalleVenta = await DetalleVenta.findByPk(id);

    if (!detalleVenta) {
      res.status(404).json({ msg: 'Detalle de venta no encontrado' });
      return;
    }

    // Eliminar físicamente
    await detalleVenta.destroy();

    res.json({ 
      msg: 'Detalle de venta eliminado con éxito',
      data: { id }
    });
  } catch (error) {
    console.error('Error en deleteDetalleVenta:', error);
    res.status(500).json({ msg: 'Error al eliminar el detalle de venta' });
  }
};

// ========================================
// MÉTODO PARA DETALLE VENTA CONTROLLER
// ========================================

// READ - Obtener productos más vendidos con filtro por mes
export const getProductosMasVendidos = async (req: Request, res: Response): Promise<void> => {
  const { año, mes, limite } = req.query;
  const tz = 'America/Lima';

  try {
    let whereCondition: any = {
      idestado: VentaEstado.REGISTRADO
    };

    // Condición de fechas
    let ventaWhereCondition: any = {};

    if (año && mes) {
      const monthStart = moment.tz(`${año}-${mes}`, 'YYYY-MM', tz).startOf('month').toDate();
      const monthEnd = moment.tz(`${año}-${mes}`, 'YYYY-MM', tz).endOf('month').toDate();

      ventaWhereCondition.fechaventa = {
        [Op.between]: [monthStart, monthEnd]
      };
    } else if (año) {
      const yearStart = moment.tz(`${año}`, 'YYYY', tz).startOf('year').toDate();
      const yearEnd = moment.tz(`${año}`, 'YYYY', tz).endOf('year').toDate();

      ventaWhereCondition.fechaventa = {
        [Op.between]: [yearStart, yearEnd]
      };
    }

    console.log('Filtro fechas:', ventaWhereCondition.fechaventa);

    const detallesVenta = await DetalleVenta.findAll({
      where: whereCondition,
      include: [
        { 
          model: PedidoDetalle, 
          as: 'PedidoDetalle',
          attributes: ['id', 'cantidad'],
          include: [
            {
              model: PedidoDetalle.associations.LoteTalla.target,
              as: 'LoteTalla',
              attributes: ['id'],
              include: [
                {
                  model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target,
                  as: 'Lote',
                  attributes: ['id'],
                  include: [
                    {
                      model: PedidoDetalle.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                      as: 'Producto',
                      attributes: ['id', 'nombre', 'imagen']
                    }
                  ]
                }
              ]
            }
          ]
        },
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          where: ventaWhereCondition
        }
      ],
      attributes: ['id', 'subtotal_real']
    });

    // Agrupar productos y calcular totales
    const productosVendidos: { 
      [key: string]: { 
        producto: any, 
        cantidadVendida: number, 
        totalVentas: number,
        totalIngresos: number 
      } 
    } = {};

    detallesVenta.forEach((detalle: any) => {
      const producto = detalle.PedidoDetalle?.LoteTalla?.Lote?.Producto;
      const cantidad = parseInt(detalle.PedidoDetalle?.cantidad || '0');
      const subtotal = parseFloat(detalle.subtotal_real || '0');

      if (producto) {
        const productoId = producto.id.toString();
        
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            producto: {
              id: producto.id,
              nombre: producto.nombre,
              imagen: producto.imagen
            },
            cantidadVendida: 0,
            totalVentas: 0,
            totalIngresos: 0
          };
        }

        productosVendidos[productoId].cantidadVendida += cantidad;
        productosVendidos[productoId].totalVentas += 1;
        productosVendidos[productoId].totalIngresos += subtotal;
      }
    });

    // Convertir a array y ordenar
    let ranking = Object.values(productosVendidos)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

    // Aplicar límite si existe
    if (limite) {
      const limiteNumero = parseInt(limite as string);
      ranking = ranking.slice(0, limiteNumero);
    }

    res.json({
      msg: 'Productos más vendidos obtenidos exitosamente',
      data: ranking,
      filtros: { año, mes, limite },
      total: ranking.length
    });
  } catch (error) {
    console.error('Error en getProductosMasVendidos:', error);
    res.status(500).json({ msg: 'Error al obtener productos más vendidos' });
  }
};
import { Request, Response } from 'express';
import Venta from '../models/venta.model';
import Usuario from '../models/usuario.model';
import Pedido from '../models/pedido.model';
import Estado from '../models/estado.model';
import { VentaEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Insertar nueva venta
export const createVenta = async (req: Request, res: Response): Promise<void> => {
  const { fechaventa, idusuario, idpedido } = req.body;

  try {
    // Validaciones
    if (!idusuario || !idpedido) {
      res.status(400).json({ 
        msg: 'Los campos idusuario e idpedido son obligatorios' 
      });
      return;
    }

    // Verificar si existe el usuario
    const usuario = await Usuario.findByPk(idusuario);
    if (!usuario) {
      res.status(400).json({ msg: 'El usuario no existe' });
      return;
    }

    // Verificar si existe el pedido
    const pedido = await Pedido.findByPk(idpedido);
    if (!pedido) {
      res.status(400).json({ msg: 'El pedido no existe' });
      return;
    }

    // Verificar si el pedido ya tiene una venta asociada
    const ventaExistente = await Venta.findOne({
      where: { idpedido }
    });

    if (ventaExistente) {
      res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
      return;
    }

    // Crear nueva venta
    const nuevaVenta: any = await Venta.create({
      fechaventa: fechaventa || new Date(),
      idusuario,
      idpedido,
      idestado: VentaEstado.REGISTRADO
    });

    // Obtener la venta creada con sus relaciones
    const ventaCreada = await Venta.findByPk(nuevaVenta.id, {
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      msg: 'Venta creada exitosamente',
      data: ventaCreada
    });
  } catch (error) {
    console.error('Error en createVenta:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar venta
export const updateVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fechaventa, idusuario, idpedido } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la venta es obligatorio" });
      return;
    }

    const venta: any = await Venta.findByPk(id);
    if (!venta) {
      res.status(404).json({ msg: `No existe una venta con el id ${id}` });
      return;
    }

    // Verificar si existe el usuario (si se está actualizando)
    if (idusuario) {
      const usuario = await Usuario.findByPk(idusuario);
      if (!usuario) {
        res.status(400).json({ msg: 'El usuario no existe' });
        return;
      }
    }

    // Verificar si existe el pedido (si se está actualizando)
    if (idpedido && idpedido !== venta.idpedido) {
      const pedido = await Pedido.findByPk(idpedido);
      if (!pedido) {
        res.status(400).json({ msg: 'El pedido no existe' });
        return;
      }

      // Verificar si el nuevo pedido ya tiene una venta asociada
      const ventaExistente = await Venta.findOne({
        where: { idpedido }
      });

      if (ventaExistente) {
        res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
        return;
      }
    }

    // Actualizar campos
    if (fechaventa) venta.fechaventa = fechaventa;
    if (idusuario) venta.idusuario = idusuario;
    if (idpedido) venta.idpedido = idpedido;

    await venta.save();

    // Obtener la venta actualizada con relaciones
    const ventaActualizada = await Venta.findByPk(id, {
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      msg: "Venta actualizada con éxito",
      data: ventaActualizada
    });

  } catch (error) {
    console.error("Error en updateVenta:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todas las ventas
export const getVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      order: [['fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Lista de ventas obtenida exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en getVentas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de ventas' });
  }
};

// READ - Listar ventas registradas (no anuladas)
export const getVentasRegistradas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await Venta.findAll({
      where: { 
        idestado: VentaEstado.REGISTRADO
      },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      order: [['fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Ventas registradas obtenidas exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en getVentasRegistradas:', error);
    res.status(500).json({ msg: 'Error al obtener ventas registradas' });
  }
};

// READ - Obtener venta por ID
export const getVentaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const venta = await Venta.findByPk(id, {
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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

    if (!venta) {
      res.status(404).json({ msg: 'Venta no encontrada' });
      return;
    }

    res.json({
      msg: 'Venta obtenida exitosamente',
      data: venta
    });
  } catch (error) {
    console.error('Error en getVentaById:', error);
    res.status(500).json({ msg: 'Error al obtener la venta' });
  }
};

// READ - Obtener ventas por usuario
export const getVentasByUsuario = async (req: Request, res: Response): Promise<void> => {
  const { idusuario } = req.params;

  try {
    const ventas = await Venta.findAll({
      where: { idusuario },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      order: [['fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Ventas del usuario obtenidas exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en getVentasByUsuario:', error);
    res.status(500).json({ msg: 'Error al obtener ventas del usuario' });
  }
};

// READ - Obtener ventas por pedido
export const getVentasByPedido = async (req: Request, res: Response): Promise<void> => {
  const { idpedido } = req.params;

  try {
    const ventas = await Venta.findAll({
      where: { idpedido },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
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
      order: [['fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Ventas del pedido obtenidas exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en getVentasByPedido:', error);
    res.status(500).json({ msg: 'Error al obtener ventas del pedido' });
  }
};

// READ - Listar ventas anuladas
export const getVentasAnuladas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await Venta.findAll({
      where: { idestado: VentaEstado.ANULADO },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'fechaoperacion', 'totalimporte'],
          include: [
            {
              model: Pedido.associations.Persona.target,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'dni']
            },
            {
              model: Pedido.associations.MetodoPago.target,
              as: 'MetodoPago',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Ventas anuladas obtenidas exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en getVentasAnuladas:', error);
    res.status(500).json({ msg: 'Error al obtener ventas anuladas' });
  }
};

// UPDATE - Cambiar estado de la venta (anular)
export const anularVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const venta: any = await Venta.findByPk(id);
    if (!venta) {
      res.status(404).json({ msg: 'Venta no encontrada' });
      return;
    }

    venta.idestado = VentaEstado.ANULADO;
    await venta.save();

    res.json({ 
      msg: 'Venta anulada con éxito',
      data: { id: venta.id, estado: VentaEstado.ANULADO }
    });
  } catch (error) {
    console.error('Error en anularVenta:', error);
    res.status(500).json({ msg: 'Error al anular la venta' });
  }
};

// UPDATE - Restaurar venta anulada
export const restaurarVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const venta: any = await Venta.findByPk(id);

    if (!venta) {
      res.status(404).json({ msg: 'Venta no encontrada' });
      return;
    }

    // Cambiar estado a REGISTRADO
    venta.idestado = VentaEstado.REGISTRADO;
    await venta.save();

    res.json({ 
      msg: 'Venta restaurada con éxito',
      data: { id: venta.id, estado: VentaEstado.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarVenta:', error);
    res.status(500).json({ msg: 'Error al restaurar la venta' });
  }
};
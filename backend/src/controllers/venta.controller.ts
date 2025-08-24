import { Request, Response } from 'express';
import Venta from '../models/venta.model';
import Usuario from '../models/usuario.model';
import Pedido from '../models/pedido.model';
import Estado from '../models/estado.model';
import Persona from '../models/persona.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Crear nueva venta
export const crearVenta = async (req: Request, res: Response): Promise<void> => {
  const { idusuario, idpedido, fechaventa, idestado } = req.body;

  try {
    // Validaciones
    if (!idusuario || !idpedido || !fechaventa) {
      res.status(400).json({ 
        msg: 'Los campos idusuario, idpedido y fechaventa son obligatorios' 
      });
      return;
    }

    // Verificar si el pedido ya tiene una venta asociada (excluyendo eliminados)
    const ventaExistente = await Venta.findOne({ 
      where: { 
        idpedido,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      } 
    });
    if (ventaExistente) {
      res.status(400).json({ msg: 'Este pedido ya tiene una venta registrada' });
      return;
    }

    // Verificar si el usuario existe y no está eliminado
    const usuarioExistente = await Usuario.findOne({ 
      where: { 
        id: idusuario,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      } 
    });
    if (!usuarioExistente) {
      res.status(404).json({ msg: 'El usuario no existe o ha sido eliminado' });
      return;
    }

    // Verificar si el pedido existe y no está eliminado
    const pedidoExistente = await Pedido.findOne({ 
      where: { 
        id: idpedido,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      } 
    });
    if (!pedidoExistente) {
      res.status(404).json({ msg: 'El pedido no existe o ha sido eliminado' });
      return;
    }

    const nuevaVenta = await Venta.create({
      idusuario,
      idpedido,
      fechaventa,
      idestado: idestado || EstadoGeneral.REGISTRADO
    });

    // Obtener la venta creada con sus relaciones
    const ventaCreada = await Venta.findByPk(nuevaVenta.id, {
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
    console.error('Error en crearVenta:', error);
    res.status(500).json({ msg: 'Ocurrió un error al crear la venta' });
  }
};

// READ - Listar todas las ventas (excluyendo eliminados)
export const obtenerVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await Venta.findAll({
      where: {
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
    console.error('Error en obtenerVentas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de ventas' });
  }
};

// READ - Listar ventas por estado (excluyendo eliminados)
export const obtenerVentasPorEstado = async (req: Request, res: Response): Promise<void> => {
  const { idestado } = req.params;

  try {
    const ventas = await Venta.findAll({
      where: { 
        [Op.and]: [
          { idestado: parseInt(idestado) },
          { idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } }
        ]
      },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
      msg: `Ventas con estado ${idestado} obtenidas exitosamente`,
      data: ventas
    });
  } catch (error) {
    console.error('Error en obtenerVentasPorEstado:', error);
    res.status(500).json({ msg: 'Error al obtener las ventas por estado' });
  }
};

// READ - Obtener venta por ID (incluye eliminados si se solicita específicamente)
export const obtenerVentaPorId = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { incluirEliminados } = req.query; // Opcional: ?incluirEliminados=true

  try {
    const whereCondition: any = { id };
    if (incluirEliminados !== 'true') {
      whereCondition.idestado = { [Op.ne]: EstadoGeneral.ELIMINADO };
    }

    const venta = await Venta.findOne({
      where: whereCondition,
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
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
    console.error('Error en obtenerVentaPorId:', error);
    res.status(500).json({ msg: 'Error al obtener la venta' });
  }
};

// UPDATE - Actualizar venta
export const actualizarVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idusuario, idpedido, fechaventa, idestado } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la venta es obligatorio" });
      return;
    }

    // Buscar venta excluyendo eliminados
    const venta = await Venta.findOne({
      where: {
        id,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      }
    });
    
    if (!venta) {
      res.status(404).json({ msg: `No existe una venta activa con el id ${id}` });
      return;
    }

    // Validar si el nuevo pedido ya tiene venta asociada (excluyendo eliminados)
    if (idpedido && idpedido !== venta.idpedido) {
      const ventaExistente = await Venta.findOne({ 
        where: { 
          idpedido,
          idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
        } 
      });
      if (ventaExistente && ventaExistente.id !== parseInt(id)) {
        res.status(400).json({ msg: 'Este pedido ya tiene una venta registrada' });
        return;
      }
    }

    // Validar si el usuario existe y no está eliminado
    if (idusuario && idusuario !== venta.idusuario) {
      const usuarioExistente = await Usuario.findOne({ 
        where: { 
          id: idusuario,
          idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
        } 
      });
      if (!usuarioExistente) {
        res.status(404).json({ msg: 'El usuario no existe o ha sido eliminado' });
        return;
      }
    }

    // Validar si el pedido existe y no está eliminado
    if (idpedido && idpedido !== venta.idpedido) {
      const pedidoExistente = await Pedido.findOne({ 
        where: { 
          id: idpedido,
          idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
        } 
      });
      if (!pedidoExistente) {
        res.status(404).json({ msg: 'El pedido no existe o ha sido eliminado' });
        return;
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    if (idusuario !== undefined) updateData.idusuario = idusuario;
    if (idpedido !== undefined) updateData.idpedido = idpedido;
    if (fechaventa !== undefined) updateData.fechaventa = fechaventa;
    if (idestado !== undefined) updateData.idestado = idestado;

    // Actualizar
    await Venta.update(updateData, { where: { id } });

    // Obtener la venta actualizada con relaciones
    const ventaActualizada = await Venta.findByPk(id, {
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
    console.error("Error en actualizarVenta:", error);
    res.status(500).json({ msg: "Ocurrió un error al actualizar la venta" });
  }
};

// UPDATE - Cambiar estado de venta
export const cambiarEstadoVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idestado } = req.body;

  try {
    if (!idestado) {
      res.status(400).json({ msg: "El nuevo estado es obligatorio" });
      return;
    }

    // Buscar venta excluyendo eliminados
    const venta = await Venta.findOne({
      where: {
        id,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      }
    });
    
    if (!venta) {
      res.status(404).json({ msg: 'Venta no encontrada' });
      return;
    }

    await Venta.update({ idestado }, { where: { id } });

    res.json({ 
      msg: 'Estado de venta actualizado con éxito',
      data: { id: parseInt(id), idestado }
    });
  } catch (error) {
    console.error('Error en cambiarEstadoVenta:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado de la venta' });
  }
};

// DELETE - Eliminar venta (marcar como eliminado)
export const eliminarVenta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Buscar venta excluyendo eliminados
    const venta = await Venta.findOne({
      where: {
        id,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      }
    });
    
    if (!venta) {
      res.status(404).json({ msg: 'Venta no encontrada o ya está eliminada' });
      return;
    }

    await Venta.update({ idestado: EstadoGeneral.ELIMINADO }, { where: { id } });

    res.json({ 
      msg: 'Venta marcada como eliminada',
      data: { id: parseInt(id), estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en eliminarVenta:', error);
    res.status(500).json({ msg: 'Error al eliminar la venta' });
  }
};

// READ - Obtener ventas por usuario (excluyendo eliminados)
export const obtenerVentasPorUsuario = async (req: Request, res: Response): Promise<void> => {
  const { idusuario } = req.params;

  try {
    const ventas = await Venta.findAll({
      where: { 
        idusuario: parseInt(idusuario),
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } // Excluir eliminados
      },
      include: [
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
      msg: `Ventas del usuario ${idusuario} obtenidas exitosamente`,
      data: ventas
    });
  } catch (error) {
    console.error('Error en obtenerVentasPorUsuario:', error);
    res.status(500).json({ msg: 'Error al obtener las ventas del usuario' });
  }
};

// READ - Obtener ventas eliminadas (solo para administradores)
export const obtenerVentasEliminadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await Venta.findAll({
      where: { 
        idestado: EstadoGeneral.ELIMINADO // Solo eliminados
      },
      include: [
        { 
          model: Usuario, 
          as: 'Usuario',
          include: [
            {
              model: Persona,
              as: 'Persona',
              attributes: ['id', 'nombres', 'apellidos']
            }
          ],
          attributes: ['id', 'usuario']
        },
        { 
          model: Pedido, 
          as: 'Pedido',
          attributes: ['id', 'totalimporte', 'fechaoperacion']
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
      msg: 'Ventas eliminadas obtenidas exitosamente',
      data: ventas
    });
  } catch (error) {
    console.error('Error en obtenerVentasEliminadas:', error);
    res.status(500).json({ msg: 'Error al obtener las ventas eliminadas' });
  }
};
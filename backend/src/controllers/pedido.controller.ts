import { Request, Response } from 'express';
import Pedido from '../models/pedido.model';
import Persona from '../models/persona.model';
import MetodoPago from '../models/metodo_pago.model';
import Estado from '../models/estado.model';
import { PedidoEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Insertar nuevo pedido
export const createPedido = async (req: Request, res: Response): Promise<void> => {
  const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto } = req.body;

  try {
    // Validaciones
    if (!idpersona || !idmetodopago || totalimporte === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idpersona, idmetodopago y totalimporte son obligatorios' 
      });
      return;
    }

    // Verificar si existe la persona
    const persona = await Persona.findByPk(idpersona);
    if (!persona) {
      res.status(400).json({ msg: 'La persona no existe' });
      return;
    }

    // Verificar si existe el método de pago
    const metodoPago = await MetodoPago.findByPk(idmetodopago);
    if (!metodoPago) {
      res.status(400).json({ msg: 'El método de pago no existe' });
      return;
    }

    // Crear nuevo pedido
    const nuevoPedido: any = await Pedido.create({
      idpersona,
      idmetodopago,
      fechaoperacion: fechaoperacion || new Date(),
      totalimporte,
      adjunto: adjunto || null,
      idestado: PedidoEstado.EN_ESPERA
    });

    // Obtener el pedido creado con sus relaciones
    const pedidoCreado = await Pedido.findByPk(nuevoPedido.id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
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
      msg: 'Pedido creado exitosamente',
      data: pedidoCreado
    });
  } catch (error) {
    console.error('Error en createPedido:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar pedido
export const updatePedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto, idestado } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del pedido es obligatorio" });
      return;
    }

    const pedido: any = await Pedido.findByPk(id);
    if (!pedido) {
      res.status(404).json({ msg: `No existe un pedido con el id ${id}` });
      return;
    }

    // Verificar si existe la persona (si se está actualizando)
    if (idpersona) {
      const persona = await Persona.findByPk(idpersona);
      if (!persona) {
        res.status(400).json({ msg: 'La persona no existe' });
        return;
      }
    }

    // Verificar si existe el método de pago (si se está actualizando)
    if (idmetodopago) {
      const metodoPago = await MetodoPago.findByPk(idmetodopago);
      if (!metodoPago) {
        res.status(400).json({ msg: 'El método de pago no existe' });
        return;
      }
    }

    // Validar estado (si se está actualizando)
    if (idestado && !Object.values(PedidoEstado).includes(idestado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)' 
      });
      return;
    }

    // Actualizar campos
    if (idpersona) pedido.idpersona = idpersona;
    if (idmetodopago) pedido.idmetodopago = idmetodopago;
    if (fechaoperacion) pedido.fechaoperacion = fechaoperacion;
    if (totalimporte !== undefined) pedido.totalimporte = totalimporte;
    if (adjunto !== undefined) pedido.adjunto = adjunto;
    if (idestado) pedido.idestado = idestado;

    await pedido.save();

    // Obtener el pedido actualizado con relaciones
    const pedidoActualizado = await Pedido.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
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
      msg: "Pedido actualizado con éxito",
      data: pedidoActualizado
    });

  } catch (error) {
    console.error("Error en updatePedido:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los pedidos
export const getPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['fechaoperacion', 'DESC']]
    });

    res.json({
      msg: 'Lista de pedidos obtenida exitosamente',
      data: pedidos
    });
  } catch (error) {
    console.error('Error en getPedidos:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de pedidos' });
  }
};

// READ - Listar pedidos por estado
export const getPedidosByEstado = async (req: Request, res: Response): Promise<void> => {
  const { estado } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      where: { idestado: estado },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['fechaoperacion', 'DESC']]
    });

    res.json({
      msg: `Pedidos con estado ${estado} obtenidos exitosamente`,
      data: pedidos
    });
  } catch (error) {
    console.error('Error en getPedidosByEstado:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos por estado' });
  }
};

// READ - Obtener pedido por ID
export const getPedidoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    res.json({
      msg: 'Pedido obtenido exitosamente',
      data: pedido
    });
  } catch (error) {
    console.error('Error en getPedidoById:', error);
    res.status(500).json({ msg: 'Error al obtener el pedido' });
  }
};

// READ - Obtener pedidos por persona
export const getPedidosByPersona = async (req: Request, res: Response): Promise<void> => {
  const { idpersona } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      where: { idpersona },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['fechaoperacion', 'DESC']]
    });

    res.json({
      msg: 'Pedidos de la persona obtenidos exitosamente',
      data: pedidos
    });
  } catch (error) {
    console.error('Error en getPedidosByPersona:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos de la persona' });
  }
};

// UPDATE - Cambiar estado del pedido
export const cambiarEstadoPedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    if (!estado || !Object.values(PedidoEstado).includes(estado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)' 
      });
      return;
    }

    const pedido: any = await Pedido.findByPk(id);
    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    pedido.idestado = estado;
    await pedido.save();

    res.json({ 
      msg: 'Estado del pedido actualizado con éxito',
      data: { id: pedido.id, estado }
    });
  } catch (error) {
    console.error('Error en cambiarEstadoPedido:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado del pedido' });
  }
};

// DELETE - Eliminar pedido (cambiar estado a cancelado)
export const deletePedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido: any = await Pedido.findByPk(id);

    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    // Cambiar estado a CANCELADO en lugar de eliminar físicamente
    pedido.idestado = PedidoEstado.CANCELADO;
    await pedido.save();

    res.json({ 
      msg: 'Pedido cancelado con éxito',
      data: { id: pedido.id, estado: PedidoEstado.CANCELADO }
    });
  } catch (error) {
    console.error('Error en deletePedido:', error);
    res.status(500).json({ msg: 'Error al cancelar el pedido' });
  }
};

// READ - Listar pedidos cancelados
export const getPedidosCancelados = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedidos = await Pedido.findAll({
      where: { idestado: PedidoEstado.CANCELADO },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fechaoperacion', 'DESC']]
    });

    res.json({
      msg: 'Pedidos cancelados obtenidos exitosamente',
      data: pedidos
    });
  } catch (error) {
    console.error('Error en getPedidosCancelados:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos cancelados' });
  }
};

// UPDATE - Restaurar pedido cancelado
export const restaurarPedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido: any = await Pedido.findByPk(id);

    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    // Cambiar estado a EN_ESPERA
    pedido.idestado = PedidoEstado.EN_ESPERA;
    await pedido.save();

    res.json({ 
      msg: 'Pedido restaurado con éxito',
      data: { id: pedido.id, estado: PedidoEstado.EN_ESPERA }
    });
  } catch (error) {
    console.error('Error en restaurarPedido:', error);
    res.status(500).json({ msg: 'Error al restaurar el pedido' });
  }
};
import { Request, Response } from 'express';
import MetodoPago from '../models/metodo_pago.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

// CREATE - Insertar nuevo método de pago
export const createMetodoPago = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si ya existe un método de pago con el mismo nombre (no eliminado)
    const metodoPagoExistente = await MetodoPago.findOne({
      where: {
        nombre,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO }
      }
    });

    if (metodoPagoExistente) {
      res.status(400).json({ 
        msg: 'Ya existe un método de pago con ese nombre' 
      });
      return;
    }

    // Crear nuevo método de pago
    const nuevoMetodoPago: any = await MetodoPago.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el método de pago creado con sus relaciones
    const metodoPagoCreado = await MetodoPago.findByPk(nuevoMetodoPago.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Método de pago creado exitosamente',
      data: metodoPagoCreado
    });
  } catch (error) {
    console.error('Error en createMetodoPago:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar método de pago
export const updateMetodoPago = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del método de pago es obligatorio" });
      return;
    }

    const metodoPago: any = await MetodoPago.findByPk(id);
    if (!metodoPago) {
      res.status(404).json({ msg: `No existe un método de pago con el id ${id}` });
      return;
    }

    // Verificar si ya existe otro método de pago con el mismo nombre (no eliminado)
    if (nombre && nombre !== metodoPago.nombre) {
      const metodoPagoExistente = await MetodoPago.findOne({
        where: {
          nombre,
          id: { [Op.ne]: id },
          idestado: { [Op.ne]: EstadoGeneral.ELIMINADO }
        }
      });

      if (metodoPagoExistente) {
        res.status(400).json({ 
          msg: 'Ya existe otro método de pago con ese nombre' 
        });
        return;
      }
    }

    // Actualizar campos
    if (nombre) metodoPago.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO si no está eliminado
    if (metodoPago.idestado !== EstadoGeneral.ELIMINADO) {
      metodoPago.idestado = EstadoGeneral.ACTUALIZADO;
    }

    await metodoPago.save();

    // Obtener el método de pago actualizado con relaciones
    const metodoPagoActualizado = await MetodoPago.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Método de pago actualizado con éxito",
      data: metodoPagoActualizado
    });

  } catch (error) {
    console.error("Error en updateMetodoPago:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los métodos de pago
export const getMetodosPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodosPago = await MetodoPago.findAll({
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Lista de métodos de pago obtenida exitosamente',
      data: metodosPago
    });
  } catch (error) {
    console.error('Error en getMetodosPago:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de métodos de pago' });
  }
};

// READ - Listar métodos de pago registrados/actualizados (no eliminados)
export const getMetodosPagoRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodosPago = await MetodoPago.findAll({
      where: { 
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } 
      },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Métodos de pago registrados obtenidos exitosamente',
      data: metodosPago
    });
  } catch (error) {
    console.error('Error en getMetodosPagoRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener métodos de pago registrados' });
  }
};

// READ - Obtener método de pago por ID
export const getMetodoPagoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const metodoPago = await MetodoPago.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!metodoPago) {
      res.status(404).json({ msg: 'Método de pago no encontrado' });
      return;
    }

    res.json({
      msg: 'Método de pago obtenido exitosamente',
      data: metodoPago
    });
  } catch (error) {
    console.error('Error en getMetodoPagoById:', error);
    res.status(500).json({ msg: 'Error al obtener el método de pago' });
  }
};

// READ - Verificar si existe un método de pago por nombre
export const verificarNombreMetodoPago = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    const metodoPago = await MetodoPago.findOne({
      where: { 
        nombre,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO } 
      }
    });

    res.json({
      existe: !!metodoPago,
      data: metodoPago
    });
  } catch (error) {
    console.error('Error en verificarNombreMetodoPago:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre del método de pago' });
  }
};

// READ - Listar métodos de pago eliminados
export const getMetodosPagoEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodosPago = await MetodoPago.findAll({
      where: { idestado: EstadoGeneral.ELIMINADO },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Métodos de pago eliminados obtenidos exitosamente',
      data: metodosPago
    });
  } catch (error) {
    console.error('Error en getMetodosPagoEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener métodos de pago eliminados' });
  }
};

// DELETE - Eliminar método de pago (cambiar estado a eliminado)
export const deleteMetodoPago = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const metodoPago: any = await MetodoPago.findByPk(id);

    if (!metodoPago) {
      res.status(404).json({ msg: 'Método de pago no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    metodoPago.idestado = EstadoGeneral.ELIMINADO;
    await metodoPago.save();

    res.json({ 
      msg: 'Método de pago eliminado con éxito',
      data: { id: metodoPago.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteMetodoPago:', error);
    res.status(500).json({ msg: 'Error al eliminar el método de pago' });
  }
};

// UPDATE - Restaurar método de pago eliminado
export const restaurarMetodoPago = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const metodoPago: any = await MetodoPago.findByPk(id);

    if (!metodoPago) {
      res.status(404).json({ msg: 'Método de pago no encontrado' });
      return;
    }

    // Cambiar estado a ACTUALIZADO
    metodoPago.idestado = EstadoGeneral.ACTUALIZADO;
    await metodoPago.save();

    res.json({ 
      msg: 'Método de pago restaurado con éxito',
      data: { id: metodoPago.id, estado: EstadoGeneral.ACTUALIZADO }
    });
  } catch (error) {
    console.error('Error en restaurarMetodoPago:', error);
    res.status(500).json({ msg: 'Error al restaurar el método de pago' });
  }
};
import { Request, Response } from 'express';
import Talla from '../models/talla.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nueva talla
export const createTalla = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si la talla ya existe
    const existingTalla = await Talla.findOne({ where: { nombre } });
    if (existingTalla) {
      res.status(400).json({ msg: 'La talla ya existe' });
      return;
    }

    // Crear nueva talla
    const nuevaTalla: any = await Talla.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener la talla creada con su relación de estado
    const tallaCreada = await Talla.findByPk(nuevaTalla.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Talla creada exitosamente',
      data: tallaCreada
    });
  } catch (error) {
    console.error('Error en createTalla:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todas las tallas
export const getTallas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tallas = await Talla.findAll({
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de tallas obtenida exitosamente',
      data: tallas
    });
  } catch (error) {
    console.error('Error en getTallas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de tallas' });
  }
};

// READ - Listar tallas registradas (no eliminadas)
export const getTallasRegistradas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tallas = await Talla.findAll({
      where: { 
        idestado: [EstadoGeneral.REGISTRADO, EstadoGeneral.ACTUALIZADO] 
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
      msg: 'Tallas registradas obtenidas exitosamente',
      data: tallas
    });
  } catch (error) {
    console.error('Error en getTallasRegistradas:', error);
    res.status(500).json({ msg: 'Error al obtener tallas registradas' });
  }
};

// READ - Obtener talla por ID
export const getTallaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const talla = await Talla.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!talla) {
      res.status(404).json({ msg: 'Talla no encontrada' });
      return;
    }

    res.json({
      msg: 'Talla obtenida exitosamente',
      data: talla
    });
  } catch (error) {
    console.error('Error en getTallaById:', error);
    res.status(500).json({ msg: 'Error al obtener la talla' });
  }
};

// UPDATE - Actualizar talla
export const updateTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la talla es obligatorio" });
      return;
    }

    const talla: any = await Talla.findByPk(id);
    if (!talla) {
      res.status(404).json({ msg: `No existe una talla con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== talla.nombre) {
      const existingTalla = await Talla.findOne({ where: { nombre } });
      if (existingTalla && existingTalla.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre de la talla ya está en uso' });
        return;
      }
    }

    // Actualizar campo nombre
    if (nombre) talla.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    talla.idestado = EstadoGeneral.ACTUALIZADO;

    await talla.save();

    // Obtener la talla actualizada con relación de estado
    const tallaActualizada = await Talla.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Talla actualizada con éxito",
      data: tallaActualizada
    });

  } catch (error) {
    console.error("Error en updateTalla:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar talla (cambiar estado a eliminado)
export const deleteTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const talla: any = await Talla.findByPk(id);

    if (!talla) {
      res.status(404).json({ msg: 'Talla no encontrada' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    talla.idestado = EstadoGeneral.ELIMINADO;
    await talla.save();

    res.json({ 
      msg: 'Talla eliminada con éxito',
      data: { id: talla.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteTalla:', error);
    res.status(500).json({ msg: 'Error al eliminar la talla' });
  }
};

// READ - Listar tallas eliminadas
export const getTallasEliminadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tallas = await Talla.findAll({
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
      msg: 'Tallas eliminadas obtenidas exitosamente',
      data: tallas
    });
  } catch (error) {
    console.error('Error en getTallasEliminadas:', error);
    res.status(500).json({ msg: 'Error al obtener tallas eliminadas' });
  }
};

// UPDATE - Restaurar talla eliminada
export const restaurarTalla = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const talla: any = await Talla.findByPk(id);

    if (!talla) {
      res.status(404).json({ msg: 'Talla no encontrada' });
      return;
    }

    // Cambiar estado a REGISTRADO
    talla.idestado = EstadoGeneral.REGISTRADO;
    await talla.save();

    res.json({ 
      msg: 'Talla restaurada con éxito',
      data: { id: talla.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarTalla:', error);
    res.status(500).json({ msg: 'Error al restaurar la talla' });
  }
};

// READ - Verificar si existe una talla con el nombre
export const verificarNombreTalla = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El nombre de la talla es requerido' 
      });
      return;
    }

    const talla = await Talla.findOne({ 
      where: { nombre },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (talla) {
      res.json({
        msg: 'El nombre de la talla ya existe',
        existe: true,
        data: talla
      });
    } else {
      res.json({
        msg: 'El nombre de la talla está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarNombreTalla:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre de la talla' });
  }
};
import { Request, Response } from 'express';
import TipoSerie from '../models/tiposerie.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo tipo de serie
export const createTipoSerie = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si el tipo de serie ya existe
    const existingTipoSerie = await TipoSerie.findOne({ where: { nombre } });
    if (existingTipoSerie) {
      res.status(400).json({ msg: 'El tipo de serie ya existe' });
      return;
    }

    // Crear nuevo tipo de serie
    const nuevoTipoSerie: any = await TipoSerie.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el tipo de serie creado con su relación de estado
    const tipoSerieCreado = await TipoSerie.findByPk(nuevoTipoSerie.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Tipo de serie creado exitosamente',
      data: tipoSerieCreado
    });
  } catch (error) {
    console.error('Error en createTipoSerie:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todos los tipos de serie
export const getTiposSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposSerie = await TipoSerie.findAll({
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
      msg: 'Lista de tipos de serie obtenida exitosamente',
      data: tiposSerie
    });
  } catch (error) {
    console.error('Error en getTiposSerie:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de tipos de serie' });
  }
};

// READ - Listar tipos de serie registrados (no eliminados)
export const getTiposSerieRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposSerie = await TipoSerie.findAll({
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
      msg: 'Tipos de serie registrados obtenidos exitosamente',
      data: tiposSerie
    });
  } catch (error) {
    console.error('Error en getTiposSerieRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener tipos de serie registrados' });
  }
};

// READ - Obtener tipo de serie por ID
export const getTipoSerieById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoSerie = await TipoSerie.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!tipoSerie) {
      res.status(404).json({ msg: 'Tipo de serie no encontrado' });
      return;
    }

    res.json({
      msg: 'Tipo de serie obtenido exitosamente',
      data: tipoSerie
    });
  } catch (error) {
    console.error('Error en getTipoSerieById:', error);
    res.status(500).json({ msg: 'Error al obtener el tipo de serie' });
  }
};

// UPDATE - Actualizar tipo de serie
export const updateTipoSerie = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del tipo de serie es obligatorio" });
      return;
    }

    const tipoSerie: any = await TipoSerie.findByPk(id);
    if (!tipoSerie) {
      res.status(404).json({ msg: `No existe un tipo de serie con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== tipoSerie.nombre) {
      const existingTipoSerie = await TipoSerie.findOne({ where: { nombre } });
      if (existingTipoSerie && existingTipoSerie.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre del tipo de serie ya está en uso' });
        return;
      }
    }

    // Actualizar campo nombre
    if (nombre) tipoSerie.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    tipoSerie.idestado = EstadoGeneral.ACTUALIZADO;

    await tipoSerie.save();

    // Obtener el tipo de serie actualizado con relación de estado
    const tipoSerieActualizado = await TipoSerie.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Tipo de serie actualizado con éxito",
      data: tipoSerieActualizado
    });

  } catch (error) {
    console.error("Error en updateTipoSerie:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar tipo de serie (cambiar estado a eliminado)
export const deleteTipoSerie = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoSerie: any = await TipoSerie.findByPk(id);

    if (!tipoSerie) {
      res.status(404).json({ msg: 'Tipo de serie no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    tipoSerie.idestado = EstadoGeneral.ELIMINADO;
    await tipoSerie.save();

    res.json({ 
      msg: 'Tipo de serie eliminado con éxito',
      data: { id: tipoSerie.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteTipoSerie:', error);
    res.status(500).json({ msg: 'Error al eliminar el tipo de serie' });
  }
};

// READ - Listar tipos de serie eliminados
export const getTiposSerieEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposSerie = await TipoSerie.findAll({
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
      msg: 'Tipos de serie eliminados obtenidos exitosamente',
      data: tiposSerie
    });
  } catch (error) {
    console.error('Error en getTiposSerieEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener tipos de serie eliminados' });
  }
};

// UPDATE - Restaurar tipo de serie eliminado
export const restaurarTipoSerie = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoSerie: any = await TipoSerie.findByPk(id);

    if (!tipoSerie) {
      res.status(404).json({ msg: 'Tipo de serie no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    tipoSerie.idestado = EstadoGeneral.REGISTRADO;
    await tipoSerie.save();

    res.json({ 
      msg: 'Tipo de serie restaurado con éxito',
      data: { id: tipoSerie.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarTipoSerie:', error);
    res.status(500).json({ msg: 'Error al restaurar el tipo de serie' });
  }
};

// READ - Verificar si existe un tipo de serie con el nombre
export const verificarNombreTipoSerie = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El nombre del tipo de serie es requerido' 
      });
      return;
    }

    const tipoSerie = await TipoSerie.findOne({ 
      where: { nombre },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (tipoSerie) {
      res.json({
        msg: 'El nombre del tipo de serie ya existe',
        existe: true,
        data: tipoSerie
      });
    } else {
      res.json({
        msg: 'El nombre del tipo de serie está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarNombreTipoSerie:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre del tipo de serie' });
  }
};
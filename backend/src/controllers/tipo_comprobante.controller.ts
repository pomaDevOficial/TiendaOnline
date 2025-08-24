import { Request, Response } from 'express';
import TipoComprobante from '../models/tipo_comprobante.model';
import TipoSerie from '../models/tiposerie.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo tipo de comprobante
export const createTipoComprobante = async (req: Request, res: Response): Promise<void> => {
  const { idtiposerie, nombre } = req.body;

  try {
    // Validaciones
    if (!nombre || !idtiposerie) {
      res.status(400).json({ 
        msg: 'Los campos nombre e idtiposerie son obligatorios' 
      });
      return;
    }

    // Verificar si el tipo de comprobante ya existe
    const existingTipoComprobante = await TipoComprobante.findOne({ where: { nombre } });
    if (existingTipoComprobante) {
      res.status(400).json({ msg: 'El tipo de comprobante ya existe' });
      return;
    }

    // Verificar si el tipo de serie existe
    const tipoSerie = await TipoSerie.findByPk(idtiposerie);
    if (!tipoSerie) {
      res.status(400).json({ msg: 'El tipo de serie no existe' });
      return;
    }

    // Crear nuevo tipo de comprobante
    const nuevoTipoComprobante: any = await TipoComprobante.create({
      idtiposerie,
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el tipo de comprobante creado con sus relaciones
    const tipoComprobanteCreado = await TipoComprobante.findByPk(nuevoTipoComprobante.id, {
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
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
      msg: 'Tipo de comprobante creado exitosamente',
      data: tipoComprobanteCreado
    });
  } catch (error) {
    console.error('Error en createTipoComprobante:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todos los tipos de comprobante
export const getTiposComprobante = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposComprobante = await TipoComprobante.findAll({
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
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
      msg: 'Lista de tipos de comprobante obtenida exitosamente',
      data: tiposComprobante
    });
  } catch (error) {
    console.error('Error en getTiposComprobante:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de tipos de comprobante' });
  }
};

// READ - Listar tipos de comprobante registrados (no eliminados)
export const getTiposComprobanteRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposComprobante = await TipoComprobante.findAll({
      where: { 
        idestado: [EstadoGeneral.REGISTRADO, EstadoGeneral.ACTUALIZADO] 
      },
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Tipos de comprobante registrados obtenidos exitosamente',
      data: tiposComprobante
    });
  } catch (error) {
    console.error('Error en getTiposComprobanteRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener tipos de comprobante registrados' });
  }
};

// READ - Obtener tipo de comprobante por ID
export const getTipoComprobanteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoComprobante = await TipoComprobante.findByPk(id, {
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!tipoComprobante) {
      res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
      return;
    }

    res.json({
      msg: 'Tipo de comprobante obtenido exitosamente',
      data: tipoComprobante
    });
  } catch (error) {
    console.error('Error en getTipoComprobanteById:', error);
    res.status(500).json({ msg: 'Error al obtener el tipo de comprobante' });
  }
};

// UPDATE - Actualizar tipo de comprobante
export const updateTipoComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idtiposerie, nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del tipo de comprobante es obligatorio" });
      return;
    }

    const tipoComprobante: any = await TipoComprobante.findByPk(id);
    if (!tipoComprobante) {
      res.status(404).json({ msg: `No existe un tipo de comprobante con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== tipoComprobante.nombre) {
      const existingTipoComprobante = await TipoComprobante.findOne({ where: { nombre } });
      if (existingTipoComprobante && existingTipoComprobante.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre del tipo de comprobante ya está en uso' });
        return;
      }
    }

    // Verificar si el tipo de serie existe
    if (idtiposerie) {
      const tipoSerie = await TipoSerie.findByPk(idtiposerie);
      if (!tipoSerie) {
        res.status(400).json({ msg: 'El tipo de serie no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idtiposerie) tipoComprobante.idtiposerie = idtiposerie;
    if (nombre) tipoComprobante.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    tipoComprobante.idestado = EstadoGeneral.ACTUALIZADO;

    await tipoComprobante.save();

    // Obtener el tipo de comprobante actualizado con relaciones
    const tipoComprobanteActualizado = await TipoComprobante.findByPk(id, {
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
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
      msg: "Tipo de comprobante actualizado con éxito",
      data: tipoComprobanteActualizado
    });

  } catch (error) {
    console.error("Error en updateTipoComprobante:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar tipo de comprobante (cambiar estado a eliminado)
export const deleteTipoComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoComprobante: any = await TipoComprobante.findByPk(id);

    if (!tipoComprobante) {
      res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    tipoComprobante.idestado = EstadoGeneral.ELIMINADO;
    await tipoComprobante.save();

    res.json({ 
      msg: 'Tipo de comprobante eliminado con éxito',
      data: { id: tipoComprobante.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteTipoComprobante:', error);
    res.status(500).json({ msg: 'Error al eliminar el tipo de comprobante' });
  }
};

// READ - Listar tipos de comprobante eliminados
export const getTiposComprobanteEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiposComprobante = await TipoComprobante.findAll({
      where: { idestado: EstadoGeneral.ELIMINADO },
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Tipos de comprobante eliminados obtenidos exitosamente',
      data: tiposComprobante
    });
  } catch (error) {
    console.error('Error en getTiposComprobanteEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener tipos de comprobante eliminados' });
  }
};

// UPDATE - Restaurar tipo de comprobante eliminado
export const restaurarTipoComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tipoComprobante: any = await TipoComprobante.findByPk(id);

    if (!tipoComprobante) {
      res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    tipoComprobante.idestado = EstadoGeneral.REGISTRADO;
    await tipoComprobante.save();

    res.json({ 
      msg: 'Tipo de comprobante restaurado con éxito',
      data: { id: tipoComprobante.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarTipoComprobante:', error);
    res.status(500).json({ msg: 'Error al restaurar el tipo de comprobante' });
  }
};

// READ - Verificar si existe un tipo de comprobante con el nombre
export const verificarNombreTipoComprobante = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El nombre del tipo de comprobante es requerido' 
      });
      return;
    }

    const tipoComprobante = await TipoComprobante.findOne({ 
      where: { nombre },
      include: [
        { 
          model: TipoSerie, 
          as: 'TipoSerie',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (tipoComprobante) {
      res.json({
        msg: 'El nombre del tipo de comprobante ya existe',
        existe: true,
        data: tipoComprobante
      });
    } else {
      res.json({
        msg: 'El nombre del tipo de comprobante está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarNombreTipoComprobante:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre del tipo de comprobante' });
  }
};
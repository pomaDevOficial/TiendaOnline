import { Request, Response } from 'express';
import Marca from '../models/marca.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nueva marca
export const createMarca = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si la marca ya existe
    const existingMarca = await Marca.findOne({ where: { nombre } });
    if (existingMarca) {
      res.status(400).json({ msg: 'La marca ya existe' });
      return;
    }

    // Crear nueva marca
    const nuevaMarca: any = await Marca.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener la marca creada con su relación de estado
    const marcaCreada = await Marca.findByPk(nuevaMarca.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Marca creada exitosamente',
      data: marcaCreada
    });
  } catch (error) {
    console.error('Error en createMarca:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todas las marcas
export const getMarcas = async (req: Request, res: Response): Promise<void> => {
  try {
    const marcas = await Marca.findAll({
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
      order: [['id', 'DESC']]
    });

    res.json({
      msg: 'Lista de marcas obtenida exitosamente',
      data: marcas
    });
  } catch (error) {
    console.error('Error en getMarcas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de marcas' });
  }
};

// READ - Listar marcas registradas (no eliminadas)
export const getMarcasRegistradas = async (req: Request, res: Response): Promise<void> => {
  try {
    const marcas = await Marca.findAll({
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
      msg: 'Marcas registradas obtenidas exitosamente',
      data: marcas
    });
  } catch (error) {
    console.error('Error en getMarcasRegistradas:', error);
    res.status(500).json({ msg: 'Error al obtener marcas registradas' });
  }
};

// READ - Obtener marca por ID
export const getMarcaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const marca = await Marca.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!marca) {
      res.status(404).json({ msg: 'Marca no encontrada' });
      return;
    }

    res.json({
      msg: 'Marca obtenida exitosamente',
      data: marca
    });
  } catch (error) {
    console.error('Error en getMarcaById:', error);
    res.status(500).json({ msg: 'Error al obtener la marca' });
  }
};

// UPDATE - Actualizar marca
export const updateMarca = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la marca es obligatorio" });
      return;
    }

    const marca: any = await Marca.findByPk(id);
    if (!marca) {
      res.status(404).json({ msg: `No existe una marca con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== marca.nombre) {
      const existingMarca = await Marca.findOne({ where: { nombre } });
      if (existingMarca && existingMarca.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre de la marca ya está en uso' });
        return;
      }
    }

    // Actualizar campo nombre
    if (nombre) marca.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    marca.idestado = EstadoGeneral.ACTUALIZADO;

    await marca.save();

    // Obtener la marca actualizada con relación de estado
    const marcaActualizada = await Marca.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Marca actualizada con éxito",
      data: marcaActualizada
    });

  } catch (error) {
    console.error("Error en updateMarca:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar marca (cambiar estado a eliminado)
export const deleteMarca = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const marca: any = await Marca.findByPk(id);

    if (!marca) {
      res.status(404).json({ msg: 'Marca no encontrada' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    marca.idestado = EstadoGeneral.ELIMINADO;
    await marca.save();

    res.json({ 
      msg: 'Marca eliminada con éxito',
      data: { id: marca.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteMarca:', error);
    res.status(500).json({ msg: 'Error al eliminar la marca' });
  }
};

// READ - Listar marcas eliminadas
export const getMarcasEliminadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const marcas = await Marca.findAll({
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
      msg: 'Marcas eliminadas obtenidas exitosamente',
      data: marcas
    });
  } catch (error) {
    console.error('Error en getMarcasEliminadas:', error);
    res.status(500).json({ msg: 'Error al obtener marcas eliminadas' });
  }
};

// UPDATE - Restaurar marca eliminada
export const restaurarMarca = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const marca: any = await Marca.findByPk(id);

    if (!marca) {
      res.status(404).json({ msg: 'Marca no encontrada' });
      return;
    }

    // Cambiar estado a REGISTRADO
    marca.idestado = EstadoGeneral.REGISTRADO;
    await marca.save();

    res.json({ 
      msg: 'Marca restaurada con éxito',
      data: { id: marca.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarMarca:', error);
    res.status(500).json({ msg: 'Error al restaurar la marca' });
  }
};

// READ - Verificar si existe una marca con el nombre
export const verificarNombreMarca = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El nombre de la marca es requerido' 
      });
      return;
    }

    const marca = await Marca.findOne({ 
      where: { nombre },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (marca) {
      res.json({
        msg: 'El nombre de la marca ya existe',
        existe: true,
        data: marca
      });
    } else {
      res.json({
        msg: 'El nombre de la marca está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarNombreMarca:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre de la marca' });
  }
};
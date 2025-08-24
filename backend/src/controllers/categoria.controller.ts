import { Request, Response } from 'express';
import Categoria from '../models/categoria.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nueva categoría
export const createCategoria = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si la categoría ya existe
    const existingCategoria = await Categoria.findOne({ where: { nombre } });
    if (existingCategoria) {
      res.status(400).json({ msg: 'La categoría ya existe' });
      return;
    }

    // Crear nueva categoría
    const nuevaCategoria: any = await Categoria.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener la categoría creada con su relación de estado
    const categoriaCreada = await Categoria.findByPk(nuevaCategoria.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Categoría creada exitosamente',
      data: categoriaCreada
    });
  } catch (error) {
    console.error('Error en createCategoria:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todas las categorías
export const getCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await Categoria.findAll({
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
      msg: 'Lista de categorías obtenida exitosamente',
      data: categorias
    });
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de categorías' });
  }
};

// READ - Listar categorías registradas (no eliminadas)
export const getCategoriasRegistradas = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await Categoria.findAll({
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
      msg: 'Categorías registradas obtenidas exitosamente',
      data: categorias
    });
  } catch (error) {
    console.error('Error en getCategoriasRegistradas:', error);
    res.status(500).json({ msg: 'Error al obtener categorías registradas' });
  }
};

// READ - Obtener categoría por ID
export const getCategoriaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const categoria = await Categoria.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!categoria) {
      res.status(404).json({ msg: 'Categoría no encontrada' });
      return;
    }

    res.json({
      msg: 'Categoría obtenida exitosamente',
      data: categoria
    });
  } catch (error) {
    console.error('Error en getCategoriaById:', error);
    res.status(500).json({ msg: 'Error al obtener la categoría' });
  }
};

// UPDATE - Actualizar categoría
export const updateCategoria = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la categoría es obligatorio" });
      return;
    }

    const categoria: any = await Categoria.findByPk(id);
    if (!categoria) {
      res.status(404).json({ msg: `No existe una categoría con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== categoria.nombre) {
      const existingCategoria = await Categoria.findOne({ where: { nombre } });
      if (existingCategoria && existingCategoria.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre de la categoría ya está en uso' });
        return;
      }
    }

    // Actualizar campo nombre
    if (nombre) categoria.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    categoria.idestado = EstadoGeneral.ACTUALIZADO;

    await categoria.save();

    // Obtener la categoría actualizada con relación de estado
    const categoriaActualizada = await Categoria.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Categoría actualizada con éxito",
      data: categoriaActualizada
    });

  } catch (error) {
    console.error("Error en updateCategoria:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar categoría (cambiar estado a eliminado)
export const deleteCategoria = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const categoria: any = await Categoria.findByPk(id);

    if (!categoria) {
      res.status(404).json({ msg: 'Categoría no encontrada' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    categoria.idestado = EstadoGeneral.ELIMINADO;
    await categoria.save();

    res.json({ 
      msg: 'Categoría eliminada con éxito',
      data: { id: categoria.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    res.status(500).json({ msg: 'Error al eliminar la categoría' });
  }
};

// READ - Listar categorías eliminadas
export const getCategoriasEliminadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await Categoria.findAll({
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
      msg: 'Categorías eliminadas obtenidas exitosamente',
      data: categorias
    });
  } catch (error) {
    console.error('Error en getCategoriasEliminadas:', error);
    res.status(500).json({ msg: 'Error al obtener categorías eliminadas' });
  }
};

// UPDATE - Restaurar categoría eliminada
export const restaurarCategoria = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const categoria: any = await Categoria.findByPk(id);

    if (!categoria) {
      res.status(404).json({ msg: 'Categoría no encontrada' });
      return;
    }

    // Cambiar estado a REGISTRADO
    categoria.idestado = EstadoGeneral.REGISTRADO;
    await categoria.save();

    res.json({ 
      msg: 'Categoría restaurada con éxito',
      data: { id: categoria.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarCategoria:', error);
    res.status(500).json({ msg: 'Error al restaurar la categoría' });
  }
};

// READ - Verificar si existe una categoría con el nombre
export const verificarNombreCategoria = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.params;

  try {
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El nombre de la categoría es requerido' 
      });
      return;
    }

    const categoria = await Categoria.findOne({ 
      where: { nombre },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (categoria) {
      res.json({
        msg: 'El nombre de la categoría ya existe',
        existe: true,
        data: categoria
      });
    } else {
      res.json({
        msg: 'El nombre de la categoría está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarNombreCategoria:', error);
    res.status(500).json({ msg: 'Error al verificar el nombre de la categoría' });
  }
};
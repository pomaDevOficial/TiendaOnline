import { Request, Response } from 'express';
import Rol from '../models/rol.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo rol
export const createRol = async (req: Request, res: Response): Promise<void> => {
  const { nombre } = req.body;

  try {
    // Validaciones
    if (!nombre) {
      res.status(400).json({ 
        msg: 'El campo nombre es obligatorio' 
      });
      return;
    }

    // Verificar si el rol ya existe
    const existingRol = await Rol.findOne({ where: { nombre } });
    if (existingRol) {
      res.status(400).json({ msg: 'El rol ya existe' });
      return;
    }

    // Crear nuevo rol
    const nuevoRol: any = await Rol.create({
      nombre,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el rol creado con su relación de estado
    const rolCreado = await Rol.findByPk(nuevoRol.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Rol creado exitosamente',
      data: rolCreado
    });
  } catch (error) {
    console.error('Error en createRol:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todos los roles
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Rol.findAll({
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
      msg: 'Lista de roles obtenida exitosamente',
      data: roles
    });
  } catch (error) {
    console.error('Error en getRoles:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de roles' });
  }
};

// READ - Listar roles registrados (no eliminados)
export const getRolesRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Rol.findAll({
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
      msg: 'Roles registrados obtenidos exitosamente',
      data: roles
    });
  } catch (error) {
    console.error('Error en getRolesRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener roles registrados' });
  }
};

// READ - Obtener rol por ID
export const getRolById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const rol = await Rol.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!rol) {
      res.status(404).json({ msg: 'Rol no encontrado' });
      return;
    }

    res.json({
      msg: 'Rol obtenido exitosamente',
      data: rol
    });
  } catch (error) {
    console.error('Error en getRolById:', error);
    res.status(500).json({ msg: 'Error al obtener el rol' });
  }
};

// UPDATE - Actualizar rol
export const updateRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del rol es obligatorio" });
      return;
    }

    const rol: any = await Rol.findByPk(id);
    if (!rol) {
      res.status(404).json({ msg: `No existe un rol con el id ${id}` });
      return;
    }

    // Validar nombre único
    if (nombre && nombre !== rol.nombre) {
      const existingRol = await Rol.findOne({ where: { nombre } });
      if (existingRol && existingRol.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre del rol ya está en uso' });
        return;
      }
    }

    // Actualizar campo nombre
    if (nombre) rol.nombre = nombre;
    
    // Cambiar estado a ACTUALIZADO
    rol.idestado = EstadoGeneral.ACTUALIZADO;

    await rol.save();

    // Obtener el rol actualizado con relación de estado
    const rolActualizado = await Rol.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Rol actualizado con éxito",
      data: rolActualizado
    });

  } catch (error) {
    console.error("Error en updateRol:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar rol (cambiar estado a eliminado)
export const deleteRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const rol: any = await Rol.findByPk(id);

    if (!rol) {
      res.status(404).json({ msg: 'Rol no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    rol.idestado = EstadoGeneral.ELIMINADO;
    await rol.save();

    res.json({ 
      msg: 'Rol eliminado con éxito',
      data: { id: rol.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteRol:', error);
    res.status(500).json({ msg: 'Error al eliminar el rol' });
  }
};

// READ - Listar roles eliminados
export const getRolesEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Rol.findAll({
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
      msg: 'Roles eliminados obtenidos exitosamente',
      data: roles
    });
  } catch (error) {
    console.error('Error en getRolesEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener roles eliminados' });
  }
};

// UPDATE - Restaurar rol eliminado
export const restaurarRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const rol: any = await Rol.findByPk(id);

    if (!rol) {
      res.status(404).json({ msg: 'Rol no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    rol.idestado = EstadoGeneral.REGISTRADO;
    await rol.save();

    res.json({ 
      msg: 'Rol restaurado con éxito',
      data: { id: rol.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarRol:', error);
    res.status(500).json({ msg: 'Error al restaurar el rol' });
  }
};
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuario.model';
import Rol from '../models/rol.model';
import Persona from '../models/persona.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo usuario
export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  const { idpersona, idrol, usuario, contrasenia, idestado } = req.body;

  try {
    // Validaciones
    if (!idpersona || !idrol || !usuario || !contrasenia) {
      res.status(400).json({ 
        msg: 'Los campos idpersona, idrol, usuario y contrasenia son obligatorios' 
      });
      return;
    }

    const existingUser = await Usuario.findOne({ where: { usuario } });
    if (existingUser) {
      res.status(400).json({ msg: 'El usuario ya existe' });
      return;
    }

    const existingPersonaUser = await Usuario.findOne({ where: { idpersona } });
    if (existingPersonaUser) {
      res.status(400).json({ msg: 'Esta persona ya tiene un usuario registrado' });
      return;
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

    const nuevoUsuario:any = await Usuario.create({
      idrol,
      idpersona,
      usuario,
      contrasenia: hashedPassword,
      idestado: idestado || EstadoGeneral.ACTIVO
    });

    // Obtener el usuario creado con sus relaciones
    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] } // No retornar la contraseña
    });

    res.status(201).json({
      msg: 'Usuario creado exitosamente',
      data: usuarioCreado
    });
  } catch (error) {
    console.error('Error en createUsuario:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todos los usuarios
export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] }, // No retornar contraseñas
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de usuarios obtenida exitosamente',
      data: usuarios
    });
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de usuarios' });
  }
};

// READ - Listar usuarios activos
export const getUsuariosActivos = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuario.findAll({
      where: { idestado: EstadoGeneral.ACTIVO },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] },
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Usuarios activos obtenidos exitosamente',
      data: usuarios
    });
  } catch (error) {
    console.error('Error en getUsuariosActivos:', error);
    res.status(500).json({ msg: 'Error al obtener usuarios activos' });
  }
};

// READ - Listar usuarios inactivos
export const getUsuariosInactivos = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuario.findAll({
      where: { idestado: EstadoGeneral.INACTIVO },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] },
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Usuarios inactivos obtenidos exitosamente',
      data: usuarios
    });
  } catch (error) {
    console.error('Error en getUsuariosInactivos:', error);
    res.status(500).json({ msg: 'Error al obtener usuarios inactivos' });
  }
};

// READ - Obtener usuario por ID
export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] }
    });

    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    res.json({
      msg: 'Usuario obtenido exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error en getUsuarioById:', error);
    res.status(500).json({ msg: 'Error al obtener el usuario' });
  }
};

// UPDATE - Actualizar usuario completo (PUT)
export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idpersona, idrol, usuario, contrasenia, idestado } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del usuario es obligatorio" });
      return;
    }

    const user: any = await Usuario.findByPk(id);
    if (!user) {
      res.status(404).json({ msg: `No existe un usuario con el id ${id}` });
      return;
    }

    // Validar usuario único
    if (usuario && usuario !== user.usuario) {
      const existingUser = await Usuario.findOne({ where: { usuario } });
      if (existingUser && existingUser.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
        return;
      }
    }

    // Validar persona única
    if (idpersona && idpersona !== user.idpersona) {
      const existingPersonaUser = await Usuario.findOne({ where: { idpersona } });
      if (existingPersonaUser && existingPersonaUser.id !== parseInt(id)) {
        res.status(400).json({ msg: 'Esta persona ya tiene un usuario registrado' });
        return;
      }
    }

    // Actualizar campos
    if (idpersona) user.idpersona = idpersona;
    if (idrol) user.idrol = idrol;
    if (usuario) user.usuario = usuario;
    if (idestado) user.idestado = idestado;

    // Encriptar nueva contraseña si se proporciona
    if (contrasenia) {
      const saltRounds = 10;
      user.contrasenia = await bcrypt.hash(contrasenia, saltRounds);
    }

    await user.save();

    // Obtener el usuario actualizado con relaciones
    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono'] 
        },
        { 
          model: Rol, 
          as: 'Rol',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      attributes: { exclude: ['contrasenia'] }
    });

    res.json({
      msg: "Usuario actualizado con éxito",
      data: usuarioActualizado
    });

  } catch (error) {
    console.error("Error en updateUsuario:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// UPDATE - Desactivar usuario (cambiar estado a inactivo)
export const desactivarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const usuario: any = await Usuario.findByPk(id);

    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    usuario.idestado = EstadoGeneral.INACTIVO;
    await usuario.save();

    res.json({ 
      msg: 'Usuario desactivado con éxito',
      data: { id: usuario.id, estado: EstadoGeneral.INACTIVO }
    });
  } catch (error) {
    console.error('Error en desactivarUsuario:', error);
    res.status(500).json({ msg: 'Error al desactivar el usuario' });
  }
};

// UPDATE - Activar usuario (cambiar estado a activo)
export const activarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const usuario: any = await Usuario.findByPk(id);

    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    usuario.idestado = EstadoGeneral.ACTIVO;
    await usuario.save();

    res.json({ 
      msg: 'Usuario activado con éxito',
      data: { id: usuario.id, estado: EstadoGeneral.ACTIVO }
    });
  } catch (error) {
    console.error('Error en activarUsuario:', error);
    res.status(500).json({ msg: 'Error al activar el usuario' });
  }
};

// DELETE - Eliminar usuario permanentemente (si es necesario)
export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    await usuario.destroy();

    res.json({ 
      msg: 'Usuario eliminado permanentemente',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
};
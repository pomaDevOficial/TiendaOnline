import { Request, Response } from 'express';
import Persona from '../models/persona.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nueva persona
export const createPersona = async (req: Request, res: Response): Promise<void> => {
  const { idtipopersona, nombres, apellidos, idtipoidentidad, nroidentidad, correo, telefono } = req.body;

  try {
    // Validaciones básicas
    if (!nombres || !apellidos) {
      res.status(400).json({ 
        msg: 'Los campos nombres y apellidos son obligatorios' 
      });
      return;
    }

    // Verificar si el número de identidad ya existe
    if (nroidentidad) {
      const existingPersona = await Persona.findOne({ where: { nroidentidad } });
      if (existingPersona) {
        res.status(400).json({ msg: 'El número de identidad ya existe' });
        return;
      }
    }

    // Verificar si el correo ya existe
    if (correo) {
      const existingPersona = await Persona.findOne({ where: { correo } });
      if (existingPersona) {
        res.status(400).json({ msg: 'El correo electrónico ya existe' });
        return;
      }
    }

    // Crear nueva persona
    const nuevaPersona: any = await Persona.create({
      idtipopersona: idtipopersona || null,
      nombres,
      apellidos,
      idtipoidentidad: idtipoidentidad || null,
      nroidentidad: nroidentidad || null,
      correo: correo || null,
      telefono: telefono || null,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener la persona creada con su relación de estado
    const personaCreada = await Persona.findByPk(nuevaPersona.id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Persona creada exitosamente',
      data: personaCreada
    });
  } catch (error) {
    console.error('Error en createPersona:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// READ - Listar todas las personas
export const getPersonas = async (req: Request, res: Response): Promise<void> => {
  try {
    const personas = await Persona.findAll({
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
      msg: 'Lista de personas obtenida exitosamente',
      data: personas
    });
  } catch (error) {
    console.error('Error en getPersonas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de personas' });
  }
};

// READ - Listar personas registradas (no eliminadas)
export const getPersonasRegistradas = async (req: Request, res: Response): Promise<void> => {
  try {
    const personas = await Persona.findAll({
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
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    res.json({
      msg: 'Personas registradas obtenidas exitosamente',
      data: personas
    });
  } catch (error) {
    console.error('Error en getPersonasRegistradas:', error);
    res.status(500).json({ msg: 'Error al obtener personas registradas' });
  }
};

// READ - Obtener persona por ID
export const getPersonaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const persona = await Persona.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!persona) {
      res.status(404).json({ msg: 'Persona no encontrada' });
      return;
    }

    res.json({
      msg: 'Persona obtenida exitosamente',
      data: persona
    });
  } catch (error) {
    console.error('Error en getPersonaById:', error);
    res.status(500).json({ msg: 'Error al obtener la persona' });
  }
};

// READ - Verificar si existe una persona con el DNI
export const verificarDni = async (req: Request, res: Response): Promise<void> => {
  const { nroidentidad } = req.params;

  try {
    if (!nroidentidad) {
      res.status(400).json({ 
        msg: 'El número de identidad es requerido' 
      });
      return;
    }

    const persona = await Persona.findOne({ 
      where: { nroidentidad },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (persona) {
      res.json({
        msg: 'El número de identidad ya existe',
        existe: true,
        data: persona
      });
    } else {
      res.json({
        msg: 'El número de identidad está disponible',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarDni:', error);
    res.status(500).json({ msg: 'Error al verificar el número de identidad' });
  }
};

// UPDATE - Actualizar persona
export const updatePersona = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idtipopersona, nombres, apellidos, idtipoidentidad, nroidentidad, correo, telefono } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID de la persona es obligatorio" });
      return;
    }

    const persona: any = await Persona.findByPk(id);
    if (!persona) {
      res.status(404).json({ msg: `No existe una persona con el id ${id}` });
      return;
    }

    // Validar número de identidad único
    if (nroidentidad && nroidentidad !== persona.nroidentidad) {
      const existingPersona = await Persona.findOne({ where: { nroidentidad } });
      if (existingPersona && existingPersona.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El número de identidad ya está en uso' });
        return;
      }
    }

    // Validar correo único
    if (correo && correo !== persona.correo) {
      const existingPersona = await Persona.findOne({ where: { correo } });
      if (existingPersona && existingPersona.id !== parseInt(id)) {
        res.status(400).json({ msg: 'El correo electrónico ya está en uso' });
        return;
      }
    }

    // Actualizar campos
    if (idtipopersona !== undefined) persona.idtipopersona = idtipopersona;
    if (nombres) persona.nombres = nombres;
    if (apellidos) persona.apellidos = apellidos;
    if (idtipoidentidad !== undefined) persona.idtipoidentidad = idtipoidentidad;
    if (nroidentidad !== undefined) persona.nroidentidad = nroidentidad;
    if (correo !== undefined) persona.correo = correo;
    if (telefono !== undefined) persona.telefono = telefono;
    
    // Cambiar estado a ACTUALIZADO
    persona.idestado = EstadoGeneral.ACTUALIZADO;

    await persona.save();

    // Obtener la persona actualizada con relación de estado
    const personaActualizada = await Persona.findByPk(id, {
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Persona actualizada con éxito",
      data: personaActualizada
    });

  } catch (error) {
    console.error("Error en updatePersona:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// DELETE - Eliminar persona (cambiar estado a eliminado)
export const deletePersona = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const persona: any = await Persona.findByPk(id);

    if (!persona) {
      res.status(404).json({ msg: 'Persona no encontrada' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    persona.idestado = EstadoGeneral.ELIMINADO;
    await persona.save();

    res.json({ 
      msg: 'Persona eliminada con éxito',
      data: { id: persona.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deletePersona:', error);
    res.status(500).json({ msg: 'Error al eliminar la persona' });
  }
};

// READ - Listar personas eliminadas
export const getPersonasEliminadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const personas = await Persona.findAll({
      where: { idestado: EstadoGeneral.ELIMINADO },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    res.json({
      msg: 'Personas eliminadas obtenidas exitosamente',
      data: personas
    });
  } catch (error) {
    console.error('Error en getPersonasEliminadas:', error);
    res.status(500).json({ msg: 'Error al obtener personas eliminadas' });
  }
};

// UPDATE - Restaurar persona eliminada
export const restaurarPersona = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const persona: any = await Persona.findByPk(id);

    if (!persona) {
      res.status(404).json({ msg: 'Persona no encontrada' });
      return;
    }

    // Cambiar estado a REGISTRADO
    persona.idestado = EstadoGeneral.REGISTRADO;
    await persona.save();

    res.json({ 
      msg: 'Persona restaurada con éxito',
      data: { id: persona.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarPersona:', error);
    res.status(500).json({ msg: 'Error al restaurar la persona' });
  }
};

// READ - Listar clientes (tipo persona = 1 y no eliminados)
export const listarClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await Persona.findAll({
      where: { 
        idtipopersona: 1, // Filtro por tipo de persona = 1 (clientes)
        idestado: [EstadoGeneral.REGISTRADO, EstadoGeneral.ACTUALIZADO] 
      },
      include: [
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    res.json({
      msg: 'Clientes obtenidos exitosamente',
      data: clientes
    });
  } catch (error) {
    console.error('Error en listarClientes:', error);
    res.status(500).json({ msg: 'Error al obtener clientes' });
  }
};
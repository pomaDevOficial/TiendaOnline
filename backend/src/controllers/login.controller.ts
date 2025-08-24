import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import Usuario from '../models/usuario.model';
import Persona from '../models/persona.model';
import Rol from '../models/rol.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { usuario, contrasenia } = req.body;

  try {
    // Validaciones básicas
    if (!usuario || !contrasenia) {
      res.status(400).json({ 
        success: false,
        msg: 'Usuario y contraseña son obligatorios' 
      });
      return;
    }

    // Buscar el usuario
    const user = await Usuario.findOne({
      where: { 
        usuario,
        idestado: { [Op.ne]: EstadoGeneral.ELIMINADO }
      },
      include: [
        {
          model: Persona,
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'correo']
        },
        {
          model: Rol,
          as: 'Rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!user) {
      res.status(401).json({ 
        success: false,
        msg: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    // Verificar si está activo
    if (user.idestado !== EstadoGeneral.ACTIVO) {
      res.status(403).json({ 
        success: false,
        msg: 'Usuario inactivo. Contacte al administrador.' 
      });
      return;
    }

    // ✅ VERIFICAR QUE CONTRASEÑA NO SEA NULL
    if (!user.contrasenia) {
      res.status(401).json({ 
        success: false,
        msg: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    // Verificar contraseña
    const match = await bcrypt.compare(contrasenia, user.contrasenia);
    
    if (!match) {
      res.status(401).json({ 
        success: false,
        msg: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    // Crear payload del token
    const payload = {
      id: user.id,
      usuario: user.usuario,
      idrol: user.idrol,
      idpersona: user.idpersona,
      nombres: user.Persona?.nombres,
      apellidos: user.Persona?.apellidos
    };

    // ✅ Asegurar secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    // ✅ CORRECCIÓN: expiresIn debe ser número (segundos)
    const options: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN 
        ? Number(process.env.JWT_EXPIRES_IN)  // Convertir a número
        : 28800  // 8 horas en segundos (8 * 60 * 60)
    };

    // Generar token JWT
    const token = jwt.sign(payload, jwtSecret, options);

    // Respuesta exitosa
    res.json({
      success: true,
      msg: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombres: user.Persona?.nombres,
        apellidos: user.Persona?.apellidos,
        correo: user.Persona?.correo,
        rol: user.Rol?.nombre,
        idrol: user.idrol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Error en el servidor' 
    });
  }
};

// Middleware simple para verificar token
export const verifyToken = (req: Request, res: Response): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ 
      success: false,
      msg: 'Token no proporcionado' 
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ 
        success: false,
        msg: 'Error de configuración del servidor' 
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, jwtSecret);
    res.json({ 
      success: true,
      msg: 'Token válido',
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      msg: 'Token inválido o expirado' 
    });
  }
};
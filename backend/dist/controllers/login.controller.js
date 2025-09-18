"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const rol_model_1 = __importDefault(require("../models/rol.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
const login = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
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
        const user = await usuario_model_1.default.findOne({
            where: {
                usuario,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo']
                },
                {
                    model: rol_model_1.default,
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
        if (user.idestado !== estados_constans_1.EstadoGeneral.ACTIVO) {
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
        const match = await bcrypt_1.default.compare(contrasenia, user.contrasenia);
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
            nombres: (_a = user.Persona) === null || _a === void 0 ? void 0 : _a.nombres,
            apellidos: (_b = user.Persona) === null || _b === void 0 ? void 0 : _b.apellidos
        };
        // ✅ Asegurar secret
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no está configurado en las variables de entorno');
        }
        // ✅ CORRECCIÓN: expiresIn debe ser número (segundos)
        const options = {
            expiresIn: process.env.JWT_EXPIRES_IN
                ? Number(process.env.JWT_EXPIRES_IN) // Convertir a número
                : 28800 // 8 horas en segundos (8 * 60 * 60)
        };
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, options);
        // Respuesta exitosa
        res.json({
            success: true,
            msg: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                usuario: user.usuario,
                nombres: (_c = user.Persona) === null || _c === void 0 ? void 0 : _c.nombres,
                apellidos: (_d = user.Persona) === null || _d === void 0 ? void 0 : _d.apellidos,
                correo: (_e = user.Persona) === null || _e === void 0 ? void 0 : _e.correo,
                rol: (_f = user.Rol) === null || _f === void 0 ? void 0 : _f.nombre,
                idrol: user.idrol
            }
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            msg: 'Error en el servidor'
        });
    }
};
exports.login = login;
// Middleware simple para verificar token
const verifyToken = (req, res) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
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
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        res.json({
            success: true,
            msg: 'Token válido',
            user: decoded
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            msg: 'Token inválido o expirado'
        });
    }
};
exports.verifyToken = verifyToken;

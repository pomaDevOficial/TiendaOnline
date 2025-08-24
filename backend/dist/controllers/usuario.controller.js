"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsuario = exports.activarUsuario = exports.desactivarUsuario = exports.updateUsuario = exports.getUsuarioById = exports.getUsuariosInactivos = exports.getUsuariosActivos = exports.getUsuarios = exports.createUsuario = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const rol_model_1 = __importDefault(require("../models/rol.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo usuario
const createUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpersona, idrol, usuario, contrasenia, idestado } = req.body;
    try {
        // Validaciones
        if (!idpersona || !idrol || !usuario || !contrasenia) {
            res.status(400).json({
                msg: 'Los campos idpersona, idrol, usuario y contrasenia son obligatorios'
            });
            return;
        }
        const existingUser = yield usuario_model_1.default.findOne({ where: { usuario } });
        if (existingUser) {
            res.status(400).json({ msg: 'El usuario ya existe' });
            return;
        }
        const existingPersonaUser = yield usuario_model_1.default.findOne({ where: { idpersona } });
        if (existingPersonaUser) {
            res.status(400).json({ msg: 'Esta persona ya tiene un usuario registrado' });
            return;
        }
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(contrasenia, saltRounds);
        const nuevoUsuario = yield usuario_model_1.default.create({
            idrol,
            idpersona,
            usuario,
            contrasenia: hashedPassword,
            idestado: idestado || estados_constans_1.EstadoGeneral.ACTIVO
        });
        // Obtener el usuario creado con sus relaciones
        const usuarioCreado = yield usuario_model_1.default.findByPk(nuevoUsuario.id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
                    as: 'Rol',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en createUsuario:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createUsuario = createUsuario;
// READ - Listar todos los usuarios
const getUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield usuario_model_1.default.findAll({
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
                    as: 'Rol',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getUsuarios:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de usuarios' });
    }
});
exports.getUsuarios = getUsuarios;
// READ - Listar usuarios activos
const getUsuariosActivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield usuario_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ACTIVO },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getUsuariosActivos:', error);
        res.status(500).json({ msg: 'Error al obtener usuarios activos' });
    }
});
exports.getUsuariosActivos = getUsuariosActivos;
// READ - Listar usuarios inactivos
const getUsuariosInactivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield usuario_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.INACTIVO },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getUsuariosInactivos:', error);
        res.status(500).json({ msg: 'Error al obtener usuarios inactivos' });
    }
});
exports.getUsuariosInactivos = getUsuariosInactivos;
// READ - Obtener usuario por ID
const getUsuarioById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_model_1.default.findByPk(id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
                    as: 'Rol',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getUsuarioById:', error);
        res.status(500).json({ msg: 'Error al obtener el usuario' });
    }
});
exports.getUsuarioById = getUsuarioById;
// UPDATE - Actualizar usuario completo (PUT)
const updateUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idpersona, idrol, usuario, contrasenia, idestado } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del usuario es obligatorio" });
            return;
        }
        const user = yield usuario_model_1.default.findByPk(id);
        if (!user) {
            res.status(404).json({ msg: `No existe un usuario con el id ${id}` });
            return;
        }
        // Validar usuario único
        if (usuario && usuario !== user.usuario) {
            const existingUser = yield usuario_model_1.default.findOne({ where: { usuario } });
            if (existingUser && existingUser.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
                return;
            }
        }
        // Validar persona única
        if (idpersona && idpersona !== user.idpersona) {
            const existingPersonaUser = yield usuario_model_1.default.findOne({ where: { idpersona } });
            if (existingPersonaUser && existingPersonaUser.id !== parseInt(id)) {
                res.status(400).json({ msg: 'Esta persona ya tiene un usuario registrado' });
                return;
            }
        }
        // Actualizar campos
        if (idpersona)
            user.idpersona = idpersona;
        if (idrol)
            user.idrol = idrol;
        if (usuario)
            user.usuario = usuario;
        if (idestado)
            user.idestado = idestado;
        // Encriptar nueva contraseña si se proporciona
        if (contrasenia) {
            const saltRounds = 10;
            user.contrasenia = yield bcrypt_1.default.hash(contrasenia, saltRounds);
        }
        yield user.save();
        // Obtener el usuario actualizado con relaciones
        const usuarioActualizado = yield usuario_model_1.default.findByPk(id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                },
                {
                    model: rol_model_1.default,
                    as: 'Rol',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error("Error en updateUsuario:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateUsuario = updateUsuario;
// UPDATE - Desactivar usuario (cambiar estado a inactivo)
const desactivarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_model_1.default.findByPk(id);
        if (!usuario) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }
        usuario.idestado = estados_constans_1.EstadoGeneral.INACTIVO;
        yield usuario.save();
        res.json({
            msg: 'Usuario desactivado con éxito',
            data: { id: usuario.id, estado: estados_constans_1.EstadoGeneral.INACTIVO }
        });
    }
    catch (error) {
        console.error('Error en desactivarUsuario:', error);
        res.status(500).json({ msg: 'Error al desactivar el usuario' });
    }
});
exports.desactivarUsuario = desactivarUsuario;
// UPDATE - Activar usuario (cambiar estado a activo)
const activarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_model_1.default.findByPk(id);
        if (!usuario) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }
        usuario.idestado = estados_constans_1.EstadoGeneral.ACTIVO;
        yield usuario.save();
        res.json({
            msg: 'Usuario activado con éxito',
            data: { id: usuario.id, estado: estados_constans_1.EstadoGeneral.ACTIVO }
        });
    }
    catch (error) {
        console.error('Error en activarUsuario:', error);
        res.status(500).json({ msg: 'Error al activar el usuario' });
    }
});
exports.activarUsuario = activarUsuario;
// DELETE - Eliminar usuario permanentemente (si es necesario)
const deleteUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_model_1.default.findByPk(id);
        if (!usuario) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }
        yield usuario.destroy();
        res.json({
            msg: 'Usuario eliminado permanentemente',
            data: { id: parseInt(id) }
        });
    }
    catch (error) {
        console.error('Error en deleteUsuario:', error);
        res.status(500).json({ msg: 'Error al eliminar el usuario' });
    }
});
exports.deleteUsuario = deleteUsuario;

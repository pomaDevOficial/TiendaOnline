"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurarRol = exports.getRolesEliminados = exports.deleteRol = exports.updateRol = exports.getRolById = exports.getRolesRegistrados = exports.getRoles = exports.createRol = void 0;
const rol_model_1 = __importDefault(require("../models/rol.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo rol
const createRol = async (req, res) => {
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
        const existingRol = await rol_model_1.default.findOne({ where: { nombre } });
        if (existingRol) {
            res.status(400).json({ msg: 'El rol ya existe' });
            return;
        }
        // Crear nuevo rol
        const nuevoRol = await rol_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el rol creado con su relación de estado
        const rolCreado = await rol_model_1.default.findByPk(nuevoRol.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Rol creado exitosamente',
            data: rolCreado
        });
    }
    catch (error) {
        console.error('Error en createRol:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createRol = createRol;
// READ - Listar todos los roles
const getRoles = async (req, res) => {
    try {
        const roles = await rol_model_1.default.findAll({
            include: [
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getRoles:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de roles' });
    }
};
exports.getRoles = getRoles;
// READ - Listar roles registrados (no eliminados)
const getRolesRegistrados = async (req, res) => {
    try {
        const roles = await rol_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
            include: [
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getRolesRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener roles registrados' });
    }
};
exports.getRolesRegistrados = getRolesRegistrados;
// READ - Obtener rol por ID
const getRolById = async (req, res) => {
    const { id } = req.params;
    try {
        const rol = await rol_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getRolById:', error);
        res.status(500).json({ msg: 'Error al obtener el rol' });
    }
};
exports.getRolById = getRolById;
// UPDATE - Actualizar rol
const updateRol = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del rol es obligatorio" });
            return;
        }
        const rol = await rol_model_1.default.findByPk(id);
        if (!rol) {
            res.status(404).json({ msg: `No existe un rol con el id ${id}` });
            return;
        }
        // Validar nombre único
        if (nombre && nombre !== rol.nombre) {
            const existingRol = await rol_model_1.default.findOne({ where: { nombre } });
            if (existingRol && existingRol.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre del rol ya está en uso' });
                return;
            }
        }
        // Actualizar campo nombre
        if (nombre)
            rol.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        rol.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await rol.save();
        // Obtener el rol actualizado con relación de estado
        const rolActualizado = await rol_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Rol actualizado con éxito",
            data: rolActualizado
        });
    }
    catch (error) {
        console.error("Error en updateRol:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateRol = updateRol;
// DELETE - Eliminar rol (cambiar estado a eliminado)
const deleteRol = async (req, res) => {
    const { id } = req.params;
    try {
        const rol = await rol_model_1.default.findByPk(id);
        if (!rol) {
            res.status(404).json({ msg: 'Rol no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        rol.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await rol.save();
        res.json({
            msg: 'Rol eliminado con éxito',
            data: { id: rol.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteRol:', error);
        res.status(500).json({ msg: 'Error al eliminar el rol' });
    }
};
exports.deleteRol = deleteRol;
// READ - Listar roles eliminados
const getRolesEliminados = async (req, res) => {
    try {
        const roles = await rol_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: estado_model_1.default,
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
    }
    catch (error) {
        console.error('Error en getRolesEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener roles eliminados' });
    }
};
exports.getRolesEliminados = getRolesEliminados;
// UPDATE - Restaurar rol eliminado
const restaurarRol = async (req, res) => {
    const { id } = req.params;
    try {
        const rol = await rol_model_1.default.findByPk(id);
        if (!rol) {
            res.status(404).json({ msg: 'Rol no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        rol.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await rol.save();
        res.json({
            msg: 'Rol restaurado con éxito',
            data: { id: rol.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarRol:', error);
        res.status(500).json({ msg: 'Error al restaurar el rol' });
    }
};
exports.restaurarRol = restaurarRol;

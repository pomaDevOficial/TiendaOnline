"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarNombreTalla = exports.restaurarTalla = exports.getTallasEliminadas = exports.deleteTalla = exports.updateTalla = exports.getTallaById = exports.getTallasRegistradas = exports.getTallas = exports.createTalla = void 0;
const talla_model_1 = __importDefault(require("../models/talla.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nueva talla
const createTalla = async (req, res) => {
    const { nombre } = req.body;
    try {
        // Validaciones
        if (!nombre) {
            res.status(400).json({
                msg: 'El campo nombre es obligatorio'
            });
            return;
        }
        // Verificar si la talla ya existe (excluyendo eliminados)
        const existingTalla = await talla_model_1.default.findOne({
            where: {
                nombre,
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            }
        });
        // Crear nueva talla
        const nuevaTalla = await talla_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener la talla creada con su relación de estado
        const tallaCreada = await talla_model_1.default.findByPk(nuevaTalla.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Talla creada exitosamente',
            data: tallaCreada
        });
    }
    catch (error) {
        console.error('Error en createTalla:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createTalla = createTalla;
// READ - Listar todas las tallas
const getTallas = async (req, res) => {
    try {
        const tallas = await talla_model_1.default.findAll({
            where: { idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO] },
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
            msg: 'Lista de tallas obtenida exitosamente',
            data: tallas
        });
    }
    catch (error) {
        console.error('Error en getTallas:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de tallas' });
    }
};
exports.getTallas = getTallas;
// READ - Listar tallas registradas (no eliminadas)
const getTallasRegistradas = async (req, res) => {
    try {
        const tallas = await talla_model_1.default.findAll({
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
            msg: 'Tallas registradas obtenidas exitosamente',
            data: tallas
        });
    }
    catch (error) {
        console.error('Error en getTallasRegistradas:', error);
        res.status(500).json({ msg: 'Error al obtener tallas registradas' });
    }
};
exports.getTallasRegistradas = getTallasRegistradas;
// READ - Obtener talla por ID
const getTallaById = async (req, res) => {
    const { id } = req.params;
    try {
        const talla = await talla_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!talla) {
            res.status(404).json({ msg: 'Talla no encontrada' });
            return;
        }
        res.json({
            msg: 'Talla obtenida exitosamente',
            data: talla
        });
    }
    catch (error) {
        console.error('Error en getTallaById:', error);
        res.status(500).json({ msg: 'Error al obtener la talla' });
    }
};
exports.getTallaById = getTallaById;
// UPDATE - Actualizar talla
const updateTalla = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la talla es obligatorio" });
            return;
        }
        const talla = await talla_model_1.default.findByPk(id);
        if (!talla) {
            res.status(404).json({ msg: `No existe una talla con el id ${id}` });
            return;
        }
        // Validar nombre único (excluyendo eliminados)
        if (nombre && nombre !== talla.nombre) {
            const existingTalla = await talla_model_1.default.findOne({
                where: {
                    nombre,
                    idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
                }
            });
            if (existingTalla && existingTalla.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre de la talla ya está en uso' });
                return;
            }
        }
        // Actualizar campo nombre
        if (nombre)
            talla.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        talla.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await talla.save();
        // Obtener la talla actualizada con relación de estado
        const tallaActualizada = await talla_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Talla actualizada con éxito",
            data: tallaActualizada
        });
    }
    catch (error) {
        console.error("Error en updateTalla:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateTalla = updateTalla;
// DELETE - Eliminar talla (cambiar estado a eliminado)
const deleteTalla = async (req, res) => {
    const { id } = req.params;
    try {
        const talla = await talla_model_1.default.findByPk(id);
        if (!talla) {
            res.status(404).json({ msg: 'Talla no encontrada' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        talla.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await talla.save();
        res.json({
            msg: 'Talla eliminada con éxito',
            data: { id: talla.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteTalla:', error);
        res.status(500).json({ msg: 'Error al eliminar la talla' });
    }
};
exports.deleteTalla = deleteTalla;
// READ - Listar tallas eliminadas
const getTallasEliminadas = async (req, res) => {
    try {
        const tallas = await talla_model_1.default.findAll({
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
            msg: 'Tallas eliminadas obtenidas exitosamente',
            data: tallas
        });
    }
    catch (error) {
        console.error('Error en getTallasEliminadas:', error);
        res.status(500).json({ msg: 'Error al obtener tallas eliminadas' });
    }
};
exports.getTallasEliminadas = getTallasEliminadas;
// UPDATE - Restaurar talla eliminada
const restaurarTalla = async (req, res) => {
    const { id } = req.params;
    try {
        const talla = await talla_model_1.default.findByPk(id);
        if (!talla) {
            res.status(404).json({ msg: 'Talla no encontrada' });
            return;
        }
        // Cambiar estado a REGISTRADO
        talla.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await talla.save();
        res.json({
            msg: 'Talla restaurada con éxito',
            data: { id: talla.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarTalla:', error);
        res.status(500).json({ msg: 'Error al restaurar la talla' });
    }
};
exports.restaurarTalla = restaurarTalla;
// READ - Verificar si existe una talla con el nombre
const verificarNombreTalla = async (req, res) => {
    const { nombre } = req.params;
    try {
        if (!nombre) {
            res.status(400).json({
                msg: 'El nombre de la talla es requerido'
            });
            return;
        }
        const talla = await talla_model_1.default.findOne({
            where: { nombre },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (talla) {
            res.json({
                msg: 'El nombre de la talla ya existe',
                existe: true,
                data: talla
            });
        }
        else {
            res.json({
                msg: 'El nombre de la talla está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarNombreTalla:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre de la talla' });
    }
};
exports.verificarNombreTalla = verificarNombreTalla;

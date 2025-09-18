"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarNombreTipoSerie = exports.restaurarTipoSerie = exports.getTiposSerieEliminados = exports.deleteTipoSerie = exports.updateTipoSerie = exports.getTipoSerieById = exports.getTiposSerieRegistrados = exports.getTiposSerie = exports.createTipoSerie = void 0;
const tiposerie_model_1 = __importDefault(require("../models/tiposerie.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo tipo de serie
const createTipoSerie = async (req, res) => {
    const { nombre } = req.body;
    try {
        // Validaciones
        if (!nombre) {
            res.status(400).json({
                msg: 'El campo nombre es obligatorio'
            });
            return;
        }
        // Verificar si el tipo de serie ya existe
        const existingTipoSerie = await tiposerie_model_1.default.findOne({ where: { nombre } });
        if (existingTipoSerie) {
            res.status(400).json({ msg: 'El tipo de serie ya existe' });
            return;
        }
        // Crear nuevo tipo de serie
        const nuevoTipoSerie = await tiposerie_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el tipo de serie creado con su relación de estado
        const tipoSerieCreado = await tiposerie_model_1.default.findByPk(nuevoTipoSerie.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Tipo de serie creado exitosamente',
            data: tipoSerieCreado
        });
    }
    catch (error) {
        console.error('Error en createTipoSerie:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createTipoSerie = createTipoSerie;
// READ - Listar todos los tipos de serie
const getTiposSerie = async (req, res) => {
    try {
        const tiposSerie = await tiposerie_model_1.default.findAll({
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
            msg: 'Lista de tipos de serie obtenida exitosamente',
            data: tiposSerie
        });
    }
    catch (error) {
        console.error('Error en getTiposSerie:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de tipos de serie' });
    }
};
exports.getTiposSerie = getTiposSerie;
// READ - Listar tipos de serie registrados (no eliminados)
const getTiposSerieRegistrados = async (req, res) => {
    try {
        const tiposSerie = await tiposerie_model_1.default.findAll({
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
            msg: 'Tipos de serie registrados obtenidos exitosamente',
            data: tiposSerie
        });
    }
    catch (error) {
        console.error('Error en getTiposSerieRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener tipos de serie registrados' });
    }
};
exports.getTiposSerieRegistrados = getTiposSerieRegistrados;
// READ - Obtener tipo de serie por ID
const getTipoSerieById = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoSerie = await tiposerie_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!tipoSerie) {
            res.status(404).json({ msg: 'Tipo de serie no encontrado' });
            return;
        }
        res.json({
            msg: 'Tipo de serie obtenido exitosamente',
            data: tipoSerie
        });
    }
    catch (error) {
        console.error('Error en getTipoSerieById:', error);
        res.status(500).json({ msg: 'Error al obtener el tipo de serie' });
    }
};
exports.getTipoSerieById = getTipoSerieById;
// UPDATE - Actualizar tipo de serie
const updateTipoSerie = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del tipo de serie es obligatorio" });
            return;
        }
        const tipoSerie = await tiposerie_model_1.default.findByPk(id);
        if (!tipoSerie) {
            res.status(404).json({ msg: `No existe un tipo de serie con el id ${id}` });
            return;
        }
        // Validar nombre único
        if (nombre && nombre !== tipoSerie.nombre) {
            const existingTipoSerie = await tiposerie_model_1.default.findOne({ where: { nombre } });
            if (existingTipoSerie && existingTipoSerie.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre del tipo de serie ya está en uso' });
                return;
            }
        }
        // Actualizar campo nombre
        if (nombre)
            tipoSerie.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        tipoSerie.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await tipoSerie.save();
        // Obtener el tipo de serie actualizado con relación de estado
        const tipoSerieActualizado = await tiposerie_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Tipo de serie actualizado con éxito",
            data: tipoSerieActualizado
        });
    }
    catch (error) {
        console.error("Error en updateTipoSerie:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateTipoSerie = updateTipoSerie;
// DELETE - Eliminar tipo de serie (cambiar estado a eliminado)
const deleteTipoSerie = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoSerie = await tiposerie_model_1.default.findByPk(id);
        if (!tipoSerie) {
            res.status(404).json({ msg: 'Tipo de serie no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        tipoSerie.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await tipoSerie.save();
        res.json({
            msg: 'Tipo de serie eliminado con éxito',
            data: { id: tipoSerie.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteTipoSerie:', error);
        res.status(500).json({ msg: 'Error al eliminar el tipo de serie' });
    }
};
exports.deleteTipoSerie = deleteTipoSerie;
// READ - Listar tipos de serie eliminados
const getTiposSerieEliminados = async (req, res) => {
    try {
        const tiposSerie = await tiposerie_model_1.default.findAll({
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
            msg: 'Tipos de serie eliminados obtenidos exitosamente',
            data: tiposSerie
        });
    }
    catch (error) {
        console.error('Error en getTiposSerieEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener tipos de serie eliminados' });
    }
};
exports.getTiposSerieEliminados = getTiposSerieEliminados;
// UPDATE - Restaurar tipo de serie eliminado
const restaurarTipoSerie = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoSerie = await tiposerie_model_1.default.findByPk(id);
        if (!tipoSerie) {
            res.status(404).json({ msg: 'Tipo de serie no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        tipoSerie.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await tipoSerie.save();
        res.json({
            msg: 'Tipo de serie restaurado con éxito',
            data: { id: tipoSerie.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarTipoSerie:', error);
        res.status(500).json({ msg: 'Error al restaurar el tipo de serie' });
    }
};
exports.restaurarTipoSerie = restaurarTipoSerie;
// READ - Verificar si existe un tipo de serie con el nombre
const verificarNombreTipoSerie = async (req, res) => {
    const { nombre } = req.params;
    try {
        if (!nombre) {
            res.status(400).json({
                msg: 'El nombre del tipo de serie es requerido'
            });
            return;
        }
        const tipoSerie = await tiposerie_model_1.default.findOne({
            where: { nombre },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (tipoSerie) {
            res.json({
                msg: 'El nombre del tipo de serie ya existe',
                existe: true,
                data: tipoSerie
            });
        }
        else {
            res.json({
                msg: 'El nombre del tipo de serie está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarNombreTipoSerie:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre del tipo de serie' });
    }
};
exports.verificarNombreTipoSerie = verificarNombreTipoSerie;

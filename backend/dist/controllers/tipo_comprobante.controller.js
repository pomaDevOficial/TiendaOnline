"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarNombreTipoComprobante = exports.restaurarTipoComprobante = exports.getTiposComprobanteEliminados = exports.deleteTipoComprobante = exports.updateTipoComprobante = exports.getTipoComprobanteById = exports.getTiposComprobanteRegistrados = exports.getTiposComprobante = exports.createTipoComprobante = void 0;
const tipo_comprobante_model_1 = __importDefault(require("../models/tipo_comprobante.model"));
const tiposerie_model_1 = __importDefault(require("../models/tiposerie.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo tipo de comprobante
const createTipoComprobante = async (req, res) => {
    const { idtiposerie, nombre } = req.body;
    try {
        // Validaciones
        if (!nombre || !idtiposerie) {
            res.status(400).json({
                msg: 'Los campos nombre e idtiposerie son obligatorios'
            });
            return;
        }
        // Verificar si el tipo de comprobante ya existe
        const existingTipoComprobante = await tipo_comprobante_model_1.default.findOne({ where: { nombre } });
        if (existingTipoComprobante) {
            res.status(400).json({ msg: 'El tipo de comprobante ya existe' });
            return;
        }
        // Verificar si el tipo de serie existe
        const tipoSerie = await tiposerie_model_1.default.findByPk(idtiposerie);
        if (!tipoSerie) {
            res.status(400).json({ msg: 'El tipo de serie no existe' });
            return;
        }
        // Crear nuevo tipo de comprobante
        const nuevoTipoComprobante = await tipo_comprobante_model_1.default.create({
            idtiposerie,
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el tipo de comprobante creado con sus relaciones
        const tipoComprobanteCreado = await tipo_comprobante_model_1.default.findByPk(nuevoTipoComprobante.id, {
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Tipo de comprobante creado exitosamente',
            data: tipoComprobanteCreado
        });
    }
    catch (error) {
        console.error('Error en createTipoComprobante:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createTipoComprobante = createTipoComprobante;
// READ - Listar todos los tipos de comprobante
const getTiposComprobante = async (req, res) => {
    try {
        const tiposComprobante = await tipo_comprobante_model_1.default.findAll({
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de tipos de comprobante obtenida exitosamente',
            data: tiposComprobante
        });
    }
    catch (error) {
        console.error('Error en getTiposComprobante:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de tipos de comprobante' });
    }
};
exports.getTiposComprobante = getTiposComprobante;
// READ - Listar tipos de comprobante registrados (no eliminados)
const getTiposComprobanteRegistrados = async (req, res) => {
    try {
        const tiposComprobante = await tipo_comprobante_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Tipos de comprobante registrados obtenidos exitosamente',
            data: tiposComprobante
        });
    }
    catch (error) {
        console.error('Error en getTiposComprobanteRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener tipos de comprobante registrados' });
    }
};
exports.getTiposComprobanteRegistrados = getTiposComprobanteRegistrados;
// READ - Obtener tipo de comprobante por ID
const getTipoComprobanteById = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!tipoComprobante) {
            res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
            return;
        }
        res.json({
            msg: 'Tipo de comprobante obtenido exitosamente',
            data: tipoComprobante
        });
    }
    catch (error) {
        console.error('Error en getTipoComprobanteById:', error);
        res.status(500).json({ msg: 'Error al obtener el tipo de comprobante' });
    }
};
exports.getTipoComprobanteById = getTipoComprobanteById;
// UPDATE - Actualizar tipo de comprobante
const updateTipoComprobante = async (req, res) => {
    const { id } = req.params;
    const { idtiposerie, nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del tipo de comprobante es obligatorio" });
            return;
        }
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(id);
        if (!tipoComprobante) {
            res.status(404).json({ msg: `No existe un tipo de comprobante con el id ${id}` });
            return;
        }
        // Validar nombre único
        if (nombre && nombre !== tipoComprobante.nombre) {
            const existingTipoComprobante = await tipo_comprobante_model_1.default.findOne({ where: { nombre } });
            if (existingTipoComprobante && existingTipoComprobante.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre del tipo de comprobante ya está en uso' });
                return;
            }
        }
        // Verificar si el tipo de serie existe
        if (idtiposerie) {
            const tipoSerie = await tiposerie_model_1.default.findByPk(idtiposerie);
            if (!tipoSerie) {
                res.status(400).json({ msg: 'El tipo de serie no existe' });
                return;
            }
        }
        // Actualizar campos
        if (idtiposerie)
            tipoComprobante.idtiposerie = idtiposerie;
        if (nombre)
            tipoComprobante.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        tipoComprobante.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await tipoComprobante.save();
        // Obtener el tipo de comprobante actualizado con relaciones
        const tipoComprobanteActualizado = await tipo_comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Tipo de comprobante actualizado con éxito",
            data: tipoComprobanteActualizado
        });
    }
    catch (error) {
        console.error("Error en updateTipoComprobante:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateTipoComprobante = updateTipoComprobante;
// DELETE - Eliminar tipo de comprobante (cambiar estado a eliminado)
const deleteTipoComprobante = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(id);
        if (!tipoComprobante) {
            res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        tipoComprobante.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await tipoComprobante.save();
        res.json({
            msg: 'Tipo de comprobante eliminado con éxito',
            data: { id: tipoComprobante.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteTipoComprobante:', error);
        res.status(500).json({ msg: 'Error al eliminar el tipo de comprobante' });
    }
};
exports.deleteTipoComprobante = deleteTipoComprobante;
// READ - Listar tipos de comprobante eliminados
const getTiposComprobanteEliminados = async (req, res) => {
    try {
        const tiposComprobante = await tipo_comprobante_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Tipos de comprobante eliminados obtenidos exitosamente',
            data: tiposComprobante
        });
    }
    catch (error) {
        console.error('Error en getTiposComprobanteEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener tipos de comprobante eliminados' });
    }
};
exports.getTiposComprobanteEliminados = getTiposComprobanteEliminados;
// UPDATE - Restaurar tipo de comprobante eliminado
const restaurarTipoComprobante = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(id);
        if (!tipoComprobante) {
            res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        tipoComprobante.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await tipoComprobante.save();
        res.json({
            msg: 'Tipo de comprobante restaurado con éxito',
            data: { id: tipoComprobante.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarTipoComprobante:', error);
        res.status(500).json({ msg: 'Error al restaurar el tipo de comprobante' });
    }
};
exports.restaurarTipoComprobante = restaurarTipoComprobante;
// READ - Verificar si existe un tipo de comprobante con el nombre
const verificarNombreTipoComprobante = async (req, res) => {
    const { nombre } = req.params;
    try {
        if (!nombre) {
            res.status(400).json({
                msg: 'El nombre del tipo de comprobante es requerido'
            });
            return;
        }
        const tipoComprobante = await tipo_comprobante_model_1.default.findOne({
            where: { nombre },
            include: [
                {
                    model: tiposerie_model_1.default,
                    as: 'TipoSerie',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (tipoComprobante) {
            res.json({
                msg: 'El nombre del tipo de comprobante ya existe',
                existe: true,
                data: tipoComprobante
            });
        }
        else {
            res.json({
                msg: 'El nombre del tipo de comprobante está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarNombreTipoComprobante:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre del tipo de comprobante' });
    }
};
exports.verificarNombreTipoComprobante = verificarNombreTipoComprobante;

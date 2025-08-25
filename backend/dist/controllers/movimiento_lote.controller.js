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
exports.restaurarMovimientoLote = exports.deleteMovimientoLote = exports.getMovimientosEliminados = exports.getMovimientosByLoteTalla = exports.getMovimientoLoteById = exports.getMovimientosRegistrados = exports.getMovimientosLote = exports.updateMovimientoLote = exports.createMovimientoLote = void 0;
const movimiento_lote_model_1 = __importDefault(require("../models/movimiento_lote.model"));
const lote_talla_model_1 = __importDefault(require("../models/lote_talla.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Insertar nuevo movimiento de lote
const createMovimientoLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idlote_talla, tipomovimiento, cantidad, fechamovimiento } = req.body;
    try {
        // Validaciones
        if (!idlote_talla || !tipomovimiento || cantidad === undefined) {
            res.status(400).json({
                msg: 'Los campos idlote_talla, tipomovimiento y cantidad son obligatorios'
            });
            return;
        }
        // Verificar si existe el lote_talla
        const loteTalla = yield lote_talla_model_1.default.findByPk(idlote_talla);
        if (!loteTalla) {
            res.status(400).json({ msg: 'El lote_talla no existe' });
            return;
        }
        // Validar tipo de movimiento
        const tiposPermitidos = ['INGRESO', 'SALIDA', 'AJUSTE'];
        if (!tiposPermitidos.includes(tipomovimiento.toUpperCase())) {
            res.status(400).json({
                msg: 'Tipo de movimiento inválido. Debe ser: INGRESO, SALIDA o AJUSTE'
            });
            return;
        }
        // Crear nuevo movimiento de lote
        const nuevoMovimiento = yield movimiento_lote_model_1.default.create({
            idlote_talla,
            tipomovimiento: tipomovimiento.toUpperCase(),
            cantidad,
            fechamovimiento: fechamovimiento || new Date(),
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el movimiento creado con sus relaciones
        const movimientoCreado = yield movimiento_lote_model_1.default.findByPk(nuevoMovimiento.id, {
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Movimiento de lote creado exitosamente',
            data: movimientoCreado
        });
    }
    catch (error) {
        console.error('Error en createMovimientoLote:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createMovimientoLote = createMovimientoLote;
// UPDATE - Actualizar movimiento de lote
const updateMovimientoLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idlote_talla, tipomovimiento, cantidad, fechamovimiento } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del movimiento es obligatorio" });
            return;
        }
        const movimiento = yield movimiento_lote_model_1.default.findByPk(id);
        if (!movimiento) {
            res.status(404).json({ msg: `No existe un movimiento con el id ${id}` });
            return;
        }
        // Verificar si existe el lote_talla (si se está actualizando)
        if (idlote_talla) {
            const loteTalla = yield lote_talla_model_1.default.findByPk(idlote_talla);
            if (!loteTalla) {
                res.status(400).json({ msg: 'El lote_talla no existe' });
                return;
            }
        }
        // Validar tipo de movimiento (si se está actualizando)
        if (tipomovimiento) {
            const tiposPermitidos = ['INGRESO', 'SALIDA', 'AJUSTE'];
            if (!tiposPermitidos.includes(tipomovimiento.toUpperCase())) {
                res.status(400).json({
                    msg: 'Tipo de movimiento inválido. Debe ser: INGRESO, SALIDA o AJUSTE'
                });
                return;
            }
        }
        // Actualizar campos
        if (idlote_talla)
            movimiento.idlote_talla = idlote_talla;
        if (tipomovimiento)
            movimiento.tipomovimiento = tipomovimiento.toUpperCase();
        if (cantidad !== undefined)
            movimiento.cantidad = cantidad;
        if (fechamovimiento)
            movimiento.fechamovimiento = fechamovimiento;
        // Cambiar estado a ACTUALIZADO si no está eliminado
        if (movimiento.idestado !== estados_constans_1.EstadoGeneral.ELIMINADO) {
            movimiento.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        }
        yield movimiento.save();
        // Obtener el movimiento actualizado con relaciones
        const movimientoActualizado = yield movimiento_lote_model_1.default.findByPk(id, {
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Movimiento de lote actualizado con éxito",
            data: movimientoActualizado
        });
    }
    catch (error) {
        console.error("Error en updateMovimientoLote:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateMovimientoLote = updateMovimientoLote;
// READ - Listar todos los movimientos de lote
const getMovimientosLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movimientos = yield movimiento_lote_model_1.default.findAll({
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechamovimiento', 'DESC']]
        });
        res.json({
            msg: 'Lista de movimientos obtenida exitosamente',
            data: movimientos
        });
    }
    catch (error) {
        console.error('Error en getMovimientosLote:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de movimientos' });
    }
});
exports.getMovimientosLote = getMovimientosLote;
// READ - Listar movimientos registrados/actualizados (no eliminados)
const getMovimientosRegistrados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movimientos = yield movimiento_lote_model_1.default.findAll({
            where: {
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechamovimiento', 'DESC']]
        });
        res.json({
            msg: 'Movimientos registrados obtenidos exitosamente',
            data: movimientos
        });
    }
    catch (error) {
        console.error('Error en getMovimientosRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener movimientos registrados' });
    }
});
exports.getMovimientosRegistrados = getMovimientosRegistrados;
// READ - Obtener movimiento por ID
const getMovimientoLoteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movimiento = yield movimiento_lote_model_1.default.findByPk(id, {
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!movimiento) {
            res.status(404).json({ msg: 'Movimiento no encontrado' });
            return;
        }
        res.json({
            msg: 'Movimiento obtenido exitosamente',
            data: movimiento
        });
    }
    catch (error) {
        console.error('Error en getMovimientoLoteById:', error);
        res.status(500).json({ msg: 'Error al obtener el movimiento' });
    }
});
exports.getMovimientoLoteById = getMovimientoLoteById;
// READ - Obtener movimientos por lote_talla
const getMovimientosByLoteTalla = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idlote_talla } = req.params;
    try {
        const movimientos = yield movimiento_lote_model_1.default.findAll({
            where: {
                idlote_talla,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechamovimiento', 'DESC']]
        });
        res.json({
            msg: 'Movimientos del lote_talla obtenidos exitosamente',
            data: movimientos
        });
    }
    catch (error) {
        console.error('Error en getMovimientosByLoteTalla:', error);
        res.status(500).json({ msg: 'Error al obtener movimientos del lote_talla' });
    }
});
exports.getMovimientosByLoteTalla = getMovimientosByLoteTalla;
// READ - Listar movimientos eliminados
const getMovimientosEliminados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movimientos = yield movimiento_lote_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso']
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['fechamovimiento', 'DESC']]
        });
        res.json({
            msg: 'Movimientos eliminados obtenidos exitosamente',
            data: movimientos
        });
    }
    catch (error) {
        console.error('Error en getMovimientosEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener movimientos eliminados' });
    }
});
exports.getMovimientosEliminados = getMovimientosEliminados;
// DELETE - Eliminar movimiento (cambiar estado a eliminado)
const deleteMovimientoLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movimiento = yield movimiento_lote_model_1.default.findByPk(id);
        if (!movimiento) {
            res.status(404).json({ msg: 'Movimiento no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        movimiento.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        yield movimiento.save();
        res.json({
            msg: 'Movimiento eliminado con éxito',
            data: { id: movimiento.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteMovimientoLote:', error);
        res.status(500).json({ msg: 'Error al eliminar el movimiento' });
    }
});
exports.deleteMovimientoLote = deleteMovimientoLote;
// UPDATE - Restaurar movimiento eliminado
const restaurarMovimientoLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movimiento = yield movimiento_lote_model_1.default.findByPk(id);
        if (!movimiento) {
            res.status(404).json({ msg: 'Movimiento no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        movimiento.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        yield movimiento.save();
        res.json({
            msg: 'Movimiento restaurado con éxito',
            data: { id: movimiento.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarMovimientoLote:', error);
        res.status(500).json({ msg: 'Error al restaurar el movimiento' });
    }
});
exports.restaurarMovimientoLote = restaurarMovimientoLote;

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
exports.deleteComprobante = exports.restaurarComprobante = exports.anularComprobante = exports.getComprobantesAnulados = exports.getComprobantesByVenta = exports.getComprobanteById = exports.getComprobantesRegistrados = exports.getComprobantesByFecha = exports.getComprobantes = exports.updateComprobante = exports.createComprobante = void 0;
const comprobante_model_1 = __importDefault(require("../models/comprobante.model"));
const venta_model_1 = __importDefault(require("../models/venta.model"));
const tipo_comprobante_model_1 = __importDefault(require("../models/tipo_comprobante.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Insertar nuevo comprobante
const createComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idventa, igv, descuento, total, idtipocomprobante, numserie } = req.body;
    try {
        // Validaciones
        if (!idventa || !idtipocomprobante || total === undefined) {
            res.status(400).json({
                msg: 'Los campos idventa, idtipocomprobante y total son obligatorios'
            });
            return;
        }
        // Verificar si existe la venta
        const venta = yield venta_model_1.default.findByPk(idventa);
        if (!venta) {
            res.status(400).json({ msg: 'La venta no existe' });
            return;
        }
        // Verificar si existe el tipo de comprobante
        const tipoComprobante = yield tipo_comprobante_model_1.default.findByPk(idtipocomprobante);
        if (!tipoComprobante) {
            res.status(400).json({ msg: 'El tipo de comprobante no existe' });
            return;
        }
        // Verificar si la venta ya tiene un comprobante asociado
        const comprobanteExistente = yield comprobante_model_1.default.findOne({
            where: { idventa }
        });
        if (comprobanteExistente) {
            res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
            return;
        }
        // Crear nuevo comprobante
        const nuevoComprobante = yield comprobante_model_1.default.create({
            idventa,
            igv: igv || 0,
            descuento: descuento || 0,
            total,
            idtipocomprobante,
            numserie: numserie || null,
            idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
        });
        // Obtener el comprobante creado con sus relaciones
        const comprobanteCreado = yield comprobante_model_1.default.findByPk(nuevoComprobante.id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Comprobante creado exitosamente',
            data: comprobanteCreado
        });
    }
    catch (error) {
        console.error('Error en createComprobante:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createComprobante = createComprobante;
// UPDATE - Actualizar comprobante
const updateComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idventa, igv, descuento, total, idtipocomprobante, numserie } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del comprobante es obligatorio" });
            return;
        }
        const comprobante = yield comprobante_model_1.default.findByPk(id);
        if (!comprobante) {
            res.status(404).json({ msg: `No existe un comprobante con el id ${id}` });
            return;
        }
        // Verificar si existe la venta (si se está actualizando)
        if (idventa && idventa !== comprobante.idventa) {
            const venta = yield venta_model_1.default.findByPk(idventa);
            if (!venta) {
                res.status(400).json({ msg: 'La venta no existe' });
                return;
            }
            // Verificar si la nueva venta ya tiene un comprobante asociado
            const comprobanteExistente = yield comprobante_model_1.default.findOne({
                where: { idventa }
            });
            if (comprobanteExistente) {
                res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
                return;
            }
        }
        // Verificar si existe el tipo de comprobante (si se está actualizando)
        if (idtipocomprobante) {
            const tipoComprobante = yield tipo_comprobante_model_1.default.findByPk(idtipocomprobante);
            if (!tipoComprobante) {
                res.status(400).json({ msg: 'El tipo de comprobante no existe' });
                return;
            }
        }
        // Actualizar campos
        if (idventa)
            comprobante.idventa = idventa;
        if (igv !== undefined)
            comprobante.igv = igv;
        if (descuento !== undefined)
            comprobante.descuento = descuento;
        if (total !== undefined)
            comprobante.total = total;
        if (idtipocomprobante)
            comprobante.idtipocomprobante = idtipocomprobante;
        if (numserie !== undefined)
            comprobante.numserie = numserie;
        yield comprobante.save();
        // Obtener el comprobante actualizado con relaciones
        const comprobanteActualizado = yield comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Comprobante actualizado con éxito",
            data: comprobanteActualizado
        });
    }
    catch (error) {
        console.error("Error en updateComprobante:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateComprobante = updateComprobante;
// READ - Listar todos los comprobantes
const getComprobantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comprobantes = yield comprobante_model_1.default.findAll({
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'DESC']]
        });
        res.json({
            msg: 'Lista de comprobantes obtenida exitosamente',
            data: comprobantes
        });
    }
    catch (error) {
        console.error('Error en getComprobantes:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de comprobantes' });
    }
});
exports.getComprobantes = getComprobantes;
// READ - Listar comprobantes por rango de fechas
const getComprobantesByFecha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fechaInicio, fechaFin } = req.query;
    try {
        if (!fechaInicio || !fechaFin) {
            res.status(400).json({
                msg: 'Los parámetros fechaInicio y fechaFin son obligatorios'
            });
            return;
        }
        const comprobantes = yield comprobante_model_1.default.findAll({
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    where: {
                        fechaventa: {
                            [sequelize_1.Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
                        }
                    },
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [[{ model: venta_model_1.default, as: 'Venta' }, 'fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Comprobantes por fecha obtenidos exitosamente',
            data: comprobantes
        });
    }
    catch (error) {
        console.error('Error en getComprobantesByFecha:', error);
        res.status(500).json({ msg: 'Error al obtener comprobantes por fecha' });
    }
});
exports.getComprobantesByFecha = getComprobantesByFecha;
// READ - Listar comprobantes registrados (no anulados)
const getComprobantesRegistrados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comprobantes = yield comprobante_model_1.default.findAll({
            where: {
                idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
            },
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'DESC']]
        });
        res.json({
            msg: 'Comprobantes registrados obtenidos exitosamente',
            data: comprobantes
        });
    }
    catch (error) {
        console.error('Error en getComprobantesRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener comprobantes registrados' });
    }
});
exports.getComprobantesRegistrados = getComprobantesRegistrados;
// READ - Obtener comprobante por ID
const getComprobanteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comprobante = yield comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        res.json({
            msg: 'Comprobante obtenido exitosamente',
            data: comprobante
        });
    }
    catch (error) {
        console.error('Error en getComprobanteById:', error);
        res.status(500).json({ msg: 'Error al obtener el comprobante' });
    }
});
exports.getComprobanteById = getComprobanteById;
// READ - Obtener comprobantes por venta
const getComprobantesByVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idventa } = req.params;
    try {
        const comprobantes = yield comprobante_model_1.default.findAll({
            where: { idventa },
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'DESC']]
        });
        res.json({
            msg: 'Comprobantes de la venta obtenidos exitosamente',
            data: comprobantes
        });
    }
    catch (error) {
        console.error('Error en getComprobantesByVenta:', error);
        res.status(500).json({ msg: 'Error al obtener comprobantes de la venta' });
    }
});
exports.getComprobantesByVenta = getComprobantesByVenta;
// READ - Listar comprobantes anulados
const getComprobantesAnulados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comprobantes = yield comprobante_model_1.default.findAll({
            where: { idestado: estados_constans_1.ComprobanteEstado.ANULADO },
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'nombre', 'email']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'dni']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre', 'codigo']
                }
            ],
            order: [['id', 'DESC']]
        });
        res.json({
            msg: 'Comprobantes anulados obtenidos exitosamente',
            data: comprobantes
        });
    }
    catch (error) {
        console.error('Error en getComprobantesAnulados:', error);
        res.status(500).json({ msg: 'Error al obtener comprobantes anulados' });
    }
});
exports.getComprobantesAnulados = getComprobantesAnulados;
// UPDATE - Anular comprobante
const anularComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comprobante = yield comprobante_model_1.default.findByPk(id);
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        comprobante.idestado = estados_constans_1.ComprobanteEstado.ANULADO;
        yield comprobante.save();
        res.json({
            msg: 'Comprobante anulado con éxito',
            data: { id: comprobante.id, estado: estados_constans_1.ComprobanteEstado.ANULADO }
        });
    }
    catch (error) {
        console.error('Error en anularComprobante:', error);
        res.status(500).json({ msg: 'Error al anular el comprobante' });
    }
});
exports.anularComprobante = anularComprobante;
// UPDATE - Restaurar comprobante anulado
const restaurarComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comprobante = yield comprobante_model_1.default.findByPk(id);
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        comprobante.idestado = estados_constans_1.ComprobanteEstado.REGISTRADO;
        yield comprobante.save();
        res.json({
            msg: 'Comprobante restaurado con éxito',
            data: { id: comprobante.id, estado: estados_constans_1.ComprobanteEstado.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarComprobante:', error);
        res.status(500).json({ msg: 'Error al restaurar el comprobante' });
    }
});
exports.restaurarComprobante = restaurarComprobante;
// DELETE - Eliminar comprobante físicamente
const deleteComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comprobante = yield comprobante_model_1.default.findByPk(id);
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Eliminar físicamente
        yield comprobante.destroy();
        res.json({
            msg: 'Comprobante eliminado con éxito',
            data: { id }
        });
    }
    catch (error) {
        console.error('Error en deleteComprobante:', error);
        res.status(500).json({ msg: 'Error al eliminar el comprobante' });
    }
});
exports.deleteComprobante = deleteComprobante;

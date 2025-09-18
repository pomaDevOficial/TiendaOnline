"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.descargarComprobante = exports.crearVentaCompletaConComprobante = exports.crearVentaCompletaConComprobanteAdministracion = exports.deleteComprobante = exports.restaurarComprobante = exports.anularComprobante = exports.getComprobantesAnulados = exports.getComprobantesByVenta = exports.getComprobanteById = exports.getComprobantesRegistrados = exports.getComprobantesByFecha = exports.getComprobantes = exports.updateComprobante = exports.createComprobante = void 0;
const comprobante_model_1 = __importDefault(require("../models/comprobante.model"));
const venta_model_1 = __importDefault(require("../models/venta.model"));
const tipo_comprobante_model_1 = __importDefault(require("../models/tipo_comprobante.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
const wsp_controller_1 = require("./wsp.controller");
const pedido_detalle_model_1 = __importDefault(require("../models/pedido_detalle.model"));
const detalle_venta_model_1 = __importDefault(require("../models/detalle_venta.model"));
const lote_talla_model_1 = __importDefault(require("../models/lote_talla.model"));
const connection_db_1 = __importDefault(require("../db/connection.db"));
const producto_model_1 = __importDefault(require("../models/producto.model"));
const lote_model_1 = __importDefault(require("../models/lote.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const metodo_pago_model_1 = __importDefault(require("../models/metodo_pago.model"));
const talla_model_1 = __importDefault(require("../models/talla.model"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const fs_1 = __importDefault(require("fs"));
const generarPdf_helper_1 = require("../helper/generarPdf.helper");
const movimiento_lote_model_1 = __importDefault(require("../models/movimiento_lote.model"));
const connection_db_2 = __importDefault(require("../db/connection.db"));
// CREATE - Insertar nuevo comprobante
const createComprobante = async (req, res) => {
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
        const venta = await venta_model_1.default.findByPk(idventa);
        if (!venta) {
            res.status(400).json({ msg: 'La venta no existe' });
            return;
        }
        // Verificar si existe el tipo de comprobante
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idtipocomprobante);
        if (!tipoComprobante) {
            res.status(400).json({ msg: 'El tipo de comprobante no existe' });
            return;
        }
        // Verificar si la venta ya tiene un comprobante asociado
        const comprobanteExistente = await comprobante_model_1.default.findOne({
            where: { idventa }
        });
        if (comprobanteExistente) {
            res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
            return;
        }
        // Crear nuevo comprobante
        const nuevoComprobante = await comprobante_model_1.default.create({
            idventa,
            igv: igv || 0,
            descuento: descuento || 0,
            total,
            idtipocomprobante,
            numserie: numserie || null,
            idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
        });
        // Obtener el comprobante creado con sus relaciones
        const comprobanteCreado = await comprobante_model_1.default.findByPk(nuevoComprobante.id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
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
            msg: 'Comprobante creado exitosamente',
            data: comprobanteCreado
        });
    }
    catch (error) {
        console.error('Error en createComprobante:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createComprobante = createComprobante;
// UPDATE - Actualizar comprobante
const updateComprobante = async (req, res) => {
    const { id } = req.params;
    const { idventa, igv, descuento, total, idtipocomprobante, numserie } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del comprobante es obligatorio" });
            return;
        }
        const comprobante = await comprobante_model_1.default.findByPk(id);
        if (!comprobante) {
            res.status(404).json({ msg: `No existe un comprobante con el id ${id}` });
            return;
        }
        // Verificar si existe la venta (si se está actualizando)
        if (idventa && idventa !== comprobante.idventa) {
            const venta = await venta_model_1.default.findByPk(idventa);
            if (!venta) {
                res.status(400).json({ msg: 'La venta no existe' });
                return;
            }
            // Verificar si la nueva venta ya tiene un comprobante asociado
            const comprobanteExistente = await comprobante_model_1.default.findOne({
                where: { idventa }
            });
            if (comprobanteExistente) {
                res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
                return;
            }
        }
        // Verificar si existe el tipo de comprobante (si se está actualizando)
        if (idtipocomprobante) {
            const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idtipocomprobante);
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
        await comprobante.save();
        // Obtener el comprobante actualizado con relaciones
        const comprobanteActualizado = await comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
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
            msg: "Comprobante actualizado con éxito",
            data: comprobanteActualizado
        });
    }
    catch (error) {
        console.error("Error en updateComprobante:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateComprobante = updateComprobante;
// READ - Listar todos los comprobantes
const getComprobantes = async (req, res) => {
    try {
        const comprobantes = await comprobante_model_1.default.findAll({
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre']
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
};
exports.getComprobantes = getComprobantes;
// READ - Listar comprobantes por rango de fechas
const getComprobantesByFecha = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    try {
        if (!fechaInicio || !fechaFin) {
            res.status(400).json({
                msg: "Los parámetros fechaInicio y fechaFin son obligatorios",
            });
            return;
        }
        // ✅ Convertir a rango de Lima
        const inicio = moment_timezone_1.default.tz(fechaInicio, "America/Lima").startOf("day").toDate();
        const fin = moment_timezone_1.default.tz(fechaFin, "America/Lima").endOf("day").toDate();
        const comprobantes = await comprobante_model_1.default.findAll({
            include: [
                {
                    model: venta_model_1.default,
                    as: "Venta",
                    attributes: ["id", "fechaventa"],
                    where: {
                        fechaventa: {
                            [sequelize_1.Op.between]: [inicio, fin],
                        },
                    },
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: "Usuario",
                            attributes: ["id", "usuario"],
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: "Pedido",
                            attributes: ["id", "fechaoperacion", "totalimporte"],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: "Persona",
                                    attributes: ["id", "nombres", "apellidos", "nroidentidad", "telefono", "correo"],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: "TipoComprobante",
                    attributes: ["id", "nombre"],
                },
                {
                    model: estado_model_1.default,
                    as: "Estado",
                    attributes: ["id", "nombre"],
                },
            ],
            order: [[{ model: venta_model_1.default, as: "Venta" }, "fechaventa", "DESC"]],
        });
        res.json({
            msg: "Comprobantes por fecha obtenidos exitosamente",
            data: comprobantes,
        });
    }
    catch (error) {
        console.error("Error en getComprobantesByFecha:", error);
        res.status(500).json({ msg: "Error al obtener comprobantes por fecha" });
    }
};
exports.getComprobantesByFecha = getComprobantesByFecha;
// READ - Listar comprobantes registrados (no anulados)
const getComprobantesRegistrados = async (req, res) => {
    try {
        const comprobantes = await comprobante_model_1.default.findAll({
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
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre']
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
};
exports.getComprobantesRegistrados = getComprobantesRegistrados;
// READ - Obtener comprobante por ID
const getComprobanteById = async (req, res) => {
    const { id } = req.params;
    try {
        const comprobante = await comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    include: [
                        {
                            model: venta_model_1.default.associations.Usuario.target,
                            as: 'Usuario',
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre']
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
};
exports.getComprobanteById = getComprobanteById;
// READ - Obtener comprobantes por venta
const getComprobantesByVenta = async (req, res) => {
    const { idventa } = req.params;
    try {
        const comprobantes = await comprobante_model_1.default.findAll({
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
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre']
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
};
exports.getComprobantesByVenta = getComprobantesByVenta;
// READ - Listar comprobantes anulados
const getComprobantesAnulados = async (req, res) => {
    try {
        const comprobantes = await comprobante_model_1.default.findAll({
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
                            attributes: ['id', 'usuario']
                        },
                        {
                            model: venta_model_1.default.associations.Pedido.target,
                            as: 'Pedido',
                            attributes: ['id', 'fechaoperacion', 'totalimporte'],
                            include: [
                                {
                                    model: venta_model_1.default.associations.Pedido.target.associations.Persona.target,
                                    as: 'Persona',
                                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: tipo_comprobante_model_1.default,
                    as: 'TipoComprobante',
                    attributes: ['id', 'nombre']
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
};
exports.getComprobantesAnulados = getComprobantesAnulados;
// UPDATE - Anular comprobante (solo cambia estado)
const anularComprobante = async (req, res) => {
    var _a, _b, _c, _d, _e;
    const { id } = req.params;
    const transaction = await connection_db_1.default.transaction();
    try {
        const comprobante = await comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        {
                            model: pedido_model_1.default,
                            as: 'Pedido'
                        }
                    ]
                }
            ],
            transaction
        });
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Verificar si ya está anulado
        if (comprobante.idestado === estados_constans_1.ComprobanteEstado.ANULADO) {
            res.status(400).json({ msg: 'El comprobante ya está anulado' });
            return;
        }
        // 1) DEVOLVER STOCK AL INVENTARIO (igual que en eliminación)
        const pedidoDetalles = await pedido_detalle_model_1.default.findAll({
            where: { idpedido: (_b = (_a = comprobante.Venta) === null || _a === void 0 ? void 0 : _a.Pedido) === null || _b === void 0 ? void 0 : _b.id },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla'
                }
            ],
            transaction
        });
        for (const detalle of pedidoDetalles) {
            if (detalle.LoteTalla && detalle.idlote_talla && detalle.cantidad) {
                // Incrementar stock atómicamente
                await connection_db_2.default.query(`UPDATE Lote_Talla SET stock = stock + :cantidad WHERE id = :id`, {
                    replacements: { id: detalle.idlote_talla, cantidad: Number(detalle.cantidad) },
                    transaction
                });
                // Registrar movimiento de ENTRADA (devolución)
                await movimiento_lote_model_1.default.create({
                    idlote_talla: detalle.idlote_talla,
                    tipomovimiento: estados_constans_1.TipoMovimientoLote.ENTRADA,
                    cantidad: Number(detalle.cantidad),
                    fechamovimiento: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
                    idestado: estados_constans_1.EstadoGeneral.REGISTRADO
                }, { transaction });
            }
        }
        // 2) ACTUALIZAR ESTADOS (solo cambiar estados, no eliminar)
        await comprobante.update({
            idestado: estados_constans_1.ComprobanteEstado.ANULADO
        }, { transaction });
        await ((_c = comprobante.Venta) === null || _c === void 0 ? void 0 : _c.update({
            idestado: estados_constans_1.VentaEstado.ANULADO
        }, { transaction }));
        await ((_e = (_d = comprobante.Venta) === null || _d === void 0 ? void 0 : _d.Pedido) === null || _e === void 0 ? void 0 : _e.update({
            idestado: estados_constans_1.PedidoEstado.CANCELADO
        }, { transaction }));
        // Confirmar la transacción
        await transaction.commit();
        res.json({
            msg: 'Comprobante anulado con éxito y stock devuelto al inventario',
            data: { id: comprobante.id, estado: estados_constans_1.ComprobanteEstado.ANULADO }
        });
    }
    catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error en anularComprobante:', error);
        res.status(500).json({
            msg: 'Error al anular el comprobante',
            error: error.message
        });
    }
};
exports.anularComprobante = anularComprobante;
// UPDATE - Restaurar comprobante anulado con reversión de stock
const restaurarComprobante = async (req, res) => {
    var _a;
    const { id } = req.params;
    const transaction = await connection_db_1.default.transaction();
    try {
        const comprobante = await comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        {
                            model: pedido_model_1.default,
                            as: 'Pedido'
                        }
                    ]
                }
            ],
            transaction
        });
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Verificar si existe una venta asociada
        if (!comprobante.Venta) {
            res.status(404).json({ msg: 'Venta asociada al comprobante no encontrada' });
            return;
        }
        // Verificar si existe un pedido asociado
        if (!comprobante.Venta.Pedido) {
            res.status(404).json({ msg: 'Pedido asociado a la venta no encontrado' });
            return;
        }
        // CONSULTA SEPARADA PARA OBTENER LOS DETALLES DEL PEDIDO
        const pedidoDetalles = await pedido_detalle_model_1.default.findAll({
            where: { idpedido: comprobante.Venta.Pedido.id },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla'
                }
            ],
            transaction
        });
        if (!pedidoDetalles || pedidoDetalles.length === 0) {
            res.status(404).json({ msg: 'No se encontraron detalles del pedido' });
            return;
        }
        // 1) REVERTIR STOCK (QUITAR EL STOCK QUE SE HABÍA DEVUELTO)
        for (const detalle of pedidoDetalles) {
            // Validar que los campos necesarios no sean null
            if (!detalle.LoteTalla || detalle.idlote_talla === null || detalle.cantidad === null) {
                throw new Error(`Detalle de pedido ${detalle.id} tiene datos incompletos`);
            }
            const { idlote_talla, cantidad } = detalle;
            // Verificar que haya stock suficiente antes de restar
            const loteTalla = await lote_talla_model_1.default.findByPk(idlote_talla, { transaction });
            if (!loteTalla) {
                throw new Error(`LoteTalla ${idlote_talla} no encontrado`);
            }
            // Validar que stock no sea null y sea suficiente
            const stockActual = (_a = loteTalla.stock) !== null && _a !== void 0 ? _a : 0;
            const cantidadNum = Number(cantidad);
            if (stockActual < cantidadNum) {
                throw new Error(`Stock insuficiente en LoteTalla ${idlote_talla} para restaurar la venta`);
            }
            // Restar stock atómicamente (revertir la devolución)
            const [results, metadata] = await connection_db_2.default.query(`UPDATE Lote_Talla SET stock = stock - :cantidad WHERE id = :id AND stock >= :cantidad`, {
                replacements: { id: idlote_talla, cantidad: cantidadNum },
                transaction
            });
            // Verificar que se actualizó el stock (dependiendo del dialecto de la base de datos)
            const affectedRows = metadata.affectedRows || metadata.rowCount;
            if (affectedRows === 0) {
                throw new Error(`No se pudo actualizar el stock para LoteTalla ${idlote_talla}`);
            }
            // Registrar movimiento de SALIDA (reversión de la devolución)
            await movimiento_lote_model_1.default.create({
                idlote_talla: idlote_talla,
                tipomovimiento: estados_constans_1.TipoMovimientoLote.SALIDA,
                cantidad: cantidadNum,
                fechamovimiento: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
                idestado: estados_constans_1.EstadoGeneral.REGISTRADO
            }, { transaction });
        }
        // 2) ACTUALIZAR ESTADOS DE LAS ENTIDADES RELACIONADAS
        await comprobante.Venta.update({
            idestado: estados_constans_1.VentaEstado.REGISTRADO
        }, { transaction });
        await comprobante.Venta.Pedido.update({
            idestado: estados_constans_1.PedidoEstado.PAGADO
        }, { transaction });
        // 3) RESTAURAR EL COMPROBANTE
        await comprobante.update({
            idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
        }, { transaction });
        // Confirmar la transacción
        await transaction.commit();
        res.json({
            msg: 'Comprobante restaurado con éxito y stock revertido',
            data: {
                id: comprobante.id,
                estado: estados_constans_1.ComprobanteEstado.REGISTRADO,
                numserie: comprobante.numserie
            }
        });
    }
    catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error en restaurarComprobante:', error);
        res.status(500).json({
            msg: 'Error al restaurar el comprobante',
            error: error.message
        });
    }
};
exports.restaurarComprobante = restaurarComprobante;
// DELETE - Eliminar comprobante físicamente con devolución de stock
const deleteComprobante = async (req, res) => {
    const { id } = req.params;
    const transaction = await connection_db_1.default.transaction();
    try {
        const comprobante = await comprobante_model_1.default.findByPk(id, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        {
                            model: pedido_model_1.default,
                            as: 'Pedido'
                        }
                    ]
                }
            ],
            transaction
        });
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Verificar si existe una venta asociada
        if (!comprobante.Venta) {
            res.status(404).json({ msg: 'Venta asociada al comprobante no encontrada' });
            return;
        }
        // Verificar si existe un pedido asociado
        if (!comprobante.Venta.Pedido) {
            res.status(404).json({ msg: 'Pedido asociado a la venta no encontrado' });
            return;
        }
        // CONSULTA SEPARADA PARA OBTENER LOS DETALLES DEL PEDIDO
        const pedidoDetalles = await pedido_detalle_model_1.default.findAll({
            where: { idpedido: comprobante.Venta.Pedido.id },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla'
                }
            ],
            transaction
        });
        if (!pedidoDetalles || pedidoDetalles.length === 0) {
            res.status(404).json({ msg: 'No se encontraron detalles del pedido' });
            return;
        }
        // 1) DEVOLVER STOCK AL INVENTARIO
        for (const detalle of pedidoDetalles) {
            if (detalle.LoteTalla) {
                const { idlote_talla, cantidad } = detalle;
                // Incrementar stock atómicamente
                await connection_db_2.default.query(`UPDATE Lote_Talla SET stock = stock + :cantidad WHERE id = :id`, {
                    replacements: { id: idlote_talla, cantidad: Number(cantidad) },
                    transaction
                });
                // Registrar movimiento de ENTRADA (devolución)
                await movimiento_lote_model_1.default.create({
                    idlote_talla: idlote_talla,
                    tipomovimiento: estados_constans_1.TipoMovimientoLote.ENTRADA,
                    cantidad: Number(cantidad),
                    fechamovimiento: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
                    idestado: estados_constans_1.EstadoGeneral.REGISTRADO
                }, { transaction });
            }
        }
        // 2) ACTUALIZAR ESTADOS DE LAS ENTIDADES RELACIONADAS
        await comprobante.Venta.update({
            idestado: estados_constans_1.VentaEstado.ANULADO
        }, { transaction });
        await comprobante.Venta.Pedido.update({
            idestado: estados_constans_1.PedidoEstado.CANCELADO
        }, { transaction });
        // 3) ELIMINAR FÍSICAMENTE EL COMPROBANTE
        await comprobante.destroy({ transaction });
        // Confirmar la transacción
        await transaction.commit();
        res.json({
            msg: 'Comprobante eliminado con éxito y stock devuelto al inventario',
            data: { id }
        });
    }
    catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error en deleteComprobante:', error);
        res.status(500).json({
            msg: 'Error al eliminar el comprobante',
            error: error.message
        });
    }
};
exports.deleteComprobante = deleteComprobante;
/// MÉTODO COMPLETO DE LA VENTA POR LA ADMINISTRACIÓN
const crearVentaCompletaConComprobanteAdministracion = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { cliente, metodoPago, productos, total, idusuario, fechaventa } = req.body;
    // 0) VALIDACIONES BÁSICAS
    if (!(cliente === null || cliente === void 0 ? void 0 : cliente.id) || !(metodoPago === null || metodoPago === void 0 ? void 0 : metodoPago.id) || !Array.isArray(productos) || productos.length === 0) {
        res.status(400).json({ msg: 'cliente.id, metodoPago.id y productos[] son obligatorios' });
        return;
    }
    if (!idusuario && !((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(400).json({ msg: 'idusuario es obligatorio (o debe venir en req.user)' });
        return;
    }
    const transaction = await connection_db_1.default.transaction();
    try {
        // 1) CREAR PEDIDO (cabecera)
        const pedido = await pedido_model_1.default.create({
            idpersona: cliente.id,
            idmetodopago: metodoPago.id,
            fechaoperacion: new Date(),
            totalimporte: Number(total) || 0,
            idestado: estados_constans_1.PedidoEstado.EN_ESPERA
        }, { transaction });
        // 2) DETALLES DE PEDIDO + DESCUENTO DE STOCK (ATÓMICO Y CONCURRENTE)
        const pedidoDetalles = [];
        for (const p of productos) {
            const { loteTalla, cantidad, precio, subtotal } = p;
            if (!(loteTalla === null || loteTalla === void 0 ? void 0 : loteTalla.id) || cantidad == null || precio == null) {
                throw new Error('Cada producto debe incluir loteTalla.id, cantidad y precio');
            }
            const cantidadNum = Number(cantidad);
            const precioNum = Number(precio);
            const subtotalNum = subtotal != null ? Number(subtotal) : cantidadNum * precioNum;
            // 🔐 Descontar stock atómicamente
            const [results, metadata] = await connection_db_2.default.query(`
            UPDATE lote_talla
            SET stock = stock - :cantidad
            WHERE id = :id AND stock >= :cantidad
            `, {
                replacements: { id: loteTalla.id, cantidad: cantidadNum },
                transaction
            });
            // Validar que se haya actualizado (stock suficiente)
            if (((_b = metadata.rowCount) !== null && _b !== void 0 ? _b : metadata.affectedRows) === 0) {
                throw new Error(`Stock insuficiente para LoteTalla ${loteTalla.id}`);
            }
            // Crear detalle de pedido
            const det = await pedido_detalle_model_1.default.create({
                idpedido: pedido.id,
                idlote_talla: loteTalla.id,
                cantidad: cantidadNum,
                precio: precioNum,
                subtotal: subtotalNum
            }, { transaction });
            pedidoDetalles.push(det);
            // Registrar movimiento de salida
            await movimiento_lote_model_1.default.create({
                idlote_talla: loteTalla.id,
                tipomovimiento: estados_constans_1.TipoMovimientoLote.SALIDA,
                cantidad: cantidadNum,
                fechamovimiento: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
                idestado: estados_constans_1.EstadoGeneral.REGISTRADO
            }, { transaction });
        }
        // 3) CREAR VENTA
        const nuevaVenta = await venta_model_1.default.create({
            fechaventa: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
            idusuario: idusuario || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id),
            idpedido: pedido.id,
            idestado: estados_constans_1.VentaEstado.REGISTRADO
        }, { transaction });
        // 4) CREAR DETALLES DE VENTA
        const detallesVentaCreados = [];
        for (const det of pedidoDetalles) {
            const dv = await detalle_venta_model_1.default.create({
                idpedidodetalle: det.id,
                idventa: nuevaVenta.id,
                precio_venta_real: Number(det.precio),
                subtotal_real: Number(det.subtotal),
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            }, { transaction });
            detallesVentaCreados.push(dv);
        }
        // 5) DETERMINAR COMPROBANTE
        const persona = await persona_model_1.default.findByPk(cliente.id, { transaction });
        const idTipoComprobante = ((persona === null || persona === void 0 ? void 0 : persona.idtipopersona) === 2) ? 2 : 1; // 2=Factura, 1=Boleta
        const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idTipoComprobante, { transaction });
        if (!tipoComprobante)
            throw new Error('Tipo de comprobante no encontrado');
        const totalNum = Number(total) || 0;
        const igv = 0;
        const comprobante = await comprobante_model_1.default.create({
            idventa: nuevaVenta.id,
            igv,
            descuento: 0,
            total: totalNum,
            idtipocomprobante: tipoComprobante.id,
            numserie: await generarNumeroSerieUnico(tipoComprobante.id, transaction),
            idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
        }, { transaction });
        // 6) ACTUALIZAR ESTADOS
        await pedido.update({ idestado: estados_constans_1.PedidoEstado.PAGADO }, { transaction });
        // ✅ CONFIRMAR TRANSACCIÓN
        await transaction.commit();
        // 7) RECUPERAR DATOS ENRIQUECIDOS (fuera de la tx)
        const ventaCompleta = await venta_model_1.default.findByPk(nuevaVenta.id, {
            include: [
                { model: usuario_model_1.default, as: 'Usuario' },
                {
                    model: pedido_model_1.default, as: 'Pedido',
                    include: [
                        { model: persona_model_1.default, as: 'Persona' },
                        { model: metodo_pago_model_1.default, as: 'MetodoPago' }
                    ]
                }
            ]
        });
        const comprobanteCompleto = await comprobante_model_1.default.findByPk(comprobante.id, {
            include: [
                { model: tipo_comprobante_model_1.default, as: 'TipoComprobante' },
                { model: venta_model_1.default, as: 'Venta' }
            ]
        });
        const detallesVentaCompletos = await detalle_venta_model_1.default.findAll({
            where: { idventa: nuevaVenta.id },
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    include: [
                        {
                            model: lote_talla_model_1.default,
                            as: 'LoteTalla',
                            include: [
                                {
                                    model: lote_model_1.default,
                                    as: 'Lote',
                                    include: [{ model: producto_model_1.default, as: 'Producto' }]
                                },
                                { model: talla_model_1.default, as: 'Talla' }
                            ]
                        }
                    ]
                }
            ]
        });
        // 8) GENERAR PDF Y ENVIAR POR WHATSAPP
        const telefonoRaw = (_g = (_d = cliente === null || cliente === void 0 ? void 0 : cliente.telefono) !== null && _d !== void 0 ? _d : (_f = (_e = ventaCompleta === null || ventaCompleta === void 0 ? void 0 : ventaCompleta.Pedido) === null || _e === void 0 ? void 0 : _e.Persona) === null || _f === void 0 ? void 0 : _f.telefono) !== null && _g !== void 0 ? _g : '';
        const telefono = String(telefonoRaw).replace(/\D/g, ''); // solo dígitos
        const phoneRegex = /^\d{9,15}$/;
        if (telefono && phoneRegex.test(telefono)) {
            try {
                const nombreArchivo = await (0, wsp_controller_1.generarPDFComprobante)(comprobanteCompleto, ventaCompleta, ventaCompleta === null || ventaCompleta === void 0 ? void 0 : ventaCompleta.Pedido, detallesVentaCompletos);
                await (0, wsp_controller_1.enviarArchivoWSP)(telefono, nombreArchivo, `📄 ${((_h = comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.TipoComprobante) === null || _h === void 0 ? void 0 : _h.nombre) || 'Comprobante'} ${comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.numserie}`);
                // Usar la función del servidor para enviar el comprobante
                //  await enviarComprobante(comprobanteCompleto?.id);
                // const resultadoEnvio = await server.sendComprobanteWhatsApp(
                //   telefono,
                //   comprobanteCompleto,
                //   ventaCompleta,
                //   ventaCompleta?.Pedido,
                //   detallesVentaCompletos
                // );
                // if (!resultadoEnvio.success) {
                //   throw new Error(resultadoEnvio.error || 'Error desconocido al enviar WhatsApp');
                // }
                res.status(201).json({
                    msg: 'Venta, detalles y comprobante creados y enviados exitosamente por WhatsApp',
                    data: {
                        pedido,
                        venta: ventaCompleta,
                        comprobante: comprobanteCompleto,
                        detallesVenta: detallesVentaCompletos
                    }
                });
                return;
            }
            catch (err) {
                console.error('Error al generar/enviar comprobante por WhatsApp:', err);
                // seguimos igual, no rompemos la venta
            }
        }
        // RESPUESTA FINAL
        res.status(201).json({
            msg: `Venta, detalles y comprobante creados exitosamente${telefono ? ' (intento de envío por WhatsApp)' : ''}`,
            data: {
                pedido,
                venta: ventaCompleta,
                comprobante: comprobanteCompleto,
                detallesVenta: detallesVentaCompletos
            }
        });
    }
    catch (error) {
        await transaction.rollback();
        console.error('Error en crearVentaCompletaConComprobante:', error);
        res.status(500).json({
            msg: 'Ocurrió un error al crear la venta completa',
            error: error.message
        });
    }
};
exports.crearVentaCompletaConComprobanteAdministracion = crearVentaCompletaConComprobanteAdministracion;
const crearVentaCompletaConComprobante = async (req, res) => {
    var _a, _b, _c;
    const { fechaventa, idusuario, idpedido, detallesVenta } = req.body;
    try {
        // Validaciones básicas
        if (!idusuario || !idpedido || !detallesVenta || !Array.isArray(detallesVenta) || detallesVenta.length === 0) {
            res.status(400).json({
                msg: 'Los campos idusuario, idpedido y detallesVenta (array) son obligatorios'
            });
            return;
        }
        // Verificar si existe el usuario
        const usuario = await usuario_model_1.default.findByPk(idusuario);
        if (!usuario) {
            res.status(400).json({ msg: 'El usuario no existe' });
            return;
        }
        // Verificar si existe el pedido con la persona
        const pedido = await pedido_model_1.default.findByPk(idpedido, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona'
                }
            ]
        });
        if (!pedido) {
            res.status(400).json({ msg: 'El pedido no existe' });
            return;
        }
        // Verificar si el pedido ya tiene una venta asociada
        const ventaExistente = await venta_model_1.default.findOne({ where: { idpedido } });
        if (ventaExistente) {
            res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
            return;
        }
        // Iniciar transacción
        const transaction = await connection_db_1.default.transaction();
        try {
            // 1. CREAR LA VENTA
            const nuevaVenta = await venta_model_1.default.create({
                fechaventa: (0, moment_timezone_1.default)().tz("America/Lima").toDate(),
                idusuario,
                idpedido,
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            }, { transaction });
            // 2. CREAR DETALLES DE VENTA
            const detallesVentaCreados = [];
            for (const detalle of detallesVenta) {
                // Validar detalle de pedido
                const pedidoDetalle = await pedido_detalle_model_1.default.findByPk(detalle.idpedidodetalle, { transaction });
                if (!pedidoDetalle) {
                    throw new Error(`Detalle de pedido con ID ${detalle.idpedidodetalle} no existe`);
                }
                // Calcular subtotal si no se proporciona
                const subtotal = detalle.subtotal_real !== undefined
                    ? detalle.subtotal_real
                    : Number(pedidoDetalle.cantidad) * Number(detalle.precio_venta_real);
                // Crear detalle de venta
                const nuevoDetalleVenta = await detalle_venta_model_1.default.create({
                    idpedidodetalle: detalle.idpedidodetalle,
                    idventa: nuevaVenta.id,
                    precio_venta_real: detalle.precio_venta_real,
                    subtotal_real: subtotal,
                    idestado: estados_constans_1.VentaEstado.REGISTRADO
                }, { transaction });
                detallesVentaCreados.push(nuevoDetalleVenta);
                // Actualizar stock si corresponde
                if (pedidoDetalle.idlote_talla && pedidoDetalle.cantidad) {
                    const loteTalla = await lote_talla_model_1.default.findByPk(pedidoDetalle.idlote_talla, { transaction });
                    if (loteTalla && loteTalla.stock !== null) {
                        const nuevoStock = Number(loteTalla.stock) - Number(pedidoDetalle.cantidad);
                        await loteTalla.update({ stock: nuevoStock }, { transaction });
                    }
                }
            }
            // 3. DETERMINAR TIPO DE COMPROBANTE
            let idTipoComprobante;
            if (pedido.Persona && pedido.Persona.idtipopersona === 2) {
                idTipoComprobante = 2; // FACTURA
            }
            else {
                idTipoComprobante = 1; // BOLETA
            }
            // 4. CREAR COMPROBANTE
            const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idTipoComprobante, { transaction });
            if (!tipoComprobante) {
                throw new Error('Tipo de comprobante no encontrado');
            }
            const total = Number(pedido.totalimporte) || 0;
            const igv = total * 0.18;
            const nuevoComprobante = await comprobante_model_1.default.create({
                idventa: nuevaVenta.id,
                igv: igv,
                descuento: 0,
                total: total,
                idtipocomprobante: tipoComprobante.id,
                numserie: await generarNumeroSerieUnico(tipoComprobante.id, transaction),
                idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
            }, { transaction });
            // CONFIRMAR TRANSACCIÓN
            await transaction.commit();
            // OBTENER DATOS COMPLETOS
            const ventaCompleta = await venta_model_1.default.findByPk(nuevaVenta.id, {
                include: [
                    { model: usuario_model_1.default, as: 'Usuario' },
                    {
                        model: pedido_model_1.default,
                        as: 'Pedido',
                        include: [{ model: persona_model_1.default, as: 'Persona' }]
                    }
                ]
            });
            const comprobanteCompleto = await comprobante_model_1.default.findByPk(nuevoComprobante.id, {
                include: [
                    { model: tipo_comprobante_model_1.default, as: 'TipoComprobante' },
                    { model: venta_model_1.default, as: 'Venta' }
                ]
            });
            const detallesVentaCompletos = await detalle_venta_model_1.default.findAll({
                where: { idventa: nuevaVenta.id },
                include: [
                    {
                        model: pedido_detalle_model_1.default,
                        as: 'PedidoDetalle',
                        include: [
                            {
                                model: lote_talla_model_1.default,
                                as: 'LoteTalla',
                                include: [
                                    {
                                        model: lote_model_1.default,
                                        as: 'Lote',
                                        include: [{ model: producto_model_1.default, as: 'Producto' }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            // 5. GENERAR Y ENVIAR COMPROBANTE POR WHATSAPP
            const telefono = (_b = (_a = pedido === null || pedido === void 0 ? void 0 : pedido.Persona) === null || _a === void 0 ? void 0 : _a.telefono) !== null && _b !== void 0 ? _b : '';
            const phoneRegex = /^\d{9,15}$/;
            if (telefono && phoneRegex.test(telefono)) {
                try {
                    const nombreArchivo = await (0, wsp_controller_1.generarPDFComprobante)(comprobanteCompleto, ventaCompleta, pedido, detallesVentaCompletos);
                    await (0, wsp_controller_1.enviarArchivoWSP)(telefono, nombreArchivo, `📄 ${((_c = comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.TipoComprobante) === null || _c === void 0 ? void 0 : _c.nombre) || 'Comprobante'} ${comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.numserie}`);
                    res.status(201).json({
                        msg: 'Venta, detalles, comprobante creados y enviados exitosamente',
                        data: {
                            venta: ventaCompleta,
                            comprobante: comprobanteCompleto,
                            detallesVenta: detallesVentaCompletos
                        }
                    });
                    return;
                }
                catch (error) {
                    console.error('Error al enviar comprobante:', error);
                    // Continuar aunque falle el envío
                }
            }
            res.status(201).json({
                msg: 'Venta, detalles y comprobante creados exitosamente (sin envío por WhatsApp)',
                data: {
                    venta: ventaCompleta,
                    comprobante: comprobanteCompleto,
                    detallesVenta: detallesVentaCompletos
                }
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        console.error('Error en crearVentaCompletaConComprobante:', error);
        res.status(500).json({
            msg: 'Ocurrió un error al crear la venta completa',
            error: error.message
        });
    }
};
exports.crearVentaCompletaConComprobante = crearVentaCompletaConComprobante;
// Función para generar número de serie único
const generarNumeroSerieUnico = async (idTipoComprobante, transaction) => {
    const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idTipoComprobante, {
        include: [{ model: connection_db_1.default.models.TipoSerie, as: 'TipoSerie' }],
        transaction
    });
    if (!tipoComprobante || !tipoComprobante.TipoSerie) {
        throw new Error('Tipo de comprobante o serie no encontrado');
    }
    // Obtener el último comprobante de este tipo
    const ultimoComprobante = await comprobante_model_1.default.findOne({
        where: { idtipocomprobante: idTipoComprobante },
        order: [['id', 'DESC']],
        transaction
    });
    let siguienteNumero = 1;
    if (ultimoComprobante && ultimoComprobante.numserie) {
        // Extraer el número del último comprobante e incrementarlo
        const partes = ultimoComprobante.numserie.split('-');
        if (partes.length > 1) {
            const ultimoNumero = parseInt(partes[1]) || 0;
            siguienteNumero = ultimoNumero + 1;
        }
    }
    // Formato: [SERIE]-[NÚMERO]
    return `${tipoComprobante.TipoSerie.nombre}-${siguienteNumero.toString().padStart(8, '0')}`;
};
// DOWNLOAD - Descargar comprobante en PDF
const descargarComprobante = async (req, res) => {
    var _a, _b;
    const { id } = req.params;
    try {
        // Buscar comprobante con sus relaciones necesarias
        const comprobante = await comprobante_model_1.default.findByPk(id, {
            include: [
                { model: tipo_comprobante_model_1.default, as: 'TipoComprobante' },
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        { model: usuario_model_1.default, as: 'Usuario' },
                        {
                            model: pedido_model_1.default,
                            as: 'Pedido',
                            include: [
                                { model: persona_model_1.default, as: 'Persona' },
                                { model: metodo_pago_model_1.default, as: 'MetodoPago' }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!comprobante) {
            res.status(404).json({ msg: 'Comprobante no encontrado' });
            return;
        }
        // Detalles de venta para el comprobante
        const detallesVenta = await detalle_venta_model_1.default.findAll({
            where: { idventa: comprobante.idventa },
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    include: [
                        {
                            model: lote_talla_model_1.default,
                            as: 'LoteTalla',
                            include: [
                                {
                                    model: lote_model_1.default,
                                    as: 'Lote',
                                    include: [{ model: producto_model_1.default, as: 'Producto' }]
                                },
                                { model: talla_model_1.default, as: 'Talla' }
                            ]
                        }
                    ]
                }
            ]
        });
        // Generar el PDF temporal
        const nombreArchivo = await (0, generarPdf_helper_1.generarPDFComprobanteModelo)(comprobante, comprobante.Venta, (_a = comprobante.Venta) === null || _a === void 0 ? void 0 : _a.Pedido, detallesVenta);
        // Enviar PDF como descarga
        res.download(nombreArchivo, `${(_b = comprobante.TipoComprobante) === null || _b === void 0 ? void 0 : _b.nombre}-${comprobante.numserie}.pdf`, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
                res.status(500).json({ msg: 'Error al descargar el comprobante' });
            }
            // ✅ Eliminar archivo temporal después de enviarlo
            fs_1.default.unlink(nombreArchivo, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error al eliminar archivo temporal:', unlinkErr);
                }
            });
        });
    }
    catch (error) {
        console.error('Error en descargarComprobante:', error);
        res.status(500).json({ msg: 'Error al descargar el comprobante' });
    }
};
exports.descargarComprobante = descargarComprobante;

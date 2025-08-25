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
exports.restaurarVenta = exports.anularVenta = exports.getVentasAnuladas = exports.getVentasByPedido = exports.getVentasByUsuario = exports.getVentaById = exports.getVentasRegistradas = exports.getVentas = exports.updateVenta = exports.createVenta = void 0;
const venta_model_1 = __importDefault(require("../models/venta.model"));
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nueva venta
const createVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fechaventa, idusuario, idpedido } = req.body;
    try {
        // Validaciones
        if (!idusuario || !idpedido) {
            res.status(400).json({
                msg: 'Los campos idusuario e idpedido son obligatorios'
            });
            return;
        }
        // Verificar si existe el usuario
        const usuario = yield usuario_model_1.default.findByPk(idusuario);
        if (!usuario) {
            res.status(400).json({ msg: 'El usuario no existe' });
            return;
        }
        // Verificar si existe el pedido
        const pedido = yield pedido_model_1.default.findByPk(idpedido);
        if (!pedido) {
            res.status(400).json({ msg: 'El pedido no existe' });
            return;
        }
        // Verificar si el pedido ya tiene una venta asociada
        const ventaExistente = yield venta_model_1.default.findOne({
            where: { idpedido }
        });
        if (ventaExistente) {
            res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
            return;
        }
        // Crear nueva venta
        const nuevaVenta = yield venta_model_1.default.create({
            fechaventa: fechaventa || new Date(),
            idusuario,
            idpedido,
            idestado: estados_constans_1.VentaEstado.REGISTRADO
        });
        // Obtener la venta creada con sus relaciones
        const ventaCreada = yield venta_model_1.default.findByPk(nuevaVenta.id, {
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            msg: 'Venta creada exitosamente',
            data: ventaCreada
        });
    }
    catch (error) {
        console.error('Error en createVenta:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createVenta = createVenta;
// UPDATE - Actualizar venta
const updateVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { fechaventa, idusuario, idpedido } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la venta es obligatorio" });
            return;
        }
        const venta = yield venta_model_1.default.findByPk(id);
        if (!venta) {
            res.status(404).json({ msg: `No existe una venta con el id ${id}` });
            return;
        }
        // Verificar si existe el usuario (si se está actualizando)
        if (idusuario) {
            const usuario = yield usuario_model_1.default.findByPk(idusuario);
            if (!usuario) {
                res.status(400).json({ msg: 'El usuario no existe' });
                return;
            }
        }
        // Verificar si existe el pedido (si se está actualizando)
        if (idpedido && idpedido !== venta.idpedido) {
            const pedido = yield pedido_model_1.default.findByPk(idpedido);
            if (!pedido) {
                res.status(400).json({ msg: 'El pedido no existe' });
                return;
            }
            // Verificar si el nuevo pedido ya tiene una venta asociada
            const ventaExistente = yield venta_model_1.default.findOne({
                where: { idpedido }
            });
            if (ventaExistente) {
                res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
                return;
            }
        }
        // Actualizar campos
        if (fechaventa)
            venta.fechaventa = fechaventa;
        if (idusuario)
            venta.idusuario = idusuario;
        if (idpedido)
            venta.idpedido = idpedido;
        yield venta.save();
        // Obtener la venta actualizada con relaciones
        const ventaActualizada = yield venta_model_1.default.findByPk(id, {
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            msg: "Venta actualizada con éxito",
            data: ventaActualizada
        });
    }
    catch (error) {
        console.error("Error en updateVenta:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateVenta = updateVenta;
// READ - Listar todas las ventas
const getVentas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.default.findAll({
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            order: [['fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Lista de ventas obtenida exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en getVentas:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de ventas' });
    }
});
exports.getVentas = getVentas;
// READ - Listar ventas registradas (no anuladas)
const getVentasRegistradas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: {
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            order: [['fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Ventas registradas obtenidas exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en getVentasRegistradas:', error);
        res.status(500).json({ msg: 'Error al obtener ventas registradas' });
    }
});
exports.getVentasRegistradas = getVentasRegistradas;
// READ - Obtener venta por ID
const getVentaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const venta = yield venta_model_1.default.findByPk(id, {
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
        if (!venta) {
            res.status(404).json({ msg: 'Venta no encontrada' });
            return;
        }
        res.json({
            msg: 'Venta obtenida exitosamente',
            data: venta
        });
    }
    catch (error) {
        console.error('Error en getVentaById:', error);
        res.status(500).json({ msg: 'Error al obtener la venta' });
    }
});
exports.getVentaById = getVentaById;
// READ - Obtener ventas por usuario
const getVentasByUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idusuario } = req.params;
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: { idusuario },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            order: [['fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Ventas del usuario obtenidas exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en getVentasByUsuario:', error);
        res.status(500).json({ msg: 'Error al obtener ventas del usuario' });
    }
});
exports.getVentasByUsuario = getVentasByUsuario;
// READ - Obtener ventas por pedido
const getVentasByPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpedido } = req.params;
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: { idpedido },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
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
            order: [['fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Ventas del pedido obtenidas exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en getVentasByPedido:', error);
        res.status(500).json({ msg: 'Error al obtener ventas del pedido' });
    }
});
exports.getVentasByPedido = getVentasByPedido;
// READ - Listar ventas anuladas
const getVentasAnuladas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: { idestado: estados_constans_1.VentaEstado.ANULADO },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte'],
                    include: [
                        {
                            model: pedido_model_1.default.associations.Persona.target,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'dni']
                        },
                        {
                            model: pedido_model_1.default.associations.MetodoPago.target,
                            as: 'MetodoPago',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['fechaventa', 'DESC']]
        });
        res.json({
            msg: 'Ventas anuladas obtenidas exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en getVentasAnuladas:', error);
        res.status(500).json({ msg: 'Error al obtener ventas anuladas' });
    }
});
exports.getVentasAnuladas = getVentasAnuladas;
// UPDATE - Cambiar estado de la venta (anular)
const anularVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const venta = yield venta_model_1.default.findByPk(id);
        if (!venta) {
            res.status(404).json({ msg: 'Venta no encontrada' });
            return;
        }
        venta.idestado = estados_constans_1.VentaEstado.ANULADO;
        yield venta.save();
        res.json({
            msg: 'Venta anulada con éxito',
            data: { id: venta.id, estado: estados_constans_1.VentaEstado.ANULADO }
        });
    }
    catch (error) {
        console.error('Error en anularVenta:', error);
        res.status(500).json({ msg: 'Error al anular la venta' });
    }
});
exports.anularVenta = anularVenta;
// UPDATE - Restaurar venta anulada
const restaurarVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const venta = yield venta_model_1.default.findByPk(id);
        if (!venta) {
            res.status(404).json({ msg: 'Venta no encontrada' });
            return;
        }
        // Cambiar estado a REGISTRADO
        venta.idestado = estados_constans_1.VentaEstado.REGISTRADO;
        yield venta.save();
        res.json({
            msg: 'Venta restaurada con éxito',
            data: { id: venta.id, estado: estados_constans_1.VentaEstado.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarVenta:', error);
        res.status(500).json({ msg: 'Error al restaurar la venta' });
    }
});
exports.restaurarVenta = restaurarVenta;

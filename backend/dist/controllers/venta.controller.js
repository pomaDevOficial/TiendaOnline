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
exports.obtenerVentasEliminadas = exports.obtenerVentasPorUsuario = exports.eliminarVenta = exports.cambiarEstadoVenta = exports.actualizarVenta = exports.obtenerVentaPorId = exports.obtenerVentasPorEstado = exports.obtenerVentas = exports.crearVenta = void 0;
const venta_model_1 = __importDefault(require("../models/venta.model"));
const usuario_model_1 = __importDefault(require("../models/usuario.model"));
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Crear nueva venta
const crearVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idusuario, idpedido, fechaventa, idestado } = req.body;
    try {
        // Validaciones
        if (!idusuario || !idpedido || !fechaventa) {
            res.status(400).json({
                msg: 'Los campos idusuario, idpedido y fechaventa son obligatorios'
            });
            return;
        }
        // Verificar si el pedido ya tiene una venta asociada (excluyendo eliminados)
        const ventaExistente = yield venta_model_1.default.findOne({
            where: {
                idpedido,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (ventaExistente) {
            res.status(400).json({ msg: 'Este pedido ya tiene una venta registrada' });
            return;
        }
        // Verificar si el usuario existe y no está eliminado
        const usuarioExistente = yield usuario_model_1.default.findOne({
            where: {
                id: idusuario,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (!usuarioExistente) {
            res.status(404).json({ msg: 'El usuario no existe o ha sido eliminado' });
            return;
        }
        // Verificar si el pedido existe y no está eliminado
        const pedidoExistente = yield pedido_model_1.default.findOne({
            where: {
                id: idpedido,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (!pedidoExistente) {
            res.status(404).json({ msg: 'El pedido no existe o ha sido eliminado' });
            return;
        }
        const nuevaVenta = yield venta_model_1.default.create({
            idusuario,
            idpedido,
            fechaventa,
            idestado: idestado || estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener la venta creada con sus relaciones
        const ventaCreada = yield venta_model_1.default.findByPk(nuevaVenta.id, {
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
        console.error('Error en crearVenta:', error);
        res.status(500).json({ msg: 'Ocurrió un error al crear la venta' });
    }
});
exports.crearVenta = crearVenta;
// READ - Listar todas las ventas (excluyendo eliminados)
const obtenerVentas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: {
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
        console.error('Error en obtenerVentas:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de ventas' });
    }
});
exports.obtenerVentas = obtenerVentas;
// READ - Listar ventas por estado (excluyendo eliminados)
const obtenerVentasPorEstado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idestado } = req.params;
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { idestado: parseInt(idestado) },
                    { idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } }
                ]
            },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
            msg: `Ventas con estado ${idestado} obtenidas exitosamente`,
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en obtenerVentasPorEstado:', error);
        res.status(500).json({ msg: 'Error al obtener las ventas por estado' });
    }
});
exports.obtenerVentasPorEstado = obtenerVentasPorEstado;
// READ - Obtener venta por ID (incluye eliminados si se solicita específicamente)
const obtenerVentaPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { incluirEliminados } = req.query; // Opcional: ?incluirEliminados=true
    try {
        const whereCondition = { id };
        if (incluirEliminados !== 'true') {
            whereCondition.idestado = { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO };
        }
        const venta = yield venta_model_1.default.findOne({
            where: whereCondition,
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos', 'correo', 'telefono']
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
        console.error('Error en obtenerVentaPorId:', error);
        res.status(500).json({ msg: 'Error al obtener la venta' });
    }
});
exports.obtenerVentaPorId = obtenerVentaPorId;
// UPDATE - Actualizar venta
const actualizarVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idusuario, idpedido, fechaventa, idestado } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la venta es obligatorio" });
            return;
        }
        // Buscar venta excluyendo eliminados
        const venta = yield venta_model_1.default.findOne({
            where: {
                id,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (!venta) {
            res.status(404).json({ msg: `No existe una venta activa con el id ${id}` });
            return;
        }
        // Validar si el nuevo pedido ya tiene venta asociada (excluyendo eliminados)
        if (idpedido && idpedido !== venta.idpedido) {
            const ventaExistente = yield venta_model_1.default.findOne({
                where: {
                    idpedido,
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
                }
            });
            if (ventaExistente && ventaExistente.id !== parseInt(id)) {
                res.status(400).json({ msg: 'Este pedido ya tiene una venta registrada' });
                return;
            }
        }
        // Validar si el usuario existe y no está eliminado
        if (idusuario && idusuario !== venta.idusuario) {
            const usuarioExistente = yield usuario_model_1.default.findOne({
                where: {
                    id: idusuario,
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
                }
            });
            if (!usuarioExistente) {
                res.status(404).json({ msg: 'El usuario no existe o ha sido eliminado' });
                return;
            }
        }
        // Validar si el pedido existe y no está eliminado
        if (idpedido && idpedido !== venta.idpedido) {
            const pedidoExistente = yield pedido_model_1.default.findOne({
                where: {
                    id: idpedido,
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
                }
            });
            if (!pedidoExistente) {
                res.status(404).json({ msg: 'El pedido no existe o ha sido eliminado' });
                return;
            }
        }
        // Preparar datos para actualizar
        const updateData = {};
        if (idusuario !== undefined)
            updateData.idusuario = idusuario;
        if (idpedido !== undefined)
            updateData.idpedido = idpedido;
        if (fechaventa !== undefined)
            updateData.fechaventa = fechaventa;
        if (idestado !== undefined)
            updateData.idestado = idestado;
        // Actualizar
        yield venta_model_1.default.update(updateData, { where: { id } });
        // Obtener la venta actualizada con relaciones
        const ventaActualizada = yield venta_model_1.default.findByPk(id, {
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
        console.error("Error en actualizarVenta:", error);
        res.status(500).json({ msg: "Ocurrió un error al actualizar la venta" });
    }
});
exports.actualizarVenta = actualizarVenta;
// UPDATE - Cambiar estado de venta
const cambiarEstadoVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idestado } = req.body;
    try {
        if (!idestado) {
            res.status(400).json({ msg: "El nuevo estado es obligatorio" });
            return;
        }
        // Buscar venta excluyendo eliminados
        const venta = yield venta_model_1.default.findOne({
            where: {
                id,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (!venta) {
            res.status(404).json({ msg: 'Venta no encontrada' });
            return;
        }
        yield venta_model_1.default.update({ idestado }, { where: { id } });
        res.json({
            msg: 'Estado de venta actualizado con éxito',
            data: { id: parseInt(id), idestado }
        });
    }
    catch (error) {
        console.error('Error en cambiarEstadoVenta:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado de la venta' });
    }
});
exports.cambiarEstadoVenta = cambiarEstadoVenta;
// DELETE - Eliminar venta (marcar como eliminado)
const eliminarVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Buscar venta excluyendo eliminados
        const venta = yield venta_model_1.default.findOne({
            where: {
                id,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            }
        });
        if (!venta) {
            res.status(404).json({ msg: 'Venta no encontrada o ya está eliminada' });
            return;
        }
        yield venta_model_1.default.update({ idestado: estados_constans_1.EstadoGeneral.ELIMINADO }, { where: { id } });
        res.json({
            msg: 'Venta marcada como eliminada',
            data: { id: parseInt(id), estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en eliminarVenta:', error);
        res.status(500).json({ msg: 'Error al eliminar la venta' });
    }
});
exports.eliminarVenta = eliminarVenta;
// READ - Obtener ventas por usuario (excluyendo eliminados)
const obtenerVentasPorUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idusuario } = req.params;
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: {
                idusuario: parseInt(idusuario),
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO } // Excluir eliminados
            },
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
            msg: `Ventas del usuario ${idusuario} obtenidas exitosamente`,
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en obtenerVentasPorUsuario:', error);
        res.status(500).json({ msg: 'Error al obtener las ventas del usuario' });
    }
});
exports.obtenerVentasPorUsuario = obtenerVentasPorUsuario;
// READ - Obtener ventas eliminadas (solo para administradores)
const obtenerVentasEliminadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield venta_model_1.default.findAll({
            where: {
                idestado: estados_constans_1.EstadoGeneral.ELIMINADO // Solo eliminados
            },
            include: [
                {
                    model: usuario_model_1.default,
                    as: 'Usuario',
                    include: [
                        {
                            model: persona_model_1.default,
                            as: 'Persona',
                            attributes: ['id', 'nombres', 'apellidos']
                        }
                    ],
                    attributes: ['id', 'usuario']
                },
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'totalimporte', 'fechaoperacion']
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
            msg: 'Ventas eliminadas obtenidas exitosamente',
            data: ventas
        });
    }
    catch (error) {
        console.error('Error en obtenerVentasEliminadas:', error);
        res.status(500).json({ msg: 'Error al obtener las ventas eliminadas' });
    }
});
exports.obtenerVentasEliminadas = obtenerVentasEliminadas;

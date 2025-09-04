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
exports.getProductosMasVendidos = exports.deleteDetalleVenta = exports.restaurarDetalleVenta = exports.anularDetalleVenta = exports.getDetallesVentaAnulados = exports.getDetallesVentaByVenta = exports.getDetalleVentaById = exports.getDetallesVentaRegistrados = exports.getDetallesVenta = exports.updateDetalleVenta = exports.createMultipleDetalleVenta = exports.createDetalleVenta = void 0;
const detalle_venta_model_1 = __importDefault(require("../models/detalle_venta.model"));
const pedido_detalle_model_1 = __importDefault(require("../models/pedido_detalle.model"));
const venta_model_1 = __importDefault(require("../models/venta.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Insertar nuevo detalle de venta
const createDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = req.body;
    try {
        // Validaciones
        if (!idpedidodetalle || !idventa || precio_venta_real === undefined) {
            res.status(400).json({
                msg: 'Los campos idpedidodetalle, idventa y precio_venta_real son obligatorios'
            });
            return;
        }
        // Verificar si existe el detalle de pedido
        const pedidoDetalle = yield pedido_detalle_model_1.default.findByPk(idpedidodetalle);
        if (!pedidoDetalle) {
            res.status(400).json({ msg: 'El detalle de pedido no existe' });
            return;
        }
        // Verificar si existe la venta
        const venta = yield venta_model_1.default.findByPk(idventa);
        if (!venta) {
            res.status(400).json({ msg: 'La venta no existe' });
            return;
        }
        // Calcular subtotal_real si no se proporciona
        let calculatedSubtotal = subtotal_real;
        if (subtotal_real === undefined && pedidoDetalle.cantidad !== null) {
            calculatedSubtotal = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
        }
        else if (subtotal_real === undefined) {
            res.status(400).json({
                msg: 'El campo subtotal_real es obligatorio cuando cantidad es null'
            });
            return;
        }
        // Crear nuevo detalle de venta
        const nuevoDetalleVenta = yield detalle_venta_model_1.default.create({
            idpedidodetalle,
            idventa,
            precio_venta_real,
            subtotal_real: calculatedSubtotal,
            idestado: estados_constans_1.VentaEstado.REGISTRADO
        });
        // Obtener el detalle de venta creado con sus relaciones
        const detalleVentaCreado = yield detalle_venta_model_1.default.findByPk(nuevoDetalleVenta.id, {
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre', 'imagen']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
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
            msg: 'Detalle de venta creado exitosamente',
            data: detalleVentaCreado
        });
    }
    catch (error) {
        console.error('Error en createDetalleVenta:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createDetalleVenta = createDetalleVenta;
// CREATE - Insertar múltiples detalles de venta
const createMultipleDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { detalles } = req.body;
    try {
        // Validaciones
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            res.status(400).json({
                msg: 'El campo detalles es obligatorio y debe ser un array no vacío'
            });
            return;
        }
        const detallesCreados = [];
        for (const detalle of detalles) {
            const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = detalle;
            // Validaciones para cada detalle
            if (!idpedidodetalle || !idventa || precio_venta_real === undefined) {
                res.status(400).json({
                    msg: 'Cada detalle debe tener idpedidodetalle, idventa y precio_venta_real'
                });
                return;
            }
            // Verificar si existe el detalle de pedido
            const pedidoDetalle = yield pedido_detalle_model_1.default.findByPk(idpedidodetalle);
            if (!pedidoDetalle) {
                res.status(400).json({ msg: `El detalle de pedido con id ${idpedidodetalle} no existe` });
                return;
            }
            // Verificar si existe la venta
            const venta = yield venta_model_1.default.findByPk(idventa);
            if (!venta) {
                res.status(400).json({ msg: `La venta con id ${idventa} no existe` });
                return;
            }
            // Calcular subtotal_real si no se proporciona
            let calculatedSubtotal = subtotal_real;
            if (subtotal_real === undefined && pedidoDetalle.cantidad !== null) {
                calculatedSubtotal = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
            }
            else if (subtotal_real === undefined) {
                res.status(400).json({
                    msg: 'El campo subtotal_real es obligatorio cuando cantidad es null'
                });
                return;
            }
            // Crear nuevo detalle de venta
            const nuevoDetalleVenta = yield detalle_venta_model_1.default.create({
                idpedidodetalle,
                idventa,
                precio_venta_real,
                subtotal_real: calculatedSubtotal,
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            });
            // Obtener el detalle de venta creado con sus relaciones
            const detalleVentaCreado = yield detalle_venta_model_1.default.findByPk(nuevoDetalleVenta.id, {
                include: [
                    {
                        model: pedido_detalle_model_1.default,
                        as: 'PedidoDetalle',
                        attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                        include: [
                            {
                                model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                                as: 'LoteTalla',
                                attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                                include: [
                                    {
                                        model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                        as: 'Lote',
                                        attributes: ['id', 'proveedor', 'fechaingreso'],
                                        include: [
                                            {
                                                model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                                as: 'Producto',
                                                attributes: ['id', 'nombre']
                                            }
                                        ]
                                    },
                                    {
                                        model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                        as: 'Talla',
                                        attributes: ['id', 'nombre']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: venta_model_1.default,
                        as: 'Venta',
                        attributes: ['id', 'fechaventa']
                    },
                    {
                        model: estado_model_1.default,
                        as: 'Estado',
                        attributes: ['id', 'nombre']
                    }
                ]
            });
            detallesCreados.push(detalleVentaCreado);
        }
        res.status(201).json({
            msg: 'Detalles de venta creados exitosamente',
            data: detallesCreados
        });
    }
    catch (error) {
        console.error('Error en createMultipleDetalleVenta:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createMultipleDetalleVenta = createMultipleDetalleVenta;
// UPDATE - Actualizar detalle de venta
const updateDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idpedidodetalle, idventa, precio_venta_real, subtotal_real } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del detalle de venta es obligatorio" });
            return;
        }
        const detalleVenta = yield detalle_venta_model_1.default.findByPk(id);
        if (!detalleVenta) {
            res.status(404).json({ msg: `No existe un detalle de venta con el id ${id}` });
            return;
        }
        // Verificar si existe el detalle de pedido (si se está actualizando)
        if (idpedidodetalle) {
            const pedidoDetalle = yield pedido_detalle_model_1.default.findByPk(idpedidodetalle);
            if (!pedidoDetalle) {
                res.status(400).json({ msg: 'El detalle de pedido no existe' });
                return;
            }
        }
        // Verificar si existe la venta (si se está actualizando)
        if (idventa) {
            const venta = yield venta_model_1.default.findByPk(idventa);
            if (!venta) {
                res.status(400).json({ msg: 'La venta no existe' });
                return;
            }
        }
        // Actualizar campos
        if (idpedidodetalle)
            detalleVenta.idpedidodetalle = idpedidodetalle;
        if (idventa)
            detalleVenta.idventa = idventa;
        if (precio_venta_real !== undefined)
            detalleVenta.precio_venta_real = precio_venta_real;
        // Calcular nuevo subtotal_real si cambió precio_venta_real
        if (precio_venta_real !== undefined) {
            const pedidoDetalleId = idpedidodetalle || detalleVenta.idpedidodetalle;
            if (pedidoDetalleId) {
                const pedidoDetalle = yield pedido_detalle_model_1.default.findByPk(pedidoDetalleId);
                if (pedidoDetalle && pedidoDetalle.cantidad !== null) {
                    detalleVenta.subtotal_real = Number(pedidoDetalle.cantidad) * Number(precio_venta_real);
                }
                else if (subtotal_real === undefined) {
                    res.status(400).json({
                        msg: 'El campo subtotal_real es obligatorio cuando cantidad es null'
                    });
                    return;
                }
            }
        }
        else if (subtotal_real !== undefined) {
            detalleVenta.subtotal_real = subtotal_real;
        }
        yield detalleVenta.save();
        // Obtener el detalle de venta actualizado con relaciones
        const detalleVentaActualizado = yield detalle_venta_model_1.default.findByPk(id, {
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
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
            msg: "Detalle de venta actualizado con éxito",
            data: detalleVentaActualizado
        });
    }
    catch (error) {
        console.error("Error in updateDetalleVenta:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateDetalleVenta = updateDetalleVenta;
// READ - Listar todos los detalles de venta
const getDetallesVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detallesVenta = yield detalle_venta_model_1.default.findAll({
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
                        }
                    ]
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
            msg: 'Lista de detalles de venta obtenida exitosamente',
            data: detallesVenta
        });
    }
    catch (error) {
        console.error('Error en getDetallesVenta:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de detalles de venta' });
    }
});
exports.getDetallesVenta = getDetallesVenta;
// READ - Listar detalles de venta registrados (no anulados)
const getDetallesVentaRegistrados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detallesVenta = yield detalle_venta_model_1.default.findAll({
            where: {
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            },
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
                        }
                    ]
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
            msg: 'Detalles de venta registrados obtenidos exitosamente',
            data: detallesVenta
        });
    }
    catch (error) {
        console.error('Error en getDetallesVentaRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener detalles de venta registrados' });
    }
});
exports.getDetallesVentaRegistrados = getDetallesVentaRegistrados;
// READ - Obtener detalle de venta por ID
const getDetalleVentaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalleVenta = yield detalle_venta_model_1.default.findByPk(id, {
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
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
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        res.json({
            msg: 'Detalle de venta obtenido exitosamente',
            data: detalleVenta
        });
    }
    catch (error) {
        console.error('Error en getDetalleVentaById:', error);
        res.status(500).json({ msg: 'Error al obtener el detalle de venta' });
    }
});
exports.getDetalleVentaById = getDetalleVentaById;
// READ - Obtener detalles de venta por venta
const getDetallesVentaByVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idventa } = req.params;
    try {
        const detallesVenta = yield detalle_venta_model_1.default.findAll({
            where: { idventa },
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
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
                            attributes: ['id', 'fechaoperacion', 'totalimporte']
                        }
                    ]
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
            msg: 'Detalles de la venta obtenidos exitosamente',
            data: detallesVenta
        });
    }
    catch (error) {
        console.error('Error en getDetallesVentaByVenta:', error);
        res.status(500).json({ msg: 'Error al obtener detalles de la venta' });
    }
});
exports.getDetallesVentaByVenta = getDetallesVentaByVenta;
// READ - Listar detalles de venta anulados
const getDetallesVentaAnulados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detallesVenta = yield detalle_venta_model_1.default.findAll({
            where: { idestado: estados_constans_1.VentaEstado.ANULADO },
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad', 'precio', 'subtotal'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id', 'proveedor', 'fechaingreso'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre']
                                        }
                                    ]
                                },
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Talla.target,
                                    as: 'Talla',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa']
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Detalles de venta anulados obtenidos exitosamente',
            data: detallesVenta
        });
    }
    catch (error) {
        console.error('Error en getDetallesVentaAnulados:', error);
        res.status(500).json({ msg: 'Error al obtener detalles de venta anulados' });
    }
});
exports.getDetallesVentaAnulados = getDetallesVentaAnulados;
// UPDATE - Anular detalle de venta
const anularDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalleVenta = yield detalle_venta_model_1.default.findByPk(id);
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        detalleVenta.idestado = estados_constans_1.VentaEstado.ANULADO;
        yield detalleVenta.save();
        res.json({
            msg: 'Detalle de venta anulado con éxito',
            data: { id: detalleVenta.id, estado: estados_constans_1.VentaEstado.ANULADO }
        });
    }
    catch (error) {
        console.error('Error en anularDetalleVenta:', error);
        res.status(500).json({ msg: 'Error al anular el detalle de venta' });
    }
});
exports.anularDetalleVenta = anularDetalleVenta;
// UPDATE - Restaurar detalle de venta anulado
const restaurarDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalleVenta = yield detalle_venta_model_1.default.findByPk(id);
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        // Cambiar estado a REGISTRADO
        detalleVenta.idestado = estados_constans_1.VentaEstado.REGISTRADO;
        yield detalleVenta.save();
        res.json({
            msg: 'Detalle de venta restaurado con éxito',
            data: { id: detalleVenta.id, estado: estados_constans_1.VentaEstado.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarDetalleVenta:', error);
        res.status(500).json({ msg: 'Error al restaurar el detalle de venta' });
    }
});
exports.restaurarDetalleVenta = restaurarDetalleVenta;
// DELETE - Eliminar detalle de venta físicamente
const deleteDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalleVenta = yield detalle_venta_model_1.default.findByPk(id);
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        // Eliminar físicamente
        yield detalleVenta.destroy();
        res.json({
            msg: 'Detalle de venta eliminado con éxito',
            data: { id }
        });
    }
    catch (error) {
        console.error('Error en deleteDetalleVenta:', error);
        res.status(500).json({ msg: 'Error al eliminar el detalle de venta' });
    }
});
exports.deleteDetalleVenta = deleteDetalleVenta;
// ========================================
// MÉTODO PARA DETALLE VENTA CONTROLLER
// ========================================
// READ - Obtener productos más vendidos con filtro por mes
const getProductosMasVendidos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { año, mes, limite } = req.query;
    try {
        let whereCondition = {
            idestado: estados_constans_1.VentaEstado.REGISTRADO
        };
        // Construir condición de fecha para la venta
        let ventaWhereCondition = {};
        if (año) {
            const yearStart = new Date(`${año}-01-01`);
            const yearEnd = new Date(`${año}-12-31 23:59:59`);
            ventaWhereCondition.fechaventa = {
                [sequelize_1.Op.between]: [yearStart, yearEnd]
            };
        }
        if (mes && año) {
            const monthStart = new Date(`${año}-${mes.toString().padStart(2, '0')}-01`);
            const monthEnd = new Date(parseInt(año), parseInt(mes), 0, 23, 59, 59);
            ventaWhereCondition.fechaventa = {
                [sequelize_1.Op.between]: [monthStart, monthEnd]
            };
        }
        const detallesVenta = yield detalle_venta_model_1.default.findAll({
            where: whereCondition,
            include: [
                {
                    model: pedido_detalle_model_1.default,
                    as: 'PedidoDetalle',
                    attributes: ['id', 'cantidad'],
                    include: [
                        {
                            model: pedido_detalle_model_1.default.associations.LoteTalla.target,
                            as: 'LoteTalla',
                            attributes: ['id'],
                            include: [
                                {
                                    model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target,
                                    as: 'Lote',
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: pedido_detalle_model_1.default.associations.LoteTalla.target.associations.Lote.target.associations.Producto.target,
                                            as: 'Producto',
                                            attributes: ['id', 'nombre', 'imagen']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    attributes: ['id', 'fechaventa'],
                    where: ventaWhereCondition
                }
            ],
            attributes: ['id', 'subtotal_real']
        });
        // Agrupar productos y calcular totales
        const productosVendidos = {};
        detallesVenta.forEach((detalle) => {
            var _a, _b, _c, _d;
            const producto = (_c = (_b = (_a = detalle.PedidoDetalle) === null || _a === void 0 ? void 0 : _a.LoteTalla) === null || _b === void 0 ? void 0 : _b.Lote) === null || _c === void 0 ? void 0 : _c.Producto;
            const cantidad = parseInt(((_d = detalle.PedidoDetalle) === null || _d === void 0 ? void 0 : _d.cantidad) || '0');
            const subtotal = parseFloat(detalle.subtotal_real || '0');
            if (producto) {
                const productoId = producto.id.toString();
                if (!productosVendidos[productoId]) {
                    productosVendidos[productoId] = {
                        producto: {
                            id: producto.id,
                            nombre: producto.nombre,
                            imagen: producto.imagen
                        },
                        cantidadVendida: 0,
                        totalVentas: 0,
                        totalIngresos: 0
                    };
                }
                productosVendidos[productoId].cantidadVendida += cantidad;
                productosVendidos[productoId].totalVentas += 1;
                productosVendidos[productoId].totalIngresos += subtotal;
            }
        });
        // Convertir a array y ordenar por cantidad vendida
        let ranking = Object.values(productosVendidos)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida);
        // Aplicar límite si se proporciona
        if (limite) {
            const limiteNumero = parseInt(limite);
            ranking = ranking.slice(0, limiteNumero);
        }
        res.json({
            msg: 'Productos más vendidos obtenidos exitosamente',
            data: ranking,
            filtros: { año, mes, limite },
            total: ranking.length
        });
    }
    catch (error) {
        console.error('Error en getProductosMasVendidos:', error);
        res.status(500).json({ msg: 'Error al obtener productos más vendidos' });
    }
});
exports.getProductosMasVendidos = getProductosMasVendidos;

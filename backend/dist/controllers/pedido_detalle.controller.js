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
exports.deleteMultiplePedidoDetalle = exports.deletePedidoDetalle = exports.getDetallesByPedido = exports.getPedidoDetalleById = exports.getPedidosDetalle = exports.updatePedidoDetalle = exports.createMultiplePedidoDetalle = exports.createPedidoDetalle = void 0;
const pedido_detalle_model_1 = __importDefault(require("../models/pedido_detalle.model"));
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const lote_talla_model_1 = __importDefault(require("../models/lote_talla.model"));
// CREATE - Insertar nuevo detalle de pedido
const createPedidoDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpedido, idlote_talla, cantidad, precio, subtotal } = req.body;
    try {
        // Validaciones
        if (!idpedido || !idlote_talla || cantidad === undefined || precio === undefined) {
            res.status(400).json({
                msg: 'Los campos idpedido, idlote_talla, cantidad y precio son obligatorios'
            });
            return;
        }
        // Verificar si existe el pedido
        const pedido = yield pedido_model_1.default.findByPk(idpedido);
        if (!pedido) {
            res.status(400).json({ msg: 'El pedido no existe' });
            return;
        }
        // Verificar si existe el lote_talla
        const loteTalla = yield lote_talla_model_1.default.findByPk(idlote_talla);
        if (!loteTalla) {
            res.status(400).json({ msg: 'El lote_talla no existe' });
            return;
        }
        // Calcular subtotal si no se proporciona
        const calculatedSubtotal = subtotal || (cantidad * precio);
        // Crear nuevo detalle de pedido
        const nuevoDetalle = yield pedido_detalle_model_1.default.create({
            idpedido,
            idlote_talla,
            cantidad,
            precio,
            subtotal: calculatedSubtotal,
        });
        // Obtener el detalle creado con sus relaciones
        const detalleCreado = yield pedido_detalle_model_1.default.findByPk(nuevoDetalle.id, {
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte']
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso'],
                            include: [
                                {
                                    model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                    as: 'Producto',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ]
        });
        res.status(201).json({
            msg: 'Detalle de pedido creado exitosamente',
            data: detalleCreado
        });
    }
    catch (error) {
        console.error('Error en createPedidoDetalle:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createPedidoDetalle = createPedidoDetalle;
// CREATE - Insertar múltiples detalles de pedido
const createMultiplePedidoDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const { idpedido, idlote_talla, cantidad, precio, subtotal } = detalle;
            // Validaciones para cada detalle
            if (!idpedido || !idlote_talla || cantidad === undefined || precio === undefined) {
                res.status(400).json({
                    msg: 'Cada detalle debe tener idpedido, idlote_talla, cantidad y precio'
                });
                return;
            }
            // Verificar si existe el pedido
            const pedido = yield pedido_model_1.default.findByPk(idpedido);
            if (!pedido) {
                res.status(400).json({ msg: `El pedido con id ${idpedido} no existe` });
                return;
            }
            // Verificar si existe el lote_talla
            const loteTalla = yield lote_talla_model_1.default.findByPk(idlote_talla);
            if (!loteTalla) {
                res.status(400).json({ msg: `El lote_talla con id ${idlote_talla} no existe` });
                return;
            }
            // Calcular subtotal si no se proporciona
            const calculatedSubtotal = subtotal || (cantidad * precio);
            // Crear nuevo detalle de pedido
            const nuevoDetalle = yield pedido_detalle_model_1.default.create({
                idpedido,
                idlote_talla,
                cantidad,
                precio,
                subtotal: calculatedSubtotal,
            });
            // Obtener el detalle creado con sus relaciones
            const detalleCreado = yield pedido_detalle_model_1.default.findByPk(nuevoDetalle.id, {
                include: [
                    {
                        model: pedido_model_1.default,
                        as: 'Pedido',
                        attributes: ['id', 'fechaoperacion', 'totalimporte']
                    },
                    {
                        model: lote_talla_model_1.default,
                        as: 'LoteTalla',
                        attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                        include: [
                            {
                                model: lote_talla_model_1.default.associations.Lote.target,
                                as: 'Lote',
                                attributes: ['id', 'proveedor', 'fechaingreso'],
                                include: [
                                    {
                                        model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                        as: 'Producto',
                                        attributes: ['id', 'nombre']
                                    }
                                ]
                            },
                            {
                                model: lote_talla_model_1.default.associations.Talla.target,
                                as: 'Talla',
                                attributes: ['id', 'nombre']
                            }
                        ]
                    }
                ]
            });
            detallesCreados.push(detalleCreado);
        }
        res.status(201).json({
            msg: 'Detalles de pedido creados exitosamente',
            data: detallesCreados
        });
    }
    catch (error) {
        console.error('Error en createMultiplePedidoDetalle:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createMultiplePedidoDetalle = createMultiplePedidoDetalle;
// UPDATE - Actualizar detalle de pedido
const updatePedidoDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idpedido, idlote_talla, cantidad, precio, subtotal } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del detalle es obligatorio" });
            return;
        }
        const detalle = yield pedido_detalle_model_1.default.findByPk(id);
        if (!detalle) {
            res.status(404).json({ msg: `No existe un detalle con el id ${id}` });
            return;
        }
        // Verificar si existe el pedido (si se está actualizando)
        if (idpedido) {
            const pedido = yield pedido_model_1.default.findByPk(idpedido);
            if (!pedido) {
                res.status(400).json({ msg: 'El pedido no existe' });
                return;
            }
        }
        // Verificar si existe el lote_talla (si se está actualizando)
        if (idlote_talla) {
            const loteTalla = yield lote_talla_model_1.default.findByPk(idlote_talla);
            if (!loteTalla) {
                res.status(400).json({ msg: 'El lote_talla no existe' });
                return;
            }
        }
        // Actualizar campos
        if (idpedido)
            detalle.idpedido = idpedido;
        if (idlote_talla)
            detalle.idlote_talla = idlote_talla;
        if (cantidad !== undefined)
            detalle.cantidad = cantidad;
        if (precio !== undefined)
            detalle.precio = precio;
        // Calcular nuevo subtotal si cambió cantidad o precio
        if (cantidad !== undefined || precio !== undefined) {
            const newCantidad = cantidad !== undefined ? cantidad : detalle.cantidad;
            const newPrecio = precio !== undefined ? precio : detalle.precio;
            detalle.subtotal = newCantidad * newPrecio;
        }
        else if (subtotal !== undefined) {
            detalle.subtotal = subtotal;
        }
        yield detalle.save();
        // Obtener el detalle actualizado con relaciones
        const detalleActualizado = yield pedido_detalle_model_1.default.findByPk(id, {
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte']
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso'],
                            include: [
                                {
                                    model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                    as: 'Producto',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ]
        });
        res.json({
            msg: "Detalle de pedido actualizado con éxito",
            data: detalleActualizado
        });
    }
    catch (error) {
        console.error("Error en updatePedidoDetalle:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updatePedidoDetalle = updatePedidoDetalle;
// READ - Listar todos los detalles de pedido
const getPedidosDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detalles = yield pedido_detalle_model_1.default.findAll({
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte']
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso'],
                            include: [
                                {
                                    model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                    as: 'Producto',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de detalles de pedido obtenida exitosamente',
            data: detalles
        });
    }
    catch (error) {
        console.error('Error en getPedidosDetalle:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de detalles' });
    }
});
exports.getPedidosDetalle = getPedidosDetalle;
// READ - Obtener detalle por ID
const getPedidoDetalleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalle = yield pedido_detalle_model_1.default.findByPk(id, {
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte']
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso'],
                            include: [
                                {
                                    model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                    as: 'Producto',
                                    attributes: ['id', 'nombre']
                                }
                            ]
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ]
        });
        if (!detalle) {
            res.status(404).json({ msg: 'Detalle de pedido no encontrado' });
            return;
        }
        res.json({
            msg: 'Detalle de pedido obtenido exitosamente',
            data: detalle
        });
    }
    catch (error) {
        console.error('Error en getPedidoDetalleById:', error);
        res.status(500).json({ msg: 'Error al obtener el detalle' });
    }
});
exports.getPedidoDetalleById = getPedidoDetalleById;
// READ - Obtener detalles por pedido
const getDetallesByPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpedido } = req.params;
    try {
        const detalles = yield pedido_detalle_model_1.default.findAll({
            where: { idpedido },
            include: [
                {
                    model: pedido_model_1.default,
                    as: 'Pedido',
                    attributes: ['id', 'fechaoperacion', 'totalimporte']
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla',
                    attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                    include: [
                        {
                            model: lote_talla_model_1.default.associations.Lote.target,
                            as: 'Lote',
                            attributes: ['id', 'proveedor', 'fechaingreso'],
                            include: [
                                {
                                    model: lote_talla_model_1.default.associations.Lote.target.associations.Producto.target,
                                    as: 'Producto',
                                    attributes: ['id', 'nombre', 'imagen']
                                }
                            ]
                        },
                        {
                            model: lote_talla_model_1.default.associations.Talla.target,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Detalles del pedido obtenidos exitosamente',
            data: detalles
        });
    }
    catch (error) {
        console.error('Error en getDetallesByPedido:', error);
        res.status(500).json({ msg: 'Error al obtener detalles del pedido' });
    }
});
exports.getDetallesByPedido = getDetallesByPedido;
// DELETE - Eliminar detalle de pedido
const deletePedidoDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const detalle = yield pedido_detalle_model_1.default.findByPk(id);
        if (!detalle) {
            res.status(404).json({ msg: 'Detalle de pedido no encontrado' });
            return;
        }
        // Eliminar físicamente el detalle (no se usa eliminación lógica aquí)
        yield detalle.destroy();
        res.json({
            msg: 'Detalle de pedido eliminado con éxito',
            data: { id }
        });
    }
    catch (error) {
        console.error('Error en deletePedidoDetalle:', error);
        res.status(500).json({ msg: 'Error al eliminar el detalle' });
    }
});
exports.deletePedidoDetalle = deletePedidoDetalle;
// DELETE - Eliminar múltiples detalles de pedido
const deleteMultiplePedidoDetalle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({
                msg: 'El campo ids es obligatorio y debe ser un array no vacío'
            });
            return;
        }
        // Eliminar físicamente los detalles
        yield pedido_detalle_model_1.default.destroy({
            where: {
                id: ids
            }
        });
        res.json({
            msg: 'Detalles de pedido eliminados con éxito',
            data: { ids }
        });
    }
    catch (error) {
        console.error('Error en deleteMultiplePedidoDetalle:', error);
        res.status(500).json({ msg: 'Error al eliminar los detalles' });
    }
});
exports.deleteMultiplePedidoDetalle = deleteMultiplePedidoDetalle;

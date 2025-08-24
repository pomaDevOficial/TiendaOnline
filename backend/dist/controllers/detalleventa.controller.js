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
exports.getDetalleByIdVenta = exports.deleteDetalleVenta = exports.getDetalleVentaById = exports.updateDetalleVenta = exports.getDetalleVentas = exports.createDetalleVenta = void 0;
const detalleventa_model_1 = __importDefault(require("../models/detalleventa.model"));
const venta_model_1 = __importDefault(require("../models/venta.model"));
const lote_model_1 = __importDefault(require("../models/lote.model"));
const producto_model_1 = __importDefault(require("../models/producto.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const unidadmedida_model_1 = __importDefault(require("../models/unidadmedida.model"));
const cliente_model_1 = __importDefault(require("../models/cliente.model"));
const empleado_model_1 = __importDefault(require("../models/empleado.model"));
const createDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_venta, id_lote, cantidad, precio_unitario } = req.body;
    try {
        // Crea un nuevo detalle de venta
        const nuevoDetalleVenta = yield detalleventa_model_1.default.create({
            id_venta,
            id_lote,
            cantidad,
            precio_unitario,
            subtotal: cantidad * precio_unitario
        });
        res.status(201).json(nuevoDetalleVenta);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createDetalleVenta = createDetalleVenta;
const getDetalleVentas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detalleVentas = yield detalleventa_model_1.default.findAll({
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        { model: cliente_model_1.default, as: 'Cliente' }, // Incluir Cliente
                        { model: empleado_model_1.default, as: 'Empleado' } // Incluir Empleado
                    ]
                },
                {
                    model: lote_model_1.default,
                    as: 'Lote',
                    include: [
                        {
                            model: producto_model_1.default,
                            as: 'Producto',
                            include: [
                                { model: categoria_model_1.default, as: 'Categoria' }, // Incluir Categoria
                                { model: marca_model_1.default, as: 'Marca' }, // Incluir Marca
                                { model: unidadmedida_model_1.default, as: 'UnidadMedida' } // Incluir UnidadMedida
                            ]
                        }
                    ]
                }
            ],
        });
        res.json(detalleVentas);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la lista de detalles de venta' });
    }
});
exports.getDetalleVentas = getDetalleVentas;
const updateDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDetalleVenta } = req.params;
    const { id_venta, id_lote, cantidad, precio_unitario, subtotal } = req.body;
    try {
        const detalleVenta = yield detalleventa_model_1.default.findByPk(idDetalleVenta);
        if (!detalleVenta) {
            res.status(404).json({ msg: `No existe un detalle de venta con el id ${idDetalleVenta}` });
            return;
        }
        // Actualizar el detalle de venta con los campos proporcionados en la solicitud
        if (id_venta)
            detalleVenta.id_venta = id_venta;
        if (id_lote)
            detalleVenta.id_lote = id_lote;
        if (cantidad)
            detalleVenta.cantidad = cantidad;
        if (precio_unitario)
            detalleVenta.precio_unitario = precio_unitario;
        if (subtotal !== undefined)
            detalleVenta.subtotal = subtotal;
        yield detalleVenta.save();
        res.json({ msg: 'El detalle de venta fue actualizado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.updateDetalleVenta = updateDetalleVenta;
const getDetalleVentaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDetalleVenta } = req.params;
    try {
        const detalleVenta = yield detalleventa_model_1.default.findByPk(idDetalleVenta, {
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        { model: cliente_model_1.default, as: 'Cliente' },
                        { model: empleado_model_1.default, as: 'Empleado' }
                    ]
                },
                {
                    model: lote_model_1.default,
                    as: 'Lote',
                    include: [
                        {
                            model: producto_model_1.default,
                            as: 'Producto',
                            include: [
                                { model: categoria_model_1.default, as: 'Categoria' },
                                { model: marca_model_1.default, as: 'Marca' },
                                { model: unidadmedida_model_1.default, as: 'UnidadMedida' }
                            ]
                        }
                    ]
                }
            ],
        });
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        res.json(detalleVenta);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el detalle de venta' });
    }
});
exports.getDetalleVentaById = getDetalleVentaById;
const deleteDetalleVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDetalleVenta } = req.params;
    try {
        const detalleVenta = yield detalleventa_model_1.default.findByPk(idDetalleVenta);
        if (!detalleVenta) {
            res.status(404).json({ msg: 'Detalle de venta no encontrado' });
            return;
        }
        yield detalleVenta.destroy();
        res.json({ msg: 'Detalle de venta eliminado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el detalle de venta' });
    }
});
exports.deleteDetalleVenta = deleteDetalleVenta;
const getDetalleByIdVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idVenta } = req.params;
    try {
        const idVentaNum = parseInt(idVenta, 10);
        if (isNaN(idVentaNum)) {
            res.status(400).json({ msg: "El ID de la venta debe ser un número válido." });
            return;
        }
        const detallesVenta = yield detalleventa_model_1.default.findAll({
            where: { id_venta: idVentaNum },
            include: [
                {
                    model: venta_model_1.default,
                    as: 'Venta',
                    include: [
                        { model: cliente_model_1.default, as: 'Cliente' },
                        { model: empleado_model_1.default, as: 'Empleado' }
                    ]
                },
                {
                    model: lote_model_1.default,
                    as: 'Lote',
                    include: [
                        {
                            model: producto_model_1.default,
                            as: 'Producto',
                            include: [
                                { model: categoria_model_1.default, as: 'Categoria' },
                                { model: marca_model_1.default, as: 'Marca' },
                                { model: unidadmedida_model_1.default, as: 'UnidadMedida' }
                            ]
                        }
                    ]
                }
            ],
        });
        if (!detallesVenta || detallesVenta.length === 0) {
            res.status(404).json({ msg: "No se encontraron detalles para esta venta." });
            return;
        }
        res.json(detallesVenta);
    }
    catch (error) {
        console.error("Error en getDetalleByIdVenta:", error);
        res.status(500).json({ msg: "Error al obtener la lista de detalles de venta." });
    }
});
exports.getDetalleByIdVenta = getDetalleByIdVenta;

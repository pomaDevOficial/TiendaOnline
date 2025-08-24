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
exports.getProductosConBajoStock = exports.verificarProductoEnInventario = exports.deleteInventario = exports.updateInventario = exports.getInventarioById = exports.getInventarios = exports.createInventario = void 0;
const inventario_model_1 = __importDefault(require("../models/inventario.model"));
const producto_model_1 = __importDefault(require("../models/producto.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const unidadmedida_model_1 = __importDefault(require("../models/unidadmedida.model"));
const bebida_model_1 = __importDefault(require("../models/bebida.model"));
const alimento_model_1 = __importDefault(require("../models/alimento.model"));
const sequelize_1 = require("sequelize");
const createInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_producto, precio_compra, precio_venta, stock, fecha_ingreso, estado } = req.body;
    try {
        // Crea un nuevo inventario
        const nuevoInventario = yield inventario_model_1.default.create({
            id_producto,
            precio_compra,
            precio_venta,
            stock,
            fecha_ingreso,
            estado
        });
        res.status(201).json(nuevoInventario);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createInventario = createInventario;
const getInventarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventarios = yield inventario_model_1.default.findAll({
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    include: [
                        { model: categoria_model_1.default, as: 'Categoria' },
                        { model: unidadmedida_model_1.default, as: 'UnidadMedida' },
                        { model: bebida_model_1.default, as: 'Bebida' },
                        { model: alimento_model_1.default, as: 'Alimento' }
                    ],
                }
            ],
        });
        res.json(inventarios);
    }
    catch (error) {
        console.error('Error al obtener la lista de inventarios:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de inventarios' });
    }
});
exports.getInventarios = getInventarios;
const getInventarioById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idInventario } = req.params;
    try {
        const inventario = yield inventario_model_1.default.findByPk(idInventario, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    include: [
                        { model: categoria_model_1.default, as: 'Categoria' },
                        { model: unidadmedida_model_1.default, as: 'UnidadMedida' },
                        { model: bebida_model_1.default, as: 'Bebida' },
                        { model: alimento_model_1.default, as: 'Alimento' }
                    ],
                }
            ],
        });
        if (!inventario) {
            res.status(404).json({ msg: 'Inventario no encontrado' });
            return;
        }
        res.json(inventario);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el inventario' });
    }
});
exports.getInventarioById = getInventarioById;
const updateInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idInventario } = req.params;
    const { id_producto, precio_compra, precio_venta, stock, fecha_ingreso, estado } = req.body;
    try {
        const inventario = yield inventario_model_1.default.findByPk(idInventario);
        if (!inventario) {
            res.status(404).json({ msg: `No existe un inventario con el id ${idInventario}` });
            return;
        }
        // Actualizar los campos proporcionados
        if (id_producto)
            inventario.id_producto = id_producto;
        if (precio_compra)
            inventario.precio_compra = precio_compra;
        if (precio_venta)
            inventario.precio_venta = precio_venta;
        // Actualizar stock y estado basado en su valor
        if (stock !== undefined && stock !== null) {
            inventario.stock = stock;
            inventario.estado = stock > 0 ? 'disponible' : 'agotado';
        }
        if (fecha_ingreso)
            inventario.fecha_ingreso = fecha_ingreso;
        if (estado && stock === undefined)
            inventario.estado = estado; // Solo actualizar manualmente si el stock no se modificó
        // Guardar los cambios
        yield inventario.save();
        res.json({ msg: 'El inventario fue actualizado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.updateInventario = updateInventario;
const deleteInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idInventario } = req.params;
    try {
        const inventario = yield inventario_model_1.default.findByPk(idInventario);
        if (!inventario) {
            res.status(404).json({ msg: 'Inventario no encontrado' });
            return;
        }
        yield inventario.destroy();
        res.json({ msg: 'Inventario eliminado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el inventario' });
    }
});
exports.deleteInventario = deleteInventario;
const verificarProductoEnInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idProducto } = req.params;
    try {
        const existe = yield inventario_model_1.default.findOne({ where: { id_producto: idProducto } });
        if (existe) {
            res.json({ existe: true });
        }
        else {
            res.json({ existe: false });
        }
    }
    catch (error) {
        console.error('Error al verificar producto en inventario:', error);
        res.status(500).json({ msg: 'Error al verificar producto en inventario' });
    }
});
exports.verificarProductoEnInventario = verificarProductoEnInventario;
const getProductosConBajoStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productosConBajoStock = yield inventario_model_1.default.findAll({
            where: {
                stock: { [sequelize_1.Op.lt]: 11 } // Stock menor a 11
            },
            include: [
                {
                    model: producto_model_1.default,
                    as: "Producto",
                    include: [
                        { model: categoria_model_1.default, as: "Categoria" },
                        { model: unidadmedida_model_1.default, as: "UnidadMedida" },
                        { model: bebida_model_1.default, as: "Bebida" },
                        { model: alimento_model_1.default, as: "Alimento" }
                    ]
                }
            ],
            order: [["stock", "ASC"]] // Ordenar por menor stock primero
        });
        res.json(productosConBajoStock);
    }
    catch (error) {
        console.error("Error al obtener productos con bajo stock:", error);
        res.status(500).json({ mensaje: "Error al obtener productos con bajo stock." });
    }
});
exports.getProductosConBajoStock = getProductosConBajoStock;

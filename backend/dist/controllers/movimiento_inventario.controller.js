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
exports.deleteMovimiento = exports.updateMovimiento = exports.getMovimientoById = exports.getMovimientos = exports.createMovimiento = void 0;
const lote_model_1 = __importDefault(require("../models/lote.model")); // Importamos el modelo Lote
const movimiento_inventario_model_1 = __importDefault(require("../models/movimiento_inventario.model"));
const producto_model_1 = __importDefault(require("../models/producto.model")); // Importamos el modelo Producto
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const unidadmedida_model_1 = __importDefault(require("../models/unidadmedida.model"));
// Crear un nuevo movimiento de inventario
const createMovimiento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_lote, tipo_movimiento, cantidad, fecha } = req.body;
    try {
        // Verificamos si el lote existe
        const lote = yield lote_model_1.default.findByPk(id_lote);
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        // Crear el nuevo movimiento
        const nuevoMovimiento = yield movimiento_inventario_model_1.default.create({
            id_lote,
            tipo_movimiento,
            cantidad,
            fecha
        });
        res.status(201).json(nuevoMovimiento);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear el movimiento de inventario' });
    }
});
exports.createMovimiento = createMovimiento;
// Obtener todos los movimientos de inventario
const getMovimientos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movimientos = yield movimiento_inventario_model_1.default.findAll({
            include: [
                {
                    model: lote_model_1.default,
                    as: 'Lote', // Incluimos el lote asociado
                    include: [
                        {
                            model: producto_model_1.default,
                            as: 'Producto', // Incluimos el producto asociado al lote
                            include: [
                                {
                                    model: categoria_model_1.default,
                                    as: 'Categoria' // Incluimos la categoría del producto
                                },
                                {
                                    model: marca_model_1.default,
                                    as: 'Marca' // Incluimos la marca del producto
                                },
                                {
                                    model: unidadmedida_model_1.default,
                                    as: 'UnidadMedida' // Incluimos la unidad de medida del producto
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        res.json(movimientos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los movimientos de inventario' });
    }
});
exports.getMovimientos = getMovimientos;
// Obtener un movimiento de inventario por ID
const getMovimientoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movimiento = yield movimiento_inventario_model_1.default.findByPk(id, {
            include: [
                {
                    model: lote_model_1.default,
                    as: 'Lote', // Incluimos el lote asociado
                    include: [
                        {
                            model: producto_model_1.default,
                            as: 'Producto', // Incluimos el producto asociado al lote
                            include: [
                                {
                                    model: categoria_model_1.default,
                                    as: 'Categoria' // Incluimos la categoría del producto
                                },
                                {
                                    model: marca_model_1.default,
                                    as: 'Marca' // Incluimos la marca del producto
                                },
                                {
                                    model: unidadmedida_model_1.default,
                                    as: 'UnidadMedida' // Incluimos la unidad de medida del producto
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!movimiento) {
            res.status(404).json({ msg: 'Movimiento de inventario no encontrado' });
            return;
        }
        res.json(movimiento);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el movimiento de inventario' });
    }
});
exports.getMovimientoById = getMovimientoById;
// Actualizar un movimiento de inventario
const updateMovimiento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id_lote, tipo_movimiento, cantidad, fecha } = req.body;
    try {
        const movimiento = yield movimiento_inventario_model_1.default.findByPk(id);
        if (!movimiento) {
            res.status(404).json({ msg: `No existe un movimiento con el id ${id}` });
            return;
        }
        // Verificar si el lote existe solo si id_lote se envió
        if (id_lote) {
            const lote = yield lote_model_1.default.findByPk(id_lote);
            if (!lote) {
                res.status(404).json({ msg: 'Lote no encontrado' });
                return;
            }
        }
        // Actualizar solo los campos que se proporcionan en la solicitud
        if (id_lote)
            movimiento.id_lote = id_lote;
        if (tipo_movimiento)
            movimiento.tipo_movimiento = tipo_movimiento;
        if (cantidad)
            movimiento.cantidad = cantidad;
        if (fecha)
            movimiento.fecha = fecha;
        yield movimiento.save(); // Guardar los cambios
        res.json({ msg: 'El movimiento de inventario fue actualizado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el movimiento de inventario' });
    }
});
exports.updateMovimiento = updateMovimiento;
// Eliminar un movimiento de inventario
const deleteMovimiento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movimiento = yield movimiento_inventario_model_1.default.findByPk(id);
        if (!movimiento) {
            res.status(404).json({ msg: 'Movimiento de inventario no encontrado' });
            return;
        }
        yield movimiento.destroy(); // Eliminar el movimiento
        res.json({ msg: 'Movimiento de inventario eliminado correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el movimiento de inventario' });
    }
});
exports.deleteMovimiento = deleteMovimiento;

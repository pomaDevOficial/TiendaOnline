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
exports.restaurarLote = exports.getLotesEliminados = exports.deleteLote = exports.cambiarEstadoLote = exports.getLotesByProducto = exports.getLoteById = exports.getLotesDisponibles = exports.getLotes = exports.updateLote = exports.createLote = void 0;
const lote_model_1 = __importDefault(require("../models/lote.model"));
const producto_model_1 = __importDefault(require("../models/producto.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo lote
const createLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idproducto, proveedor, fechaingreso } = req.body;
    try {
        // Validaciones
        if (!idproducto || !proveedor) {
            res.status(400).json({
                msg: 'Los campos idproducto y proveedor son obligatorios'
            });
            return;
        }
        // Verificar si existe el producto
        const producto = yield producto_model_1.default.findByPk(idproducto);
        if (!producto) {
            res.status(400).json({ msg: 'El producto no existe' });
            return;
        }
        // Crear nuevo lote
        const nuevoLote = yield lote_model_1.default.create({
            idproducto,
            proveedor,
            fechaingreso: fechaingreso || new Date(),
            idestado: estados_constans_1.LoteEstado.DISPONIBLE
        });
        // Obtener el lote creado con sus relaciones
        const loteCreado = yield lote_model_1.default.findByPk(nuevoLote.id, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
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
            msg: 'Lote creado exitosamente',
            data: loteCreado
        });
    }
    catch (error) {
        console.error('Error en createLote:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createLote = createLote;
// UPDATE - Actualizar lote
const updateLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idproducto, proveedor, fechaingreso } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del lote es obligatorio" });
            return;
        }
        const lote = yield lote_model_1.default.findByPk(id);
        if (!lote) {
            res.status(404).json({ msg: `No existe un lote con el id ${id}` });
            return;
        }
        // Verificar si existe el producto (si se está actualizando)
        if (idproducto) {
            const producto = yield producto_model_1.default.findByPk(idproducto);
            if (!producto) {
                res.status(400).json({ msg: 'El producto no existe' });
                return;
            }
        }
        // Actualizar campos
        if (idproducto)
            lote.idproducto = idproducto;
        if (proveedor)
            lote.proveedor = proveedor;
        if (fechaingreso)
            lote.fechaingreso = fechaingreso;
        // Cambiar estado a ACTUALIZADO si no está eliminado
        if (lote.idestado !== estados_constans_1.LoteEstado.ELIMINADO) {
            lote.idestado = estados_constans_1.LoteEstado.DISPONIBLE;
        }
        yield lote.save();
        // Obtener el lote actualizado con relaciones
        const loteActualizado = yield lote_model_1.default.findByPk(id, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
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
            msg: "Lote actualizado con éxito",
            data: loteActualizado
        });
    }
    catch (error) {
        console.error("Error en updateLote:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateLote = updateLote;
// READ - Listar todos los lotes
const getLotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lotes = yield lote_model_1.default.findAll({
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
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
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de lotes obtenida exitosamente',
            data: lotes
        });
    }
    catch (error) {
        console.error('Error en getLotes:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de lotes' });
    }
});
exports.getLotes = getLotes;
// READ - Listar lotes disponibles (no eliminados)
const getLotesDisponibles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lotes = yield lote_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.LoteEstado.DISPONIBLE, estados_constans_1.LoteEstado.AGOTADO]
            },
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['fechaingreso', 'DESC']]
        });
        res.json({
            msg: 'Lotes disponibles obtenidos exitosamente',
            data: lotes
        });
    }
    catch (error) {
        console.error('Error en getLotesDisponibles:', error);
        res.status(500).json({ msg: 'Error al obtener lotes disponibles' });
    }
});
exports.getLotesDisponibles = getLotesDisponibles;
// READ - Obtener lote por ID
const getLoteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lote = yield lote_model_1.default.findByPk(id, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
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
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        res.json({
            msg: 'Lote obtenido exitosamente',
            data: lote
        });
    }
    catch (error) {
        console.error('Error en getLoteById:', error);
        res.status(500).json({ msg: 'Error al obtener el lote' });
    }
});
exports.getLoteById = getLoteById;
// READ - Obtener lotes por producto
const getLotesByProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idproducto } = req.params;
    try {
        const lotes = yield lote_model_1.default.findAll({
            where: {
                idproducto,
                idestado: [estados_constans_1.LoteEstado.DISPONIBLE, estados_constans_1.LoteEstado.AGOTADO]
            },
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
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
            order: [['fechaingreso', 'DESC']]
        });
        res.json({
            msg: 'Lotes del producto obtenidos exitosamente',
            data: lotes
        });
    }
    catch (error) {
        console.error('Error en getLotesByProducto:', error);
        res.status(500).json({ msg: 'Error al obtener lotes del producto' });
    }
});
exports.getLotesByProducto = getLotesByProducto;
// UPDATE - Cambiar estado del lote (disponible/agotado)
const cambiarEstadoLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { estado } = req.body; // LoteEstado.DISPONIBLE o LoteEstado.AGOTADO
    try {
        if (!estado || ![estados_constans_1.LoteEstado.DISPONIBLE, estados_constans_1.LoteEstado.AGOTADO].includes(estado)) {
            res.status(400).json({
                msg: 'Estado inválido. Debe ser DISPONIBLE (1) o AGOTADO (2)'
            });
            return;
        }
        const lote = yield lote_model_1.default.findByPk(id);
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        lote.idestado = estado;
        yield lote.save();
        res.json({
            msg: 'Estado del lote actualizado con éxito',
            data: { id: lote.id, estado }
        });
    }
    catch (error) {
        console.error('Error en cambiarEstadoLote:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado del lote' });
    }
});
exports.cambiarEstadoLote = cambiarEstadoLote;
// DELETE - Eliminar lote (cambiar estado a eliminado)
const deleteLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lote = yield lote_model_1.default.findByPk(id);
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        lote.idestado = estados_constans_1.LoteEstado.ELIMINADO;
        yield lote.save();
        res.json({
            msg: 'Lote eliminado con éxito',
            data: { id: lote.id, estado: estados_constans_1.LoteEstado.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteLote:', error);
        res.status(500).json({ msg: 'Error al eliminar el lote' });
    }
});
exports.deleteLote = deleteLote;
// READ - Listar lotes eliminados
const getLotesEliminados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lotes = yield lote_model_1.default.findAll({
            where: { idestado: estados_constans_1.LoteEstado.ELIMINADO },
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        {
                            model: categoria_model_1.default,
                            as: 'Categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: marca_model_1.default,
                            as: 'Marca',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['fechaingreso', 'DESC']]
        });
        res.json({
            msg: 'Lotes eliminados obtenidos exitosamente',
            data: lotes
        });
    }
    catch (error) {
        console.error('Error en getLotesEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener lotes eliminados' });
    }
});
exports.getLotesEliminados = getLotesEliminados;
// UPDATE - Restaurar lote eliminado
const restaurarLote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lote = yield lote_model_1.default.findByPk(id);
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        // Cambiar estado a DISPONIBLE
        lote.idestado = estados_constans_1.LoteEstado.DISPONIBLE;
        yield lote.save();
        res.json({
            msg: 'Lote restaurado con éxito',
            data: { id: lote.id, estado: estados_constans_1.LoteEstado.DISPONIBLE }
        });
    }
    catch (error) {
        console.error('Error en restaurarLote:', error);
        res.status(500).json({ msg: 'Error al restaurar el lote' });
    }
});
exports.restaurarLote = restaurarLote;

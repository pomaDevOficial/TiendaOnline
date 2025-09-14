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
exports.getLotesBuscar = exports.createLoteCompleto = exports.restaurarLote = exports.getLotesEliminados = exports.deleteLote = exports.cambiarEstadoLote = exports.getLotesByProducto = exports.getLoteById = exports.getLotesDisponibles = exports.getLotes = exports.getLoteObtenerInformacion = exports.updateLote = exports.createLote = void 0;
const lote_model_1 = __importDefault(require("../models/lote.model"));
const producto_model_1 = __importDefault(require("../models/producto.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const lote_talla_model_1 = __importDefault(require("../models/lote_talla.model"));
const talla_model_1 = __importDefault(require("../models/talla.model"));
const movimiento_lote_model_1 = __importDefault(require("../models/movimiento_lote.model"));
const sequelize_1 = require("sequelize");
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
        // Verificar si ya existe un lote activo para este producto
        const loteExistente = yield lote_model_1.default.findOne({
            where: {
                idproducto,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.LoteEstado.ELIMINADO }
            }
        });
        if (loteExistente) {
            res.status(400).json({
                msg: 'Ya existe un lote para este producto'
            });
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
const getLoteObtenerInformacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lote = yield lote_model_1.default.findByPk(id, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    include: [
                        { model: categoria_model_1.default, as: 'Categoria', attributes: ['id', 'nombre'] },
                        { model: marca_model_1.default, as: 'Marca', attributes: ['id', 'nombre'] }
                    ]
                },
                { model: estado_model_1.default, as: 'Estado', attributes: ['id', 'nombre'] }
            ]
        });
        if (!lote) {
            res.status(404).json({ msg: 'Lote no encontrado' });
            return;
        }
        const detalles = yield lote_talla_model_1.default.findAll({
            where: {
                idlote: id,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.LoteEstado.ELIMINADO } // 🚀 excluye los eliminados
            },
        });
        res.json({
            msg: 'Lote obtenido exitosamente',
            data: lote,
            detalles
        });
    }
    catch (error) {
        console.error('Error en getLoteObtenerInformacion:', error);
        res.status(500).json({ msg: 'Error al obtener el lote' });
    }
});
exports.getLoteObtenerInformacion = getLoteObtenerInformacion;
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
                        },
                    ]
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                },
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
                },
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
// CREATE - Insertar lote completo con detalles y movimientos
const createLoteCompleto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idproducto, proveedor, fechaingreso, detalles } = req.body;
    try {
        // Validaciones
        if (!idproducto || !proveedor) {
            res.status(400).json({
                msg: 'Los campos idproducto y proveedor son obligatorios'
            });
            return;
        }
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            res.status(400).json({
                msg: 'El campo detalles es obligatorio y debe ser un array no vacío'
            });
            return;
        }
        // Verificar si existe el producto
        const producto = yield producto_model_1.default.findByPk(idproducto);
        if (!producto) {
            res.status(400).json({ msg: 'El producto no existe' });
            return;
        }
        // Verificar si ya existe un lote activo para este producto
        const loteExistente = yield lote_model_1.default.findOne({
            where: {
                idproducto,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.LoteEstado.ELIMINADO }
            }
        });
        if (loteExistente) {
            res.status(400).json({
                msg: 'Ya existe un lote activo para este producto'
            });
            return;
        }
        // Crear nuevo lote
        const nuevoLote = yield lote_model_1.default.create({
            idproducto,
            proveedor,
            fechaingreso: fechaingreso || new Date(),
            idestado: estados_constans_1.LoteEstado.DISPONIBLE
        });
        const detallesCreados = [];
        const movimientosCreados = [];
        // Crear detalles de lote_talla
        for (const detalle of detalles) {
            const { idtalla, stock, esGenero, preciocosto, precioventa } = detalle;
            // Validaciones para cada detalle
            if (!idtalla || stock === undefined || esGenero === undefined) {
                res.status(400).json({
                    msg: 'Cada detalle debe tener idtalla, stock y esGenero'
                });
                return;
            }
            // Verificar si existe la talla
            const talla = yield talla_model_1.default.findByPk(idtalla);
            if (!talla) {
                res.status(400).json({ msg: `La talla con id ${idtalla} no existe` });
                return;
            }
            // Verificar si ya existe un registro con el mismo idlote, idtalla y esGenero
            const loteTallaExistente = yield lote_talla_model_1.default.findOne({
                where: {
                    idlote: nuevoLote.id,
                    idtalla,
                    esGenero,
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.LoteEstado.ELIMINADO }
                }
            });
            if (loteTallaExistente) {
                res.status(400).json({
                    msg: `Ya existe un registro con la talla ${idtalla} y género ${esGenero} para este lote`
                });
                return;
            }
            // Crear nuevo lote_talla
            const nuevoLoteTalla = yield lote_talla_model_1.default.create({
                idlote: nuevoLote.id,
                idtalla,
                stock,
                esGenero,
                preciocosto: preciocosto || 0,
                precioventa: precioventa || 0,
                idestado: estados_constans_1.LoteEstado.DISPONIBLE
            });
            // Obtener el lote_talla creado con sus relaciones
            const loteTallaCreado = yield lote_talla_model_1.default.findByPk(nuevoLoteTalla.id, {
                include: [
                    {
                        model: talla_model_1.default,
                        as: 'Talla',
                        attributes: ['id', 'nombre']
                    },
                    {
                        model: estado_model_1.default,
                        as: 'Estado',
                        attributes: ['id', 'nombre']
                    }
                ]
            });
            detallesCreados.push(loteTallaCreado);
            // Crear movimiento de ingreso para este detalle
            const nuevoMovimiento = yield movimiento_lote_model_1.default.create({
                idlote_talla: nuevoLoteTalla.id,
                tipomovimiento: 'INGRESO',
                cantidad: stock,
                fechamovimiento: new Date(),
                idestado: estados_constans_1.EstadoGeneral.REGISTRADO
            });
            // Obtener el movimiento creado con sus relaciones
            const movimientoCreado = yield movimiento_lote_model_1.default.findByPk(nuevoMovimiento.id, {
                include: [
                    {
                        model: lote_talla_model_1.default,
                        as: 'LoteTalla',
                        attributes: ['id', 'stock', 'esGenero', 'preciocosto', 'precioventa'],
                        include: [
                            {
                                model: talla_model_1.default,
                                as: 'Talla',
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
            movimientosCreados.push(movimientoCreado);
        }
        // Obtener el lote creado con todas sus relaciones
        const loteCompleto = yield lote_model_1.default.findByPk(nuevoLote.id, {
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre', 'imagen'],
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
                },
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTallas',
                    include: [
                        {
                            model: talla_model_1.default,
                            as: 'Talla',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: estado_model_1.default,
                            as: 'Estado',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ]
        });
        res.status(201).json({
            msg: 'Lote completo creado exitosamente',
            data: {
                lote: loteCompleto
            }
        });
    }
    catch (error) {
        console.error('Error en createLoteCompleto:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createLoteCompleto = createLoteCompleto;
const getLotesBuscar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const qraw = req.query.q;
    const q = typeof qraw === 'string' ? qraw.trim() : '';
    try {
        if (!q) {
            res.status(400).json({ msg: 'El parámetro q (búsqueda) es obligatorio' });
            return;
        }
        const like = `%${q}%`;
        const lotes = yield lote_model_1.default.findAll({
            where: {
                idestado: estados_constans_1.LoteEstado.DISPONIBLE, // 🔹 Solo lotes disponibles
                [sequelize_1.Op.or]: [
                    { proveedor: { [sequelize_1.Op.like]: like } },
                    { '$Producto.nombre$': { [sequelize_1.Op.like]: like } },
                    { '$Producto.Categoria.nombre$': { [sequelize_1.Op.like]: like } },
                    { '$Producto.Marca.nombre$': { [sequelize_1.Op.like]: like } }
                ]
            },
            include: [
                {
                    model: producto_model_1.default,
                    as: 'Producto',
                    attributes: ['id', 'nombre'],
                    required: false,
                    include: [
                        { model: categoria_model_1.default, as: 'Categoria', attributes: ['id', 'nombre'], required: false },
                        { model: marca_model_1.default, as: 'Marca', attributes: ['id', 'nombre'], required: false }
                    ]
                },
                { model: estado_model_1.default, as: 'Estado', attributes: ['id', 'nombre'], required: false }
            ],
            order: [['fechaingreso', 'DESC']],
            group: ['Lote.id'] // evita duplicados sin usar "distinct"
        });
        res.json({
            msg: 'Resultados de búsqueda obtenidos exitosamente',
            data: lotes
        });
    }
    catch (error) {
        console.error('Error en getLotesBuscar:', error);
        res.status(500).json({ msg: 'Error al buscar lotes' });
    }
});
exports.getLotesBuscar = getLotesBuscar;

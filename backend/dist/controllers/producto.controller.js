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
exports.restaurarProducto = exports.getProductosEliminados = exports.deleteProducto = exports.getProductoById = exports.getProductosRegistrados = exports.getProductos = exports.verificarProductoCompleto = exports.updateProducto = exports.createProducto = void 0;
const producto_model_1 = __importDefault(require("../models/producto.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo producto
const createProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, imagen, idcategoria, idmarca } = req.body;
    try {
        // Validaciones
        if (!nombre || !idcategoria || !idmarca) {
            res.status(400).json({
                msg: 'Los campos nombre, idcategoria e idmarca son obligatorios'
            });
            return;
        }
        // Verificar si el producto ya existe con la misma combinación
        const existingProducto = yield producto_model_1.default.findOne({
            where: {
                nombre,
                idcategoria,
                idmarca
            }
        });
        if (existingProducto) {
            res.status(400).json({
                msg: 'Ya existe un producto con el mismo nombre, categoría y marca'
            });
            return;
        }
        // Verificar si existen las referencias
        const categoria = yield categoria_model_1.default.findByPk(idcategoria);
        if (!categoria) {
            res.status(400).json({ msg: 'La categoría no existe' });
            return;
        }
        const marca = yield marca_model_1.default.findByPk(idmarca);
        if (!marca) {
            res.status(400).json({ msg: 'La marca no existe' });
            return;
        }
        // Crear nuevo producto
        const nuevoProducto = yield producto_model_1.default.create({
            nombre,
            imagen,
            idcategoria,
            idmarca,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el producto creado con sus relaciones
        const productoCreado = yield producto_model_1.default.findByPk(nuevoProducto.id, {
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
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Producto creado exitosamente',
            data: productoCreado
        });
    }
    catch (error) {
        console.error('Error en createProducto:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createProducto = createProducto;
// UPDATE - Actualizar producto (CORREGIDO)
const updateProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, imagen, idcategoria, idmarca } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del producto es obligatorio" });
            return;
        }
        const producto = yield producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: `No existe un producto con el id ${id}` });
            return;
        }
        // Validar si ya existe otro producto con la misma combinación
        if (nombre || imagen || idcategoria || idmarca) {
            const nombreToCheck = nombre || producto.nombre;
            const categoriaToCheck = idcategoria || producto.idcategoria;
            const marcaToCheck = idmarca || producto.idmarca;
            const existingProducto = yield producto_model_1.default.findOne({
                where: {
                    nombre: nombreToCheck,
                    idcategoria: categoriaToCheck,
                    idmarca: marcaToCheck
                }
            });
            // Si existe otro producto con la misma combinación y no es el mismo que estamos editando
            if (existingProducto && existingProducto.id !== parseInt(id)) {
                res.status(400).json({
                    msg: 'Ya existe otro producto con la misma combinación de nombre, categoría y marca'
                });
                return;
            }
        }
        // Verificar si existen las referencias
        if (idcategoria) {
            const categoria = yield categoria_model_1.default.findByPk(idcategoria);
            if (!categoria) {
                res.status(400).json({ msg: 'La categoría no existe' });
                return;
            }
        }
        if (idmarca) {
            const marca = yield marca_model_1.default.findByPk(idmarca);
            if (!marca) {
                res.status(400).json({ msg: 'La marca no existe' });
                return;
            }
        }
        // Actualizar campos
        if (nombre)
            producto.nombre = nombre;
        if (idcategoria)
            producto.idcategoria = idcategoria;
        if (idmarca)
            producto.idmarca = idmarca;
        if (imagen)
            producto.imagen = imagen;
        // Cambiar estado a ACTUALIZADO
        producto.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        yield producto.save();
        // Obtener el producto actualizado con relaciones
        const productoActualizado = yield producto_model_1.default.findByPk(id, {
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
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Producto actualizado con éxito",
            data: productoActualizado
        });
    }
    catch (error) {
        console.error("Error en updateProducto:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateProducto = updateProducto;
// READ - Verificar si existe un producto con la misma combinación
const verificarProductoCompleto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, idcategoria, idmarca } = req.params;
    try {
        if (!nombre || !idcategoria || !idmarca) {
            res.status(400).json({
                msg: 'Todos los parámetros (nombre, idcategoria, idmarca) son requeridos'
            });
            return;
        }
        const producto = yield producto_model_1.default.findOne({
            where: {
                nombre,
                idcategoria: parseInt(idcategoria),
                idmarca: parseInt(idmarca)
            },
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
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (producto) {
            res.json({
                msg: 'Ya existe un producto con esta combinación',
                existe: true,
                data: producto
            });
        }
        else {
            res.json({
                msg: 'No existe un producto con esta combinación',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarProductoCompleto:', error);
        res.status(500).json({ msg: 'Error al verificar la combinación del producto' });
    }
});
exports.verificarProductoCompleto = verificarProductoCompleto;
// READ - Listar todos los productos
const getProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield producto_model_1.default.findAll({
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
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de productos obtenida exitosamente',
            data: productos
        });
    }
    catch (error) {
        console.error('Error en getProductos:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de productos' });
    }
});
exports.getProductos = getProductos;
// READ - Listar productos registrados (no eliminados)
const getProductosRegistrados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield producto_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
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
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Productos registrados obtenidos exitosamente',
            data: productos
        });
    }
    catch (error) {
        console.error('Error en getProductosRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener productos registrados' });
    }
});
exports.getProductosRegistrados = getProductosRegistrados;
// READ - Obtener producto por ID
const getProductoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const producto = yield producto_model_1.default.findByPk(id, {
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
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!producto) {
            res.status(404).json({ msg: 'Producto no encontrado' });
            return;
        }
        res.json({
            msg: 'Producto obtenido exitosamente',
            data: producto
        });
    }
    catch (error) {
        console.error('Error en getProductoById:', error);
        res.status(500).json({ msg: 'Error al obtener el producto' });
    }
});
exports.getProductoById = getProductoById;
// DELETE - Eliminar producto (cambiar estado a eliminado)
const deleteProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const producto = yield producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: 'Producto no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        producto.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        yield producto.save();
        res.json({
            msg: 'Producto eliminado con éxito',
            data: { id: producto.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteProducto:', error);
        res.status(500).json({ msg: 'Error al eliminar el producto' });
    }
});
exports.deleteProducto = deleteProducto;
// READ - Listar productos eliminados
const getProductosEliminados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield producto_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
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
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Productos eliminados obtenidos exitosamente',
            data: productos
        });
    }
    catch (error) {
        console.error('Error in getProductosEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener productos eliminados' });
    }
});
exports.getProductosEliminados = getProductosEliminados;
// UPDATE - Restaurar producto eliminado
const restaurarProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const producto = yield producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: 'Producto no encontrado' });
            return;
        }
        // Cambiar estado to REGISTRADO
        producto.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        yield producto.save();
        res.json({
            msg: 'Producto restaurado con éxito',
            data: { id: producto.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarProducto:', error);
        res.status(500).json({ msg: 'Error al restaurar el producto' });
    }
});
exports.restaurarProducto = restaurarProducto;

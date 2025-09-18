"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarProductos = exports.restaurarProducto = exports.getProductosEliminados = exports.deleteProducto = exports.getProductoById = exports.getProductosRegistrados = exports.getProductos = exports.verificarProductoCompleto = exports.updateProducto = exports.createProducto = exports.actualizarProductoConImagen = exports.crearProductoConImagen = void 0;
const producto_model_1 = __importDefault(require("../models/producto.model"));
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const marca_model_1 = __importDefault(require("../models/marca.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Crear producto con imagen
const crearProductoConImagen = async (req, res) => {
    try {
        const { nombre, idcategoria, idmarca } = req.body;
        const file = req.file;
        // Validaciones
        if (!nombre || !idcategoria || !idmarca) {
            res.status(400).json({ msg: "Los campos nombre, idcategoria e idmarca son obligatorios" });
            return;
        }
        if (!file) {
            res.status(400).json({ msg: "La imagen es obligatoria" });
            return;
        }
        // Verificar duplicado (mismo nombre, misma categoría, misma marca y no eliminado)
        const existeProducto = await producto_model_1.default.findOne({
            where: {
                nombre,
                idcategoria,
                idmarca,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            }
        });
        if (existeProducto) {
            res.status(400).json({ msg: "Ya existe un producto con el mismo nombre, categoría y marca" });
            return;
        }
        // Verificar relaciones
        const categoria = await categoria_model_1.default.findByPk(idcategoria);
        if (!categoria) {
            res.status(400).json({ msg: "La categoría no existe" });
            return;
        }
        const marca = await marca_model_1.default.findByPk(idmarca);
        if (!marca) {
            res.status(400).json({ msg: "La marca no existe" });
            return;
        }
        // Ruta pública final de la imagen
        const imagePath = `${file.filename}`;
        // Crear producto
        const nuevoProducto = await producto_model_1.default.create({
            nombre,
            imagen: imagePath,
            idcategoria,
            idmarca,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO,
        });
        // Traer con relaciones
        const productoCreado = await producto_model_1.default.findByPk(nuevoProducto.id, {
            include: [
                { model: categoria_model_1.default, as: "Categoria", attributes: ["id", "nombre"] },
                { model: marca_model_1.default, as: "Marca", attributes: ["id", "nombre"] },
                { model: estado_model_1.default, as: "Estado", attributes: ["id", "nombre"] },
            ],
        });
        res.status(201).json({
            msg: "Producto creado con imagen exitosamente",
            data: productoCreado,
        });
    }
    catch (error) {
        console.error("Error en crearProductoConImagen:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.crearProductoConImagen = crearProductoConImagen;
// UPDATE - Actualizar producto con imagen opcional
const actualizarProductoConImagen = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, idcategoria, idmarca } = req.body;
        const file = req.file;
        if (!id) {
            res.status(400).json({ msg: "El ID del producto es obligatorio" });
            return;
        }
        const producto = await producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: `No existe un producto con el id ${id}` });
            return;
        }
        // Verificar duplicado (excluyendo el producto actual)
        if (nombre && nombre !== producto.nombre) {
            const existeProducto = await producto_model_1.default.findOne({
                where: {
                    nombre,
                    idcategoria: idcategoria || producto.idcategoria,
                    idmarca: idmarca || producto.idmarca,
                    id: { [sequelize_1.Op.ne]: id },
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
                }
            });
            if (existeProducto) {
                res.status(400).json({ msg: "Ya existe otro producto con el mismo nombre, categoría y marca" });
                return;
            }
        }
        // Verificar relaciones si se están actualizando
        if (idcategoria) {
            const categoria = await categoria_model_1.default.findByPk(idcategoria);
            if (!categoria) {
                res.status(400).json({ msg: "La categoría no existe" });
                return;
            }
        }
        if (idmarca) {
            const marca = await marca_model_1.default.findByPk(idmarca);
            if (!marca) {
                res.status(400).json({ msg: "La marca no existe" });
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
        // Actualizar imagen si se proporciona una nueva
        if (file) {
            producto.imagen = `${file.filename}`;
        }
        // Cambiar estado a ACTUALIZADO si no está eliminado
        if (producto.idestado !== estados_constans_1.EstadoGeneral.ELIMINADO) {
            producto.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        }
        await producto.save();
        // Obtener el producto actualizado con relaciones
        const productoActualizado = await producto_model_1.default.findByPk(id, {
            include: [
                { model: categoria_model_1.default, as: "Categoria", attributes: ["id", "nombre"] },
                { model: marca_model_1.default, as: "Marca", attributes: ["id", "nombre"] },
                { model: estado_model_1.default, as: "Estado", attributes: ["id", "nombre"] },
            ],
        });
        res.json({
            msg: "Producto actualizado con éxito",
            data: productoActualizado,
        });
    }
    catch (error) {
        console.error("Error en actualizarProductoConImagen:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.actualizarProductoConImagen = actualizarProductoConImagen;
// CREATE - Insertar nuevo producto
const createProducto = async (req, res) => {
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
        const existingProducto = await producto_model_1.default.findOne({
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
        const categoria = await categoria_model_1.default.findByPk(idcategoria);
        if (!categoria) {
            res.status(400).json({ msg: 'La categoría no existe' });
            return;
        }
        const marca = await marca_model_1.default.findByPk(idmarca);
        if (!marca) {
            res.status(400).json({ msg: 'La marca no existe' });
            return;
        }
        // Crear nuevo producto
        const nuevoProducto = await producto_model_1.default.create({
            nombre,
            imagen,
            idcategoria,
            idmarca,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el producto creado con sus relaciones
        const productoCreado = await producto_model_1.default.findByPk(nuevoProducto.id, {
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
};
exports.createProducto = createProducto;
// UPDATE - Actualizar producto (CORREGIDO)
const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, imagen, idcategoria, idmarca } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del producto es obligatorio" });
            return;
        }
        const producto = await producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: `No existe un producto con el id ${id}` });
            return;
        }
        // Validar si ya existe otro producto con la misma combinación
        if (nombre || imagen || idcategoria || idmarca) {
            const nombreToCheck = nombre || producto.nombre;
            const categoriaToCheck = idcategoria || producto.idcategoria;
            const marcaToCheck = idmarca || producto.idmarca;
            const existingProducto = await producto_model_1.default.findOne({
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
            const categoria = await categoria_model_1.default.findByPk(idcategoria);
            if (!categoria) {
                res.status(400).json({ msg: 'La categoría no existe' });
                return;
            }
        }
        if (idmarca) {
            const marca = await marca_model_1.default.findByPk(idmarca);
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
        await producto.save();
        // Obtener el producto actualizado con relaciones
        const productoActualizado = await producto_model_1.default.findByPk(id, {
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
};
exports.updateProducto = updateProducto;
// READ - Verificar si existe un producto con la misma combinación
const verificarProductoCompleto = async (req, res) => {
    const { nombre, idcategoria, idmarca } = req.params;
    try {
        if (!nombre || !idcategoria || !idmarca) {
            res.status(400).json({
                msg: 'Todos los parámetros (nombre, idcategoria, idmarca) son requeridos'
            });
            return;
        }
        const producto = await producto_model_1.default.findOne({
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
};
exports.verificarProductoCompleto = verificarProductoCompleto;
// READ - Listar todos los productos
const getProductos = async (req, res) => {
    try {
        const productos = await producto_model_1.default.findAll({
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
};
exports.getProductos = getProductos;
// READ - Listar productos registrados (no eliminados)
const getProductosRegistrados = async (req, res) => {
    try {
        const productos = await producto_model_1.default.findAll({
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
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
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
};
exports.getProductosRegistrados = getProductosRegistrados;
// READ - Obtener producto por ID
const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await producto_model_1.default.findByPk(id, {
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
};
exports.getProductoById = getProductoById;
// DELETE - Eliminar producto (cambiar estado a eliminado)
const deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: 'Producto no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        producto.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await producto.save();
        res.json({
            msg: 'Producto eliminado con éxito',
            data: { id: producto.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteProducto:', error);
        res.status(500).json({ msg: 'Error al eliminar el producto' });
    }
};
exports.deleteProducto = deleteProducto;
// READ - Listar productos eliminados
const getProductosEliminados = async (req, res) => {
    try {
        const productos = await producto_model_1.default.findAll({
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
};
exports.getProductosEliminados = getProductosEliminados;
// UPDATE - Restaurar producto eliminado
const restaurarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await producto_model_1.default.findByPk(id);
        if (!producto) {
            res.status(404).json({ msg: 'Producto no encontrado' });
            return;
        }
        // Cambiar estado to REGISTRADO
        producto.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await producto.save();
        res.json({
            msg: 'Producto restaurado con éxito',
            data: { id: producto.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarProducto:', error);
        res.status(500).json({ msg: 'Error al restaurar el producto' });
    }
};
exports.restaurarProducto = restaurarProducto;
// READ - Buscar productos para select/autocomplete
const buscarProductos = async (req, res) => {
    const qraw = req.query.q;
    const q = typeof qraw === "string" ? qraw.trim() : "";
    // Parámetros opcionales: limit (máx resultados)
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    try {
        if (!q) {
            res.status(400).json({ msg: "El parámetro q (búsqueda) es obligatorio" });
            return;
        }
        const like = `%${q}%`;
        const productos = await producto_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO],
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.like]: like } }
                ],
            },
            include: [
                {
                    model: categoria_model_1.default,
                    as: "Categoria",
                    attributes: ["id", "nombre"]
                },
                {
                    model: marca_model_1.default,
                    as: "Marca",
                    attributes: ["id", "nombre"]
                },
                {
                    model: estado_model_1.default,
                    as: "Estado",
                    attributes: ["id", "nombre"]
                }
            ],
            order: [["nombre", "ASC"]],
            limit, // ⬅️ limitar resultados
        });
        res.json({
            msg: "Resultados de búsqueda de productos obtenidos exitosamente",
            data: productos,
        });
    }
    catch (error) {
        console.error("Error en buscarProductos:", error);
        res.status(500).json({ msg: "Error al buscar productos" });
    }
};
exports.buscarProductos = buscarProductos;

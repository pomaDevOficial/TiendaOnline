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
exports.verificarNombreCategoria = exports.restaurarCategoria = exports.getCategoriasEliminadas = exports.deleteCategoria = exports.updateCategoria = exports.getCategoriaById = exports.getCategoriasRegistradas = exports.getCategorias = exports.createCategoria = void 0;
const categoria_model_1 = __importDefault(require("../models/categoria.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nueva categoría
const createCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.body;
    try {
        // Validaciones
        if (!nombre) {
            res.status(400).json({
                msg: 'El campo nombre es obligatorio'
            });
            return;
        }
        // Verificar si la categoría ya existe
        const existingCategoria = yield categoria_model_1.default.findOne({ where: { nombre } });
        if (existingCategoria) {
            res.status(400).json({ msg: 'La categoría ya existe' });
            return;
        }
        // Crear nueva categoría
        const nuevaCategoria = yield categoria_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener la categoría creada con su relación de estado
        const categoriaCreada = yield categoria_model_1.default.findByPk(nuevaCategoria.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Categoría creada exitosamente',
            data: categoriaCreada
        });
    }
    catch (error) {
        console.error('Error en createCategoria:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createCategoria = createCategoria;
// READ - Listar todas las categorías
const getCategorias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield categoria_model_1.default.findAll({
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de categorías obtenida exitosamente',
            data: categorias
        });
    }
    catch (error) {
        console.error('Error en getCategorias:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de categorías' });
    }
});
exports.getCategorias = getCategorias;
// READ - Listar categorías registradas (no eliminadas)
const getCategoriasRegistradas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield categoria_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Categorías registradas obtenidas exitosamente',
            data: categorias
        });
    }
    catch (error) {
        console.error('Error en getCategoriasRegistradas:', error);
        res.status(500).json({ msg: 'Error al obtener categorías registradas' });
    }
});
exports.getCategoriasRegistradas = getCategoriasRegistradas;
// READ - Obtener categoría por ID
const getCategoriaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const categoria = yield categoria_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!categoria) {
            res.status(404).json({ msg: 'Categoría no encontrada' });
            return;
        }
        res.json({
            msg: 'Categoría obtenida exitosamente',
            data: categoria
        });
    }
    catch (error) {
        console.error('Error en getCategoriaById:', error);
        res.status(500).json({ msg: 'Error al obtener la categoría' });
    }
});
exports.getCategoriaById = getCategoriaById;
// UPDATE - Actualizar categoría
const updateCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la categoría es obligatorio" });
            return;
        }
        const categoria = yield categoria_model_1.default.findByPk(id);
        if (!categoria) {
            res.status(404).json({ msg: `No existe una categoría con el id ${id}` });
            return;
        }
        // Validar nombre único
        if (nombre && nombre !== categoria.nombre) {
            const existingCategoria = yield categoria_model_1.default.findOne({ where: { nombre } });
            if (existingCategoria && existingCategoria.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre de la categoría ya está en uso' });
                return;
            }
        }
        // Actualizar campo nombre
        if (nombre)
            categoria.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        categoria.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        yield categoria.save();
        // Obtener la categoría actualizada con relación de estado
        const categoriaActualizada = yield categoria_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Categoría actualizada con éxito",
            data: categoriaActualizada
        });
    }
    catch (error) {
        console.error("Error en updateCategoria:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updateCategoria = updateCategoria;
// DELETE - Eliminar categoría (cambiar estado a eliminado)
const deleteCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const categoria = yield categoria_model_1.default.findByPk(id);
        if (!categoria) {
            res.status(404).json({ msg: 'Categoría no encontrada' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        categoria.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        yield categoria.save();
        res.json({
            msg: 'Categoría eliminada con éxito',
            data: { id: categoria.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteCategoria:', error);
        res.status(500).json({ msg: 'Error al eliminar la categoría' });
    }
});
exports.deleteCategoria = deleteCategoria;
// READ - Listar categorías eliminadas
const getCategoriasEliminadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield categoria_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Categorías eliminadas obtenidas exitosamente',
            data: categorias
        });
    }
    catch (error) {
        console.error('Error en getCategoriasEliminadas:', error);
        res.status(500).json({ msg: 'Error al obtener categorías eliminadas' });
    }
});
exports.getCategoriasEliminadas = getCategoriasEliminadas;
// UPDATE - Restaurar categoría eliminada
const restaurarCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const categoria = yield categoria_model_1.default.findByPk(id);
        if (!categoria) {
            res.status(404).json({ msg: 'Categoría no encontrada' });
            return;
        }
        // Cambiar estado a REGISTRADO
        categoria.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        yield categoria.save();
        res.json({
            msg: 'Categoría restaurada con éxito',
            data: { id: categoria.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarCategoria:', error);
        res.status(500).json({ msg: 'Error al restaurar la categoría' });
    }
});
exports.restaurarCategoria = restaurarCategoria;
// READ - Verificar si existe una categoría con el nombre
const verificarNombreCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.params;
    try {
        if (!nombre) {
            res.status(400).json({
                msg: 'El nombre de la categoría es requerido'
            });
            return;
        }
        const categoria = yield categoria_model_1.default.findOne({
            where: { nombre },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (categoria) {
            res.json({
                msg: 'El nombre de la categoría ya existe',
                existe: true,
                data: categoria
            });
        }
        else {
            res.json({
                msg: 'El nombre de la categoría está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarNombreCategoria:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre de la categoría' });
    }
});
exports.verificarNombreCategoria = verificarNombreCategoria;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarNombreMarca = exports.restaurarMarca = exports.getMarcasEliminadas = exports.deleteMarca = exports.updateMarca = exports.getMarcaById = exports.getMarcasRegistradas = exports.getMarcas = exports.createMarca = void 0;
const marca_model_1 = __importDefault(require("../models/marca.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nueva marca
const createMarca = async (req, res) => {
    const { nombre } = req.body;
    try {
        // Validaciones
        if (!nombre) {
            res.status(400).json({
                msg: 'El campo nombre es obligatorio'
            });
            return;
        }
        // Verificar si la marca ya existe
        const existingMarca = await marca_model_1.default.findOne({ where: { nombre } });
        if (existingMarca) {
            res.status(400).json({ msg: 'La marca ya existe' });
            return;
        }
        // Crear nueva marca
        const nuevaMarca = await marca_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener la marca creada con su relación de estado
        const marcaCreada = await marca_model_1.default.findByPk(nuevaMarca.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Marca creada exitosamente',
            data: marcaCreada
        });
    }
    catch (error) {
        console.error('Error en createMarca:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createMarca = createMarca;
// READ - Listar todas las marcas
const getMarcas = async (req, res) => {
    try {
        const marcas = await marca_model_1.default.findAll({
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
            order: [['id', 'DESC']]
        });
        res.json({
            msg: 'Lista de marcas obtenida exitosamente',
            data: marcas
        });
    }
    catch (error) {
        console.error('Error en getMarcas:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de marcas' });
    }
};
exports.getMarcas = getMarcas;
// READ - Listar marcas registradas (no eliminadas)
const getMarcasRegistradas = async (req, res) => {
    try {
        const marcas = await marca_model_1.default.findAll({
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
            msg: 'Marcas registradas obtenidas exitosamente',
            data: marcas
        });
    }
    catch (error) {
        console.error('Error en getMarcasRegistradas:', error);
        res.status(500).json({ msg: 'Error al obtener marcas registradas' });
    }
};
exports.getMarcasRegistradas = getMarcasRegistradas;
// READ - Obtener marca por ID
const getMarcaById = async (req, res) => {
    const { id } = req.params;
    try {
        const marca = await marca_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }
        res.json({
            msg: 'Marca obtenida exitosamente',
            data: marca
        });
    }
    catch (error) {
        console.error('Error en getMarcaById:', error);
        res.status(500).json({ msg: 'Error al obtener la marca' });
    }
};
exports.getMarcaById = getMarcaById;
// UPDATE - Actualizar marca
const updateMarca = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la marca es obligatorio" });
            return;
        }
        const marca = await marca_model_1.default.findByPk(id);
        if (!marca) {
            res.status(404).json({ msg: `No existe una marca con el id ${id}` });
            return;
        }
        // Validar nombre único
        if (nombre && nombre !== marca.nombre) {
            const existingMarca = await marca_model_1.default.findOne({ where: { nombre } });
            if (existingMarca && existingMarca.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El nombre de la marca ya está en uso' });
                return;
            }
        }
        // Actualizar campo nombre
        if (nombre)
            marca.nombre = nombre;
        // Cambiar estado a ACTUALIZADO
        marca.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await marca.save();
        // Obtener la marca actualizada con relación de estado
        const marcaActualizada = await marca_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Marca actualizada con éxito",
            data: marcaActualizada
        });
    }
    catch (error) {
        console.error("Error en updateMarca:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateMarca = updateMarca;
// DELETE - Eliminar marca (cambiar estado a eliminado)
const deleteMarca = async (req, res) => {
    const { id } = req.params;
    try {
        const marca = await marca_model_1.default.findByPk(id);
        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        marca.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await marca.save();
        res.json({
            msg: 'Marca eliminada con éxito',
            data: { id: marca.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteMarca:', error);
        res.status(500).json({ msg: 'Error al eliminar la marca' });
    }
};
exports.deleteMarca = deleteMarca;
// READ - Listar marcas eliminadas
const getMarcasEliminadas = async (req, res) => {
    try {
        const marcas = await marca_model_1.default.findAll({
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
            msg: 'Marcas eliminadas obtenidas exitosamente',
            data: marcas
        });
    }
    catch (error) {
        console.error('Error en getMarcasEliminadas:', error);
        res.status(500).json({ msg: 'Error al obtener marcas eliminadas' });
    }
};
exports.getMarcasEliminadas = getMarcasEliminadas;
// UPDATE - Restaurar marca eliminada
const restaurarMarca = async (req, res) => {
    const { id } = req.params;
    try {
        const marca = await marca_model_1.default.findByPk(id);
        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }
        // Cambiar estado a REGISTRADO
        marca.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        await marca.save();
        res.json({
            msg: 'Marca restaurada con éxito',
            data: { id: marca.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarMarca:', error);
        res.status(500).json({ msg: 'Error al restaurar la marca' });
    }
};
exports.restaurarMarca = restaurarMarca;
// READ - Verificar si existe una marca con el nombre
const verificarNombreMarca = async (req, res) => {
    const { nombre } = req.params;
    try {
        if (!nombre) {
            res.status(400).json({
                msg: 'El nombre de la marca es requerido'
            });
            return;
        }
        const marca = await marca_model_1.default.findOne({
            where: { nombre },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (marca) {
            res.json({
                msg: 'El nombre de la marca ya existe',
                existe: true,
                data: marca
            });
        }
        else {
            res.json({
                msg: 'El nombre de la marca está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarNombreMarca:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre de la marca' });
    }
};
exports.verificarNombreMarca = verificarNombreMarca;

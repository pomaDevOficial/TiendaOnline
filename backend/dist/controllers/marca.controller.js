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
exports.deleteMarca = exports.updateMarca = exports.getMarcaById = exports.getMarcas = exports.createMarca = void 0;
const marca_model_1 = __importDefault(require("../models/marca.model")); // Importamos el modelo Marca
// Crear una nueva marca
const createMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.body;
    try {
        // Verificar si ya existe una marca con el mismo nombre
        const existingMarca = yield marca_model_1.default.findOne({ where: { nombre } });
        if (existingMarca) {
            res.status(400).json({ msg: 'Ya existe una marca con ese nombre' });
            return;
        }
        // Crear la nueva marca
        const nuevaMarca = yield marca_model_1.default.create({
            nombre
        });
        res.status(201).json(nuevaMarca);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createMarca = createMarca;
// Obtener todas las marcas
const getMarcas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const marcas = yield marca_model_1.default.findAll();
        res.json(marcas);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las marcas' });
    }
});
exports.getMarcas = getMarcas;
// Obtener una marca por ID
const getMarcaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idMarca } = req.params; // Extraemos id de los parámetros
    try {
        const marca = yield marca_model_1.default.findByPk(idMarca); // Buscar marca por ID
        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }
        res.json(marca);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la marca' });
    }
});
exports.getMarcaById = getMarcaById;
// Actualizar una marca
const updateMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idMarca } = req.params; // Extraemos id de los parámetros
    const { nombre } = req.body;
    try {
        // Buscar marca por ID
        const marca = yield marca_model_1.default.findByPk(idMarca);
        if (!marca) {
            res.status(404).json({ msg: `No existe una marca con el id ${idMarca}` });
            return;
        }
        // Verificar si el nombre ya existe, excluyendo la marca actual
        const existingMarca = yield marca_model_1.default.findOne({ where: { nombre, id: { $ne: idMarca } } });
        if (existingMarca) {
            res.status(400).json({ msg: 'Ya existe una marca con ese nombre' });
            return;
        }
        // Actualizar los campos proporcionados
        if (nombre)
            marca.nombre = nombre;
        yield marca.save(); // Guardar los cambios
        res.json({ msg: 'La marca fue actualizada con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.updateMarca = updateMarca;
// Eliminar una marca
const deleteMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idMarca } = req.params; // Extraemos id de los parámetros
    try {
        // Buscar marca por ID
        const marca = yield marca_model_1.default.findByPk(idMarca);
        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }
        yield marca.destroy(); // Eliminar la marca
        res.json({ msg: 'Marca eliminada con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar la marca' });
    }
});
exports.deleteMarca = deleteMarca;

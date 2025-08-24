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
exports.deleteTiposerie = exports.updateTiposerie = exports.getTiposerieById = exports.getTiposeries = exports.createTiposerie = void 0;
const tiposerie_model_1 = __importDefault(require("../models/tiposerie.model"));
const sequelize_1 = require("sequelize");
// Crear un nuevo tipo de serie
const createTiposerie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion } = req.body;
    // Validación de la descripción
    if (!descripcion || descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción del tipo de serie es obligatoria" });
        return;
    }
    try {
        // Verificar si ya existe un tipo de serie con la misma descripción
        const tiposerieExiste = yield tiposerie_model_1.default.findOne({ where: { descripcion } });
        if (tiposerieExiste) {
            res.status(400).json({ msg: 'El tipo de serie ya existe' });
            return;
        }
        const nuevaTiposerie = yield tiposerie_model_1.default.create({
            descripcion,
        });
        res.status(201).json(nuevaTiposerie);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear el tipo de serie' });
    }
});
exports.createTiposerie = createTiposerie;
// Obtener todos los tipos de serie
const getTiposeries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tiposeries = yield tiposerie_model_1.default.findAll();
        res.json(tiposeries);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los tipos de serie' });
    }
});
exports.getTiposeries = getTiposeries;
// Obtener un tipo de serie por su ID
const getTiposerieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTiposerie } = req.params;
    try {
        const tiposerie = yield tiposerie_model_1.default.findByPk(idTiposerie);
        if (!tiposerie) {
            res.status(404).json({ msg: 'Tipo de serie no encontrado' });
            return;
        }
        res.json(tiposerie);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el tipo de serie' });
    }
});
exports.getTiposerieById = getTiposerieById;
// Actualizar un tipo de serie
const updateTiposerie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTiposerie } = req.params;
    const { descripcion } = req.body;
    // Validación de la descripción
    if (!descripcion || descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción del tipo de serie es obligatoria" });
        return;
    }
    try {
        const tiposerie = yield tiposerie_model_1.default.findByPk(idTiposerie);
        if (!tiposerie) {
            res.status(404).json({ msg: `No existe un tipo de serie con el id ${idTiposerie}` });
            return;
        }
        // Verificar si ya existe otro tipo de serie con la misma descripción, excepto el que estamos actualizando
        const tiposerieExiste = yield tiposerie_model_1.default.findOne({
            where: { descripcion, id: { [sequelize_1.Op.ne]: idTiposerie } }
        });
        if (tiposerieExiste) {
            res.status(400).json({ msg: 'Ya existe un tipo de serie con esta descripción' });
            return;
        }
        // Actualizar el tipo de serie con los campos proporcionados en la solicitud
        tiposerie.descripcion = descripcion;
        yield tiposerie.save();
        res.json({ msg: 'El tipo de serie fue actualizado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el tipo de serie' });
    }
});
exports.updateTiposerie = updateTiposerie;
// Eliminar un tipo de serie
const deleteTiposerie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTiposerie } = req.params;
    try {
        const tiposerie = yield tiposerie_model_1.default.findByPk(idTiposerie);
        if (!tiposerie) {
            res.status(404).json({ msg: 'Tipo de serie no encontrado' });
            return;
        }
        yield tiposerie.destroy();
        res.json({ msg: 'Tipo de serie eliminado correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar el tipo de serie' });
    }
});
exports.deleteTiposerie = deleteTiposerie;

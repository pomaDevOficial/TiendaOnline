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
exports.deleteUnidadMedida = exports.updateUnidadMedida = exports.getUnidadMedidaById = exports.getUnidadesMedida = exports.createUnidadMedida = void 0;
const unidadmedida_model_1 = __importDefault(require("../models/unidadmedida.model"));
const sequelize_1 = require("sequelize");
// Crear una nueva unidad de medida
const createUnidadMedida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion } = req.body;
    // Validación de la descripción
    if (!descripcion || descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción de la unidad de medida es obligatoria" });
        return;
    }
    try {
        // Verificar si ya existe una unidad de medida con la misma descripción
        const unidadMedidaExiste = yield unidadmedida_model_1.default.findOne({ where: { descripcion } });
        if (unidadMedidaExiste) {
            res.status(400).json({ msg: 'La unidad de medida ya existe' });
            return;
        }
        const nuevaUnidadMedida = yield unidadmedida_model_1.default.create({
            descripcion,
        });
        res.status(201).json(nuevaUnidadMedida);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear la unidad de medida' });
    }
});
exports.createUnidadMedida = createUnidadMedida;
// Obtener todas las unidades de medida
const getUnidadesMedida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unidadesMedida = yield unidadmedida_model_1.default.findAll();
        res.json(unidadesMedida);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener las unidades de medida' });
    }
});
exports.getUnidadesMedida = getUnidadesMedida;
// Obtener una unidad de medida por su ID
const getUnidadMedidaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idUnidadMedida } = req.params;
    try {
        const unidadMedida = yield unidadmedida_model_1.default.findByPk(idUnidadMedida);
        if (!unidadMedida) {
            res.status(404).json({ msg: 'Unidad de medida no encontrada' });
            return;
        }
        res.json(unidadMedida);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la unidad de medida' });
    }
});
exports.getUnidadMedidaById = getUnidadMedidaById;
// Actualizar una unidad de medida
const updateUnidadMedida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { idUnidadMedida } = req.params;
    // Validación de la descripción
    if (body.descripcion && body.descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción de la unidad de medida es obligatoria" });
        return;
    }
    try {
        const unidadMedida = yield unidadmedida_model_1.default.findByPk(idUnidadMedida);
        if (!unidadMedida) {
            res.status(404).json({ msg: `No existe una unidad de medida con el id ${idUnidadMedida}` });
            return;
        }
        // Verificar si ya existe otra unidad de medida con la misma descripción (excepto la actual)
        if (body.descripcion) {
            const unidadMedidaExiste = yield unidadmedida_model_1.default.findOne({
                where: { descripcion: body.descripcion, id: { [sequelize_1.Op.ne]: idUnidadMedida } }
            });
            if (unidadMedidaExiste) {
                res.status(400).json({ msg: 'Ya existe una unidad de medida con esta descripción' });
                return;
            }
        }
        // Actualizar la unidad de medida con los campos proporcionados en la solicitud
        yield unidadMedida.update(body);
        res.json({ msg: 'La unidad de medida fue actualizada con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar la unidad de medida' });
    }
});
exports.updateUnidadMedida = updateUnidadMedida;
// Eliminar una unidad de medida
const deleteUnidadMedida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idUnidadMedida } = req.params;
    try {
        const unidadMedida = yield unidadmedida_model_1.default.findByPk(idUnidadMedida);
        if (!unidadMedida) {
            res.status(404).json({ msg: 'Unidad de medida no encontrada' });
            return;
        }
        yield unidadMedida.destroy();
        res.json({ msg: 'Unidad de medida eliminada correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar la unidad de medida' });
    }
});
exports.deleteUnidadMedida = deleteUnidadMedida;

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
exports.deleteTipoComprobante = exports.updateTipoComprobante = exports.getTipoComprobanteById = exports.getTipoComprobantes = exports.createTipoComprobante = void 0;
const tipocomprobante_model_1 = __importDefault(require("../models/tipocomprobante.model"));
const tiposerie_model_1 = __importDefault(require("../models/tiposerie.model"));
// Crear un nuevo tipo de comprobante
const createTipoComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion, id_tiposerie } = req.body;
    // Validación de la descripcion
    if (!descripcion || descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción del tipo de comprobante es obligatoria" });
        return;
    }
    try {
        // Verificar si ya existe un tipo de comprobante con la misma descripcion
        const tipoComprobanteExiste = yield tipocomprobante_model_1.default.findOne({ where: { descripcion } });
        if (tipoComprobanteExiste) {
            res.status(400).json({ msg: "Ya existe un tipo de comprobante con esta descripción" });
            return;
        }
        // Crear el nuevo tipo de comprobante
        const nuevoTipoComprobante = yield tipocomprobante_model_1.default.create({
            descripcion,
            id_tiposerie
        });
        res.status(201).json(nuevoTipoComprobante);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createTipoComprobante = createTipoComprobante;
// Obtener todos los tipos de comprobantes
const getTipoComprobantes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tipoComprobantes = yield tipocomprobante_model_1.default.findAll({
            include: [
                { model: tiposerie_model_1.default, as: 'TipoSerie' }
            ],
        });
        res.json(tipoComprobantes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la lista de tipos de comprobantes' });
    }
});
exports.getTipoComprobantes = getTipoComprobantes;
// Obtener un tipo de comprobante por su ID
const getTipoComprobanteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTipoComprobante } = req.params;
    try {
        const tipoComprobante = yield tipocomprobante_model_1.default.findByPk(idTipoComprobante, {
            include: [
                { model: tiposerie_model_1.default, as: 'TipoSerie' }
            ],
        });
        if (!tipoComprobante) {
            res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
            return;
        }
        res.json(tipoComprobante);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el tipo de comprobante' });
    }
});
exports.getTipoComprobanteById = getTipoComprobanteById;
// Actualizar un tipo de comprobante
const updateTipoComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTipoComprobante } = req.params;
    const { descripcion, id_tiposerie } = req.body;
    // Validación de la descripcion
    if (!descripcion || descripcion.trim() === "") {
        res.status(400).json({ msg: "La descripción del tipo de comprobante es obligatoria" });
        return;
    }
    try {
        const tipoComprobante = yield tipocomprobante_model_1.default.findByPk(idTipoComprobante);
        if (!tipoComprobante) {
            res.status(404).json({ msg: `No existe un tipo de comprobante con el id ${idTipoComprobante}` });
            return;
        }
        // Verificar si ya existe otro tipo de comprobante con la misma descripción, excepto el que estamos actualizando
        const tipoComprobanteExiste = yield tipocomprobante_model_1.default.findOne({
            where: { descripcion, id: { $ne: idTipoComprobante } }
        });
        if (tipoComprobanteExiste) {
            res.status(400).json({ msg: "Ya existe un tipo de comprobante con esta descripción" });
            return;
        }
        // Actualizar el tipo de comprobante con los campos proporcionados en la solicitud
        if (descripcion)
            tipoComprobante.descripcion = descripcion;
        if (id_tiposerie)
            tipoComprobante.id_tiposerie = id_tiposerie;
        yield tipoComprobante.save();
        res.json({ msg: 'El tipo de comprobante fue actualizado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.updateTipoComprobante = updateTipoComprobante;
// Eliminar un tipo de comprobante
const deleteTipoComprobante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTipoComprobante } = req.params;
    try {
        const tipoComprobante = yield tipocomprobante_model_1.default.findByPk(idTipoComprobante);
        if (!tipoComprobante) {
            res.status(404).json({ msg: 'Tipo de comprobante no encontrado' });
            return;
        }
        yield tipoComprobante.destroy();
        res.json({ msg: 'Tipo de comprobante eliminado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el tipo de comprobante' });
    }
});
exports.deleteTipoComprobante = deleteTipoComprobante;

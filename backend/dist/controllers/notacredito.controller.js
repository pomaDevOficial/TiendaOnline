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
exports.deleteNotaCredito = exports.updateNotaCredito = exports.getNotaCreditoById = exports.getNotasCredito = exports.createNotaCredito = void 0;
const notacredito_model_1 = __importDefault(require("../models/notacredito.model"));
// Crear una nueva nota de crédito
const createNotaCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion } = req.body;
    if (!descripcion || descripcion.trim().length === 0) {
        res.status(400).json({ msg: 'La descripción es obligatoria' });
        return;
    }
    try {
        // Usamos findOrCreate para intentar crear solo si no existe
        const [notaCredito, created] = yield notacredito_model_1.default.findOrCreate({
            where: { descripcion },
            defaults: { descripcion }
        });
        if (!created) {
            res.status(400).json({ msg: 'La nota de crédito ya existe' });
            return;
        }
        res.status(201).json(notaCredito);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear la nota de crédito' });
    }
});
exports.createNotaCredito = createNotaCredito;
// Obtener todas las notas de crédito
const getNotasCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notasCredito = yield notacredito_model_1.default.findAll();
        res.json(notasCredito);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener las notas de crédito' });
    }
});
exports.getNotasCredito = getNotasCredito;
// Obtener una nota de crédito por ID
const getNotaCreditoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idNotaCredito } = req.params;
    try {
        const notaCredito = yield notacredito_model_1.default.findByPk(idNotaCredito);
        if (!notaCredito) {
            res.status(404).json({ msg: 'Nota de crédito no encontrada' });
            return;
        }
        res.json(notaCredito);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la nota de crédito' });
    }
});
exports.getNotaCreditoById = getNotaCreditoById;
// Actualizar una nota de crédito
const updateNotaCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idNotaCredito } = req.params;
    const { descripcion } = req.body;
    if (!descripcion || descripcion.trim().length === 0) {
        res.status(400).json({ msg: 'La descripción es obligatoria' });
        return;
    }
    try {
        const notaCredito = yield notacredito_model_1.default.findByPk(idNotaCredito);
        if (!notaCredito) {
            res.status(404).json({ msg: `No existe una nota de crédito con el id ${idNotaCredito}` });
            return;
        }
        // Actualizar la descripción (o cualquier otro campo)
        yield notaCredito.update({ descripcion });
        res.json({ msg: 'La nota de crédito fue actualizada con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar la nota de crédito' });
    }
});
exports.updateNotaCredito = updateNotaCredito;
// Eliminar una nota de crédito
const deleteNotaCredito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idNotaCredito } = req.params;
    try {
        const notaCredito = yield notacredito_model_1.default.findByPk(idNotaCredito);
        if (!notaCredito) {
            res.status(404).json({ msg: 'Nota de crédito no encontrada' });
            return;
        }
        yield notaCredito.destroy();
        res.json({ msg: 'Nota de crédito eliminada correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar la nota de crédito' });
    }
});
exports.deleteNotaCredito = deleteNotaCredito;

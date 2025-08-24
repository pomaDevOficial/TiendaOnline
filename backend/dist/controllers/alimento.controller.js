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
exports.deleteAlimento = exports.updateAliemnto = exports.getAlimentoById = exports.getAlimentos = exports.createAlimento = void 0;
const alimento_model_1 = __importDefault(require("../models/alimento.model"));
const createAlimento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, marca, tipo } = req.body;
    try {
        const alimentoExiste = yield alimento_model_1.default.findOne({ where: { nombre, marca, tipo } });
        if (alimentoExiste) {
            res.status(400).json({ msg: 'El alimento ya existe' });
            return;
        }
        const nuevoAlimento = yield alimento_model_1.default.create({
            nombre,
            marca,
            tipo,
        });
        res.status(201).json(nuevoAlimento);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear el alimento' });
    }
});
exports.createAlimento = createAlimento;
const getAlimentos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alimentos = yield alimento_model_1.default.findAll();
        res.json(alimentos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los alimentos' });
    }
});
exports.getAlimentos = getAlimentos;
const getAlimentoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idAlimento } = req.params;
    try {
        const alimento = yield alimento_model_1.default.findByPk(idAlimento);
        if (!alimento) {
            res.status(404).json({ msg: 'Alimento no encontrado' });
            return;
        }
        else {
            res.json(alimento);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el alimento' });
    }
});
exports.getAlimentoById = getAlimentoById;
const updateAliemnto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { idAlimento } = req.params;
    try {
        const alimento = yield alimento_model_1.default.findByPk(idAlimento);
        if (alimento) {
            yield alimento.update(body);
            res.json({ msg: 'El alimento fue actualizado con éxito' });
        }
        else {
            res.status(404).json({ msg: `No existe un alimento con el id ${idAlimento}` });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el alimento' });
    }
});
exports.updateAliemnto = updateAliemnto;
const deleteAlimento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idAlimento } = req.params;
    try {
        const alimento = yield alimento_model_1.default.findByPk(idAlimento);
        if (alimento) {
            yield alimento.destroy();
            res.json({ msg: 'Alimento eliminado correctamente' });
        }
        else {
            res.status(404).json({ msg: 'Alimento no encontrado' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar el alimento' });
    }
});
exports.deleteAlimento = deleteAlimento;

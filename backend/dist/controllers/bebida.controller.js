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
exports.deleteBebida = exports.updateBebida = exports.getBebidaById = exports.getBebidas = exports.createBebida = void 0;
const bebida_model_1 = __importDefault(require("../models/bebida.model"));
const createBebida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, marca, sabor, alcohol, fecha_vencimiento } = req.body;
    try {
        const bebidaExiste = yield bebida_model_1.default.findOne({ where: { nombre, marca, sabor, alcohol, fecha_vencimiento } });
        if (bebidaExiste) {
            res.status(400).json({ msg: 'La bebida ya existe' });
            return;
        }
        const nuevaBebida = yield bebida_model_1.default.create({
            nombre,
            marca,
            sabor,
            alcohol,
            fecha_vencimiento,
        });
        res.status(201).json(nuevaBebida);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al crear la bebida' });
    }
});
exports.createBebida = createBebida;
const getBebidas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bebidas = yield bebida_model_1.default.findAll();
        res.json(bebidas);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener las bebidas' });
    }
});
exports.getBebidas = getBebidas;
const getBebidaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idBebida } = req.params;
    try {
        const bebida = yield bebida_model_1.default.findByPk(idBebida);
        if (!bebida) {
            res.status(404).json({ msg: 'Bebida no encontrada' });
            return;
        }
        else {
            res.json(bebida);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la bebida' });
    }
});
exports.getBebidaById = getBebidaById;
const updateBebida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { idBebida } = req.params;
    try {
        const bebida = yield bebida_model_1.default.findByPk(idBebida);
        if (bebida) {
            yield bebida.update(body);
            res.json({ msg: 'La bebida fue actualizada con éxito' });
        }
        else {
            res.status(404).json({ msg: `No existe una bebida con el id ${idBebida}` });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar la bebida' });
    }
});
exports.updateBebida = updateBebida;
const deleteBebida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idBebida } = req.params;
    try {
        const bebida = yield bebida_model_1.default.findByPk(idBebida);
        if (bebida) {
            yield bebida.destroy();
            res.json({ msg: 'Bebida eliminada correctamente' });
        }
        else {
            res.status(404).json({ msg: 'Bebida no encontrada' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar la bebida' });
    }
});
exports.deleteBebida = deleteBebida;

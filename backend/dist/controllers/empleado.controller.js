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
exports.searchEmpleados = exports.activarEmpleado = exports.deleteEmpleado = exports.updateEmpleado = exports.getEmpleadoById = exports.getEmpleados = exports.createEmpleado = void 0;
const empleado_model_1 = __importDefault(require("../models/empleado.model"));
const sequelize_1 = require("sequelize");
const createEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, dni, direccion, telefono, correo, fecha_nacimiento, fecha_contratacion, genero, estado } = req.body;
    try {
        // Construir condiciones dinámicamente
        let condiciones = {};
        if (dni && dni !== null) {
            condiciones.dni = dni;
        }
        else {
            res.status(400).json({ msg: 'Debe proporcionar DNI' });
            return;
        }
        // Verificar si ya existe un empleado con el mismo DNI
        const empleadoExistente = yield empleado_model_1.default.findOne({
            where: condiciones
        });
        if (empleadoExistente) {
            res.status(400).json({ msg: 'Ya existe un empleado con el mismo DNI' });
            return;
        }
        // Crear el nuevo empleado
        const nuevoEmpleado = yield empleado_model_1.default.create({
            nombre,
            apellido,
            dni,
            direccion,
            telefono,
            correo,
            fecha_nacimiento,
            fecha_contratacion,
            genero,
            estado
        });
        // Devolver el nuevo empleado creado
        res.status(201).json(nuevoEmpleado);
    }
    catch (error) {
        console.error('Error al crear el empleado:', error);
        res.status(500).json({ msg: 'Ocurrió un error al crear el empleado' });
    }
});
exports.createEmpleado = createEmpleado;
const getEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const empleados = yield empleado_model_1.default.findAll();
        res.json(empleados);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la lista de empleados' });
    }
});
exports.getEmpleados = getEmpleados;
const getEmpleadoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpleado } = req.params;
    try {
        const empleado = yield empleado_model_1.default.findByPk(idEmpleado);
        if (!empleado) {
            res.status(404).json({ msg: 'Empleado no encontrado' });
        }
        else {
            res.json(empleado);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el empleado' });
    }
});
exports.getEmpleadoById = getEmpleadoById;
const updateEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { idEmpleado } = req.params;
    try {
        const empleado = yield empleado_model_1.default.findByPk(idEmpleado);
        if (empleado) {
            yield empleado.update(body);
            res.json({ msg: 'El empleado fue actualizado con éxito' });
        }
        else {
            res.status(404).json({ msg: `No existe un empleado con el id ${idEmpleado}` });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el empleado' });
    }
});
exports.updateEmpleado = updateEmpleado;
const deleteEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpleado } = req.params;
    try {
        const empleado = yield empleado_model_1.default.findByPk(idEmpleado);
        if (!empleado) {
            res.status(404).json({ msg: 'Empleado no encontrado' });
        }
        empleado.estado = 'inactivo'; // Soft delete
        yield empleado.save();
        res.json({ msg: 'Empleado desactivado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al desactivar el empleado' });
    }
});
exports.deleteEmpleado = deleteEmpleado;
const activarEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpleado } = req.params;
    try {
        const empleado = yield empleado_model_1.default.findByPk(idEmpleado);
        if (!empleado) {
            res.status(404).json({ msg: 'Empleado no encontrado' });
            return;
        }
        empleado.estado = 'activo'; // Soft delete
        yield empleado.save();
        res.json({ msg: 'Empleado activado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al activar el empleado' });
    }
});
exports.activarEmpleado = activarEmpleado;
const searchEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    try {
        const empleados = yield empleado_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { apellido: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { direccion: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { dni: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { telefono: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { correo: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                ],
            },
        });
        if (empleados.length === 0) {
            // No se encontraron empleados
            res.status(404).json({ msg: 'No se encontraron empleados que coincidan con el término de búsqueda' });
        }
        else {
            // Se encontraron empleados
            res.json(empleados);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al realizar la búsqueda de empleados' });
    }
});
exports.searchEmpleados = searchEmpleados;

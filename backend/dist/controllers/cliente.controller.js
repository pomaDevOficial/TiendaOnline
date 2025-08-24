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
exports.searchClientes = exports.deleteCliente = exports.updateCliente = exports.getClienteById = exports.getClientes = exports.createCliente = void 0;
const cliente_model_1 = __importDefault(require("../models/cliente.model"));
const sequelize_1 = require("sequelize"); // Asegúrate de tener este importado
// Crear un cliente
const createCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, direccion, dni, ruc, razon_social, telefono, rubro } = req.body;
    try {
        // Validar que al menos uno de DNI o RUC esté presente
        if (!dni && !ruc) {
            res.status(400).json({ msg: 'Debe proporcionar al menos DNI o RUC' });
            return;
        }
        // Condiciones para verificar si el cliente existe
        const condiciones = {};
        if (dni)
            condiciones.dni = dni;
        if (ruc)
            condiciones.ruc = ruc;
        // Verificar si ya existe un cliente con el mismo DNI o RUC
        const clienteExistente = yield cliente_model_1.default.findOne({
            where: condiciones,
        });
        if (clienteExistente) {
            res.status(400).json({ msg: 'Ya existe un cliente con el mismo DNI o RUC' });
            return;
        }
        // Crear el nuevo cliente
        const nuevoCliente = yield cliente_model_1.default.create({
            nombre,
            apellido,
            direccion,
            dni,
            ruc,
            razon_social,
            telefono,
            rubro
        });
        res.status(201).json(nuevoCliente);
    }
    catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ msg: 'Ocurrió un error al crear el cliente' });
    }
});
exports.createCliente = createCliente;
// Obtener todos los clientes
const getClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield cliente_model_1.default.findAll();
        res.json(clientes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la lista de clientes' });
    }
});
exports.getClientes = getClientes;
// Obtener un cliente por ID
const getClienteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idCliente } = req.params;
    try {
        const cliente = yield cliente_model_1.default.findByPk(idCliente);
        if (!cliente) {
            res.status(404).json({ msg: 'Cliente no encontrado' });
            return;
        }
        res.json(cliente);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el cliente' });
    }
});
exports.getClienteById = getClienteById;
// Actualizar un cliente
const updateCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { idCliente } = req.params;
    try {
        const cliente = yield cliente_model_1.default.findByPk(idCliente);
        if (!cliente) {
            res.status(404).json({ msg: `No existe un cliente con el id ${idCliente}` });
            return;
        }
        // Validar que al menos uno de DNI o RUC esté presente
        if (!body.dni && !body.ruc) {
            res.status(400).json({ msg: 'Debe proporcionar al menos DNI o RUC para actualizar' });
            return;
        }
        // Verificar si hay otro cliente con el mismo DNI o RUC, excluyendo el cliente que se está actualizando
        const clienteExistente = yield cliente_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { dni: body.dni },
                    { ruc: body.ruc }
                ],
                id: { [sequelize_1.Op.ne]: idCliente } // Excluir el cliente actual
            }
        });
        if (clienteExistente) {
            res.status(400).json({ msg: 'Ya existe un cliente con el mismo DNI o RUC' });
            return;
        }
        // Actualizar el cliente
        yield cliente.update(body);
        res.json({ msg: 'El cliente fue actualizado con éxito', cliente });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el cliente' });
    }
});
exports.updateCliente = updateCliente;
// Eliminar un cliente
const deleteCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idCliente } = req.params;
    try {
        const cliente = yield cliente_model_1.default.findByPk(idCliente);
        if (!cliente) {
            res.status(404).json({ msg: 'Cliente no encontrado' });
            return;
        }
        yield cliente.destroy();
        res.json({ msg: 'Cliente eliminado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el cliente' });
    }
});
exports.deleteCliente = deleteCliente;
// Buscar clientes
const searchClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    try {
        const clientes = yield cliente_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { apellido: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { direccion: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { dni: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                    { telefono: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                ],
            },
        });
        if (clientes.length === 0) {
            res.status(404).json({ msg: 'No se encontraron clientes que coincidan con el término de búsqueda' });
            return;
        }
        res.json(clientes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al realizar la búsqueda de clientes' });
    }
});
exports.searchClientes = searchClientes;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cliente_controller_1 = require("../controllers/cliente.controller");
const ClientesRouter = (0, express_1.Router)();
ClientesRouter.post('/', cliente_controller_1.createCliente); // Crear un nuevo cliente
ClientesRouter.get('/', cliente_controller_1.getClientes); // Obtener la lista de clientes
ClientesRouter.get('/:idCliente', cliente_controller_1.getClienteById); // Obtener un cliente por ID
ClientesRouter.put('/:idCliente', cliente_controller_1.updateCliente); // Actualizar un cliente por ID
ClientesRouter.delete('/:idCliente', cliente_controller_1.deleteCliente); // Eliminar un cliente por ID
ClientesRouter.get('/search/:searchTerm', cliente_controller_1.searchClientes); // Obtener la lista de clientes
exports.default = ClientesRouter;

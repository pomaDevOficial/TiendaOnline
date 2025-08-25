"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rol_controller_1 = require("../controllers/rol.controller");
const RolesRouter = (0, express_1.Router)();
RolesRouter.post('/', rol_controller_1.createRol); // Crear un nuevo rol
RolesRouter.get('/', rol_controller_1.getRoles); // Obtener la lista de todos los roles
RolesRouter.get('/registrados', rol_controller_1.getRolesRegistrados); // Obtener solo roles registrados/actualizados
RolesRouter.get('/eliminados', rol_controller_1.getRolesEliminados); // Obtener solo roles eliminados
RolesRouter.get('/:id', rol_controller_1.getRolById); // Obtener un rol por ID
RolesRouter.put('/:id', rol_controller_1.updateRol); // Actualizar un rol por ID
RolesRouter.patch('/:id/eliminar', rol_controller_1.deleteRol); // Eliminar lógicamente un rol (cambiar estado a eliminado)
RolesRouter.patch('/:id/restaurar', rol_controller_1.restaurarRol); // Restaurar un rol eliminado
exports.default = RolesRouter;

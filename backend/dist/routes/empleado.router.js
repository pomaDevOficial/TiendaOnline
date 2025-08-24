"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empleado_controller_1 = require("../controllers/empleado.controller");
const EmpleadosRouter = (0, express_1.Router)();
EmpleadosRouter.post('/', empleado_controller_1.createEmpleado); // Crear un nuevo empleado
EmpleadosRouter.get('/', empleado_controller_1.getEmpleados); // Obtener la lista de empleados
EmpleadosRouter.get('/:idEmpleado', empleado_controller_1.getEmpleadoById); // Obtener un empleado por ID
EmpleadosRouter.put('/:idEmpleado', empleado_controller_1.updateEmpleado); // Actualizar un empleado por ID
EmpleadosRouter.delete('/:idEmpleado', empleado_controller_1.deleteEmpleado); // Eliminar un empleado por ID
EmpleadosRouter.get('/search/:searchTerm', empleado_controller_1.searchEmpleados); // Buscar
EmpleadosRouter.patch('/inactivo/:idEmpleado', empleado_controller_1.deleteEmpleado); // Cambia el estado del empleado
EmpleadosRouter.patch('/activar/:idEmpleado', empleado_controller_1.activarEmpleado); // Cambia el estado del empleado
exports.default = EmpleadosRouter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const talla_controller_1 = require("../controllers/talla.controller");
const TallaRouter = (0, express_1.Router)();
TallaRouter.post('/', talla_controller_1.createTalla); // Crear una nueva talla
TallaRouter.get('/', talla_controller_1.getTallas); // Obtener la lista de todas las tallas
TallaRouter.get('/registradas', talla_controller_1.getTallasRegistradas); // Obtener solo tallas registradas/actualizadas
TallaRouter.get('/eliminadas', talla_controller_1.getTallasEliminadas); // Obtener solo tallas eliminadas
TallaRouter.get('/verificar-nombre/:nombre', talla_controller_1.verificarNombreTalla); // Verificar si existe una talla con el nombre
TallaRouter.get('/:id', talla_controller_1.getTallaById); // Obtener una talla por ID
TallaRouter.put('/:id', talla_controller_1.updateTalla); // Actualizar una talla por ID
TallaRouter.patch('/:id/eliminar', talla_controller_1.deleteTalla); // Eliminar lógicamente una talla (cambiar estado a eliminado)
TallaRouter.patch('/:id/restaurar', talla_controller_1.restaurarTalla); // Restaurar una talla eliminada
exports.default = TallaRouter;

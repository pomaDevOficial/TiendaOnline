"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marca_controller_1 = require("../controllers/marca.controller");
const MarcaRouter = (0, express_1.Router)();
MarcaRouter.post('/', marca_controller_1.createMarca); // Crear una nueva marca
MarcaRouter.get('/', marca_controller_1.getMarcas); // Obtener la lista de todas las marcas
MarcaRouter.get('/registradas', marca_controller_1.getMarcasRegistradas); // Obtener solo marcas registradas/actualizadas
MarcaRouter.get('/eliminadas', marca_controller_1.getMarcasEliminadas); // Obtener solo marcas eliminadas
MarcaRouter.get('/verificar-nombre/:nombre', marca_controller_1.verificarNombreMarca); // Verificar si existe una marca con el nombre
MarcaRouter.get('/:id', marca_controller_1.getMarcaById); // Obtener una marca por ID
MarcaRouter.put('/:id', marca_controller_1.updateMarca); // Actualizar una marca por ID
MarcaRouter.patch('/:id/eliminar', marca_controller_1.deleteMarca); // Eliminar lógicamente una marca (cambiar estado a eliminado)
MarcaRouter.patch('/:id/restaurar', marca_controller_1.restaurarMarca); // Restaurar una marca eliminada
exports.default = MarcaRouter;

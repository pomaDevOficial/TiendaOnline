"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marca_controller_1 = require("../controllers/marca.controller");
const MarcasRouter = (0, express_1.Router)();
MarcasRouter.post('/', marca_controller_1.createMarca); // Crear una nueva marca
MarcasRouter.get('/', marca_controller_1.getMarcas); // Obtener todas las marcas
MarcasRouter.get('/:idMarca', marca_controller_1.getMarcaById); // Obtener una marca por ID
MarcasRouter.put('/:idMarca', marca_controller_1.updateMarca); // Actualizar una marca por ID
MarcasRouter.delete('/:idMarca', marca_controller_1.deleteMarca); // Eliminar una marca por ID
exports.default = MarcasRouter;

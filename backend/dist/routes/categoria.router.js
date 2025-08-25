"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoria_controller_1 = require("../controllers/categoria.controller");
const CategoriaRouter = (0, express_1.Router)();
CategoriaRouter.post('/', categoria_controller_1.createCategoria); // Crear una nueva categoría
CategoriaRouter.get('/', categoria_controller_1.getCategorias); // Obtener la lista de todas las categorías
CategoriaRouter.get('/registradas', categoria_controller_1.getCategoriasRegistradas); // Obtener solo categorías registradas/actualizadas
CategoriaRouter.get('/eliminadas', categoria_controller_1.getCategoriasEliminadas); // Obtener solo categorías eliminadas
CategoriaRouter.get('/verificar-nombre/:nombre', categoria_controller_1.verificarNombreCategoria); // Verificar si existe una categoría con el nombre
CategoriaRouter.get('/:id', categoria_controller_1.getCategoriaById); // Obtener una categoría por ID
CategoriaRouter.put('/:id', categoria_controller_1.updateCategoria); // Actualizar una categoría por ID
CategoriaRouter.patch('/:id/eliminar', categoria_controller_1.deleteCategoria); // Eliminar lógicamente una categoría (cambiar estado a eliminado)
CategoriaRouter.patch('/:id/restaurar', categoria_controller_1.restaurarCategoria); // Restaurar una categoría eliminada
exports.default = CategoriaRouter;

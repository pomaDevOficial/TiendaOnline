"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tipo_serie_controller_1 = require("../controllers/tipo_serie.controller");
const TipoSerieRouter = (0, express_1.Router)();
TipoSerieRouter.post('/', tipo_serie_controller_1.createTipoSerie); // Crear un nuevo tipo de serie
TipoSerieRouter.get('/', tipo_serie_controller_1.getTiposSerie); // Obtener la lista de todos los tipos de serie
TipoSerieRouter.get('/registrados', tipo_serie_controller_1.getTiposSerieRegistrados); // Obtener solo tipos de serie registrados/actualizados
TipoSerieRouter.get('/eliminados', tipo_serie_controller_1.getTiposSerieEliminados); // Obtener solo tipos de serie eliminados
TipoSerieRouter.get('/verificar-nombre/:nombre', tipo_serie_controller_1.verificarNombreTipoSerie); // Verificar si existe un tipo de serie con el nombre
TipoSerieRouter.get('/:id', tipo_serie_controller_1.getTipoSerieById); // Obtener un tipo de serie por ID
TipoSerieRouter.put('/:id', tipo_serie_controller_1.updateTipoSerie); // Actualizar un tipo de serie por ID
TipoSerieRouter.patch('/:id/eliminar', tipo_serie_controller_1.deleteTipoSerie); // Eliminar lógicamente un tipo de serie
TipoSerieRouter.patch('/:id/restaurar', tipo_serie_controller_1.restaurarTipoSerie); // Restaurar un tipo de serie eliminado
exports.default = TipoSerieRouter;

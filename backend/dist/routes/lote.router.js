"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lote_controller_1 = require("../controllers/lote.controller");
const LoteRouter = (0, express_1.Router)();
LoteRouter.post('/', lote_controller_1.createLote); // Crear un nuevo lote
LoteRouter.post('/completo', lote_controller_1.createLoteCompleto); // Crear lote completo con detalles y movimientos ← Nueva ruta
LoteRouter.get('/', lote_controller_1.getLotes); // Obtener la lista de todos los lotes
LoteRouter.get('/disponibles', lote_controller_1.getLotesDisponibles); // Obtener solo lotes disponibles
LoteRouter.get('/eliminados', lote_controller_1.getLotesEliminados); // Obtener solo lotes eliminados
LoteRouter.get('/producto/:idproducto', lote_controller_1.getLotesByProducto); // Obtener lotes por producto
LoteRouter.get('/:id', lote_controller_1.getLoteById); // Obtener un lote por ID
LoteRouter.put('/:id', lote_controller_1.updateLote); // Actualizar un lote por ID
LoteRouter.patch('/:id/estado', lote_controller_1.cambiarEstadoLote); // Cambiar estado del lote (disponible/agotado)
LoteRouter.patch('/:id/eliminar', lote_controller_1.deleteLote); // Eliminar lógicamente un lote (cambiar estado a eliminado)
LoteRouter.patch('/:id/restaurar', lote_controller_1.restaurarLote); // Restaurar un lote eliminado
exports.default = LoteRouter;

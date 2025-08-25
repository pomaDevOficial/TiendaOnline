"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detalle_venta_controller_1 = require("../controllers/detalle_venta.controller");
const DetalleVentaRouter = (0, express_1.Router)();
// CREATE
DetalleVentaRouter.post('/', detalle_venta_controller_1.createDetalleVenta); // Crear un nuevo detalle de venta
DetalleVentaRouter.post('/multiple', detalle_venta_controller_1.createMultipleDetalleVenta); // Crear múltiples detalles de venta
// READ
DetalleVentaRouter.get('/', detalle_venta_controller_1.getDetallesVenta); // Obtener todos los detalles de venta
DetalleVentaRouter.get('/registrados', detalle_venta_controller_1.getDetallesVentaRegistrados); // Obtener detalles de venta registrados
DetalleVentaRouter.get('/anulados', detalle_venta_controller_1.getDetallesVentaAnulados); // Obtener detalles de venta anulados
DetalleVentaRouter.get('/venta/:idventa', detalle_venta_controller_1.getDetallesVentaByVenta); // Obtener detalles de venta por venta
DetalleVentaRouter.get('/:id', detalle_venta_controller_1.getDetalleVentaById); // Obtener un detalle de venta por ID
// UPDATE
DetalleVentaRouter.put('/:id', detalle_venta_controller_1.updateDetalleVenta); // Actualizar un detalle de venta por ID
DetalleVentaRouter.patch('/:id/anular', detalle_venta_controller_1.anularDetalleVenta); // Anular un detalle de venta
DetalleVentaRouter.patch('/:id/restaurar', detalle_venta_controller_1.restaurarDetalleVenta); // Restaurar un detalle de venta anulado
// DELETE
DetalleVentaRouter.delete('/:id', detalle_venta_controller_1.deleteDetalleVenta); // Eliminar un detalle de venta físicamente
exports.default = DetalleVentaRouter;

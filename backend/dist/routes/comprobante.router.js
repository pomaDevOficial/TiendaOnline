"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comprobante_controller_1 = require("../controllers/comprobante.controller");
const ComprobanteRouter = (0, express_1.Router)();
// CREATE
ComprobanteRouter.post('/', comprobante_controller_1.createComprobante); // Crear un nuevo comprobante
// READ
ComprobanteRouter.get('/', comprobante_controller_1.getComprobantes); // Obtener todos los comprobantes
ComprobanteRouter.get('/registrados', comprobante_controller_1.getComprobantesRegistrados); // Obtener comprobantes registrados
ComprobanteRouter.get('/anulados', comprobante_controller_1.getComprobantesAnulados); // Obtener comprobantes anulados
ComprobanteRouter.get('/fecha', comprobante_controller_1.getComprobantesByFecha); // Obtener comprobantes por rango de fechas
ComprobanteRouter.get('/venta/:idventa', comprobante_controller_1.getComprobantesByVenta); // Obtener comprobantes por venta
ComprobanteRouter.get('/:id', comprobante_controller_1.getComprobanteById); // Obtener un comprobante por ID
// UPDATE
ComprobanteRouter.put('/:id', comprobante_controller_1.updateComprobante); // Actualizar un comprobante por ID
ComprobanteRouter.patch('/:id/anular', comprobante_controller_1.anularComprobante); // Anular un comprobante
ComprobanteRouter.patch('/:id/restaurar', comprobante_controller_1.restaurarComprobante); // Restaurar un comprobante anulado
// DELETE
ComprobanteRouter.delete('/:id', comprobante_controller_1.deleteComprobante); // Eliminar un comprobante físicamente
exports.default = ComprobanteRouter;

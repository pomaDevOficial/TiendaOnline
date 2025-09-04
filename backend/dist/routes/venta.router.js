"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venta_controller_1 = require("../controllers/venta.controller");
const VentaRouter = (0, express_1.Router)();
VentaRouter.post('/', venta_controller_1.createVenta); // Crear una nueva venta
VentaRouter.get('/', venta_controller_1.getVentas); // Obtener todas las ventas
VentaRouter.get('/registradas', venta_controller_1.getVentasRegistradas); // Obtener ventas registradas
VentaRouter.get('/anuladas', venta_controller_1.getVentasAnuladas); // Obtener ventas anuladas
VentaRouter.get('/dashboard/por-mes', venta_controller_1.getVentasPorMes);
VentaRouter.get('/usuario/:idusuario', venta_controller_1.getVentasByUsuario); // Obtener ventas por usuario
VentaRouter.get('/pedido/:idpedido', venta_controller_1.getVentasByPedido); // Obtener ventas por pedido
VentaRouter.get('/:id', venta_controller_1.getVentaById); // Obtener una venta por ID
VentaRouter.put('/:id', venta_controller_1.updateVenta); // Actualizar una venta por ID
VentaRouter.patch('/:id/anular', venta_controller_1.anularVenta); // Anular una venta
VentaRouter.patch('/:id/restaurar', venta_controller_1.restaurarVenta); // Restaurar una venta anulada
exports.default = VentaRouter;

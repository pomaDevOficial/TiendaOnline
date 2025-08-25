"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedido_detalle_controller_1 = require("../controllers/pedido_detalle.controller");
const PedidoDetalleRouter = (0, express_1.Router)();
PedidoDetalleRouter.post('/', pedido_detalle_controller_1.createPedidoDetalle); // Crear un nuevo detalle
PedidoDetalleRouter.post('/multiple', pedido_detalle_controller_1.createMultiplePedidoDetalle); // Crear múltiples detalles
PedidoDetalleRouter.get('/', pedido_detalle_controller_1.getPedidosDetalle); // Obtener todos los detalles
PedidoDetalleRouter.get('/pedido/:idpedido', pedido_detalle_controller_1.getDetallesByPedido); // Obtener detalles por pedido
PedidoDetalleRouter.get('/:id', pedido_detalle_controller_1.getPedidoDetalleById); // Obtener un detalle por ID
PedidoDetalleRouter.put('/:id', pedido_detalle_controller_1.updatePedidoDetalle); // Actualizar un detalle por ID
PedidoDetalleRouter.delete('/:id', pedido_detalle_controller_1.deletePedidoDetalle); // Eliminar un detalle
PedidoDetalleRouter.delete('/', pedido_detalle_controller_1.deleteMultiplePedidoDetalle); // Eliminar múltiples detalles
exports.default = PedidoDetalleRouter;

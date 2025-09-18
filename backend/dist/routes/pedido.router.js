"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedido_controller_1 = require("../controllers/pedido.controller");
const pedidoImage_1 = require("../middlewares/pedidoImage");
const PedidoRouter = (0, express_1.Router)();
PedidoRouter.post('/create/comprobante-imagen', pedidoImage_1.PedidoImage.single("imagen"), pedido_controller_1.crearPedidoConComprobante);
PedidoRouter.post('/', pedido_controller_1.createPedido); // Crear un nuevo pedido
PedidoRouter.post('/aprobar/:id', pedido_controller_1.aprobarPedido); // Aprobar un nuevo pedido
PedidoRouter.get('/', pedido_controller_1.getPedidos); // Obtener todos los pedidos
PedidoRouter.get('/cancelados', pedido_controller_1.getPedidosCancelados); // Obtener pedidos cancelados
PedidoRouter.get('/estado/:estado', pedido_controller_1.getPedidosByEstado); // Obtener pedidos por estado
PedidoRouter.get('/persona/:idpersona', pedido_controller_1.getPedidosByPersona); // Obtener pedidos por persona
PedidoRouter.get('/:id', pedido_controller_1.getPedidoById); // Obtener un pedido por ID
PedidoRouter.put('/:id', pedido_controller_1.updatePedido); // Actualizar un pedido por ID
PedidoRouter.patch('/:id/estado', pedido_controller_1.cambiarEstadoPedido); // Cambiar estado del pedido
PedidoRouter.patch('/:id/cancelar', pedido_controller_1.deletePedido); // Cancelar un pedido
PedidoRouter.patch('/:id/restaurar', pedido_controller_1.restaurarPedido); // Restaurar un pedido cancelado
exports.default = PedidoRouter;

import { Router } from "express";
import {
    createPedidoDetalle,
    createMultiplePedidoDetalle,
    getPedidosDetalle,
    getPedidoDetalleById,
    updatePedidoDetalle,
    deletePedidoDetalle,
    deleteMultiplePedidoDetalle,
    getDetallesByPedido
} from '../controllers/pedido_detalle.controller';

const PedidoDetalleRouter = Router();

PedidoDetalleRouter.post('/', createPedidoDetalle); // Crear un nuevo detalle
PedidoDetalleRouter.post('/multiple', createMultiplePedidoDetalle); // Crear múltiples detalles
PedidoDetalleRouter.get('/', getPedidosDetalle); // Obtener todos los detalles
PedidoDetalleRouter.get('/pedido/detalle/:idpedido', getDetallesByPedido); // Obtener detalles por pedido
PedidoDetalleRouter.get('/:id', getPedidoDetalleById); // Obtener un detalle por ID
PedidoDetalleRouter.put('/:id', updatePedidoDetalle); // Actualizar un detalle por ID
PedidoDetalleRouter.delete('/:id', deletePedidoDetalle); // Eliminar un detalle
PedidoDetalleRouter.delete('/', deleteMultiplePedidoDetalle); // Eliminar múltiples detalles

export default PedidoDetalleRouter;
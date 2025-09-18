import { Router } from "express";
import {
    createPedido,
    getPedidos,
    getPedidoById,
    updatePedido,
    deletePedido,
    getPedidosByEstado,
    getPedidosByPersona,
    cambiarEstadoPedido,
    getPedidosCancelados,
    restaurarPedido,
    crearPedidoConComprobante,
    aprobarPedido
} from '../controllers/pedido.controller';
import { PedidoImage } from "../middlewares/pedidoImage";

const PedidoRouter = Router();
PedidoRouter.post('/create/comprobante-imagen',PedidoImage.single("imagen"),crearPedidoConComprobante);
PedidoRouter.post('/', createPedido); // Crear un nuevo pedido
PedidoRouter.post('/aprobar/:id', aprobarPedido); // Aprobar un nuevo pedido
PedidoRouter.get('/', getPedidos); // Obtener todos los pedidos
PedidoRouter.get('/cancelados', getPedidosCancelados); // Obtener pedidos cancelados
PedidoRouter.get('/estado/:estado', getPedidosByEstado); // Obtener pedidos por estado
PedidoRouter.get('/persona/:idpersona', getPedidosByPersona); // Obtener pedidos por persona
PedidoRouter.get('/:id', getPedidoById); // Obtener un pedido por ID
PedidoRouter.put('/:id', updatePedido); // Actualizar un pedido por ID
PedidoRouter.patch('/:id/estado', cambiarEstadoPedido); // Cambiar estado del pedido
PedidoRouter.patch('/:id/cancelar', deletePedido); // Cancelar un pedido
PedidoRouter.patch('/:id/restaurar', restaurarPedido); // Restaurar un pedido cancelado

export default PedidoRouter;
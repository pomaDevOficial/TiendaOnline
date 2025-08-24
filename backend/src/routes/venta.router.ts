import { Router } from "express";
import {
    createVenta,
    getVentas,
    getVentaById,
    updateVenta,
    anularVenta,
    restaurarVenta,
    getVentasRegistradas,
    getVentasAnuladas,
    getVentasByUsuario,
    getVentasByPedido
} from '../controllers/venta.controller';

const VentaRouter = Router();

VentaRouter.post('/', createVenta); // Crear una nueva venta
VentaRouter.get('/', getVentas); // Obtener todas las ventas
VentaRouter.get('/registradas', getVentasRegistradas); // Obtener ventas registradas
VentaRouter.get('/anuladas', getVentasAnuladas); // Obtener ventas anuladas
VentaRouter.get('/usuario/:idusuario', getVentasByUsuario); // Obtener ventas por usuario
VentaRouter.get('/pedido/:idpedido', getVentasByPedido); // Obtener ventas por pedido
VentaRouter.get('/:id', getVentaById); // Obtener una venta por ID
VentaRouter.put('/:id', updateVenta); // Actualizar una venta por ID
VentaRouter.patch('/:id/anular', anularVenta); // Anular una venta
VentaRouter.patch('/:id/restaurar', restaurarVenta); // Restaurar una venta anulada

export default VentaRouter;
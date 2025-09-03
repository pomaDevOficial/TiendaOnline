import { Router } from "express";
import {
    createDetalleVenta,
    createMultipleDetalleVenta,
    getDetallesVenta,
    getDetalleVentaById,
    updateDetalleVenta,
    anularDetalleVenta,
    restaurarDetalleVenta,
    getDetallesVentaRegistrados,
    getDetallesVentaAnulados,
    getDetallesVentaByVenta,
    deleteDetalleVenta,
    getProductosMasVendidos
} from '../controllers/detalle_venta.controller';

const DetalleVentaRouter = Router();

// CREATE
DetalleVentaRouter.post('/', createDetalleVenta); // Crear un nuevo detalle de venta
DetalleVentaRouter.post('/multiple', createMultipleDetalleVenta); // Crear múltiples detalles de venta
DetalleVentaRouter.get('/productos-mas-vendidos', getProductosMasVendidos);
// READ
DetalleVentaRouter.get('/', getDetallesVenta); // Obtener todos los detalles de venta
DetalleVentaRouter.get('/registrados', getDetallesVentaRegistrados); // Obtener detalles de venta registrados
DetalleVentaRouter.get('/anulados', getDetallesVentaAnulados); // Obtener detalles de venta anulados
DetalleVentaRouter.get('/venta/:idventa', getDetallesVentaByVenta); // Obtener detalles de venta por venta
DetalleVentaRouter.get('/:id', getDetalleVentaById); // Obtener un detalle de venta por ID

// UPDATE
DetalleVentaRouter.put('/:id', updateDetalleVenta); // Actualizar un detalle de venta por ID
DetalleVentaRouter.patch('/:id/anular', anularDetalleVenta); // Anular un detalle de venta
DetalleVentaRouter.patch('/:id/restaurar', restaurarDetalleVenta); // Restaurar un detalle de venta anulado

// DELETE
DetalleVentaRouter.delete('/:id', deleteDetalleVenta); // Eliminar un detalle de venta físicamente

export default DetalleVentaRouter;
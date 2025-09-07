import { Router } from "express";
import {
    createComprobante,
    getComprobantes,
    getComprobanteById,
    updateComprobante,
    anularComprobante,
    restaurarComprobante,
    getComprobantesRegistrados,
    getComprobantesAnulados,
    getComprobantesByVenta,
    getComprobantesByFecha,
    deleteComprobante,
    crearVentaCompletaConComprobante,
    crearVentaCompletaConComprobanteAdministracion,
    crearVentaCompletaConComprobanteConMensajes
} from '../controllers/comprobante.controller';

const ComprobanteRouter = Router();

// CREATE
ComprobanteRouter.post('/', createComprobante); // Crear un nuevo comprobante
ComprobanteRouter.post('/venta-completa', crearVentaCompletaConComprobante); // Nueva ruta
ComprobanteRouter.post('/venta-completa/admin', crearVentaCompletaConComprobanteAdministracion); // Nueva ruta
ComprobanteRouter.post('/venta-completa/mensajes', crearVentaCompletaConComprobanteConMensajes); // Nueva ruta con envío garantizado de mensajes
// READ
ComprobanteRouter.get('/', getComprobantes); // Obtener todos los comprobantes
ComprobanteRouter.get('/registrados', getComprobantesRegistrados); // Obtener comprobantes registrados
ComprobanteRouter.get('/anulados', getComprobantesAnulados); // Obtener comprobantes anulados
ComprobanteRouter.get('/fecha', getComprobantesByFecha); // Obtener comprobantes por rango de fechas
ComprobanteRouter.get('/venta/:idventa', getComprobantesByVenta); // Obtener comprobantes por venta
ComprobanteRouter.get('/:id', getComprobanteById); // Obtener un comprobante por ID

// UPDATE
ComprobanteRouter.put('/:id', updateComprobante); // Actualizar un comprobante por ID
ComprobanteRouter.patch('/:id/anular', anularComprobante); // Anular un comprobante
ComprobanteRouter.patch('/:id/restaurar', restaurarComprobante); // Restaurar un comprobante anulado

// DELETE
ComprobanteRouter.delete('/:id', deleteComprobante); // Eliminar un comprobante físicamente

export default ComprobanteRouter;
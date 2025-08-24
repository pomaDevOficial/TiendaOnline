import { Router } from "express";
import {
    createTipoComprobante,
    getTiposComprobante,
    getTipoComprobanteById,
    updateTipoComprobante,
    deleteTipoComprobante,
    getTiposComprobanteRegistrados,
    getTiposComprobanteEliminados,
    restaurarTipoComprobante,
    verificarNombreTipoComprobante
} from '../controllers/tipo_comprobante.controller';

const TipoComprobanteRouter = Router();

TipoComprobanteRouter.post('/', createTipoComprobante); // Crear un nuevo tipo de comprobante
TipoComprobanteRouter.get('/', getTiposComprobante); // Obtener la lista de todos los tipos de comprobante
TipoComprobanteRouter.get('/registrados', getTiposComprobanteRegistrados); // Obtener solo tipos de comprobante registrados/actualizados
TipoComprobanteRouter.get('/eliminados', getTiposComprobanteEliminados); // Obtener solo tipos de comprobante eliminados
TipoComprobanteRouter.get('/verificar-nombre/:nombre', verificarNombreTipoComprobante); // Verificar si existe un tipo de comprobante con el nombre
TipoComprobanteRouter.get('/:id', getTipoComprobanteById); // Obtener un tipo de comprobante por ID
TipoComprobanteRouter.put('/:id', updateTipoComprobante); // Actualizar un tipo de comprobante por ID
TipoComprobanteRouter.patch('/:id/eliminar', deleteTipoComprobante); // Eliminar lógicamente un tipo de comprobante
TipoComprobanteRouter.patch('/:id/restaurar', restaurarTipoComprobante); // Restaurar un tipo de comprobante eliminado

export default TipoComprobanteRouter;
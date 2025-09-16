import { Router } from "express";
import {
    createLoteTalla,
    getLotesTalla,
    getLoteTallaById,
    updateLoteTalla,
    deleteLoteTalla,
    getLotesTallaDisponibles,
    getLotesTallaEliminados,
    restaurarLoteTalla,
    getLotesTallaByLote,
    cambiarEstadoLoteTalla,
    getProductosDisponiblesPorTalla,
    getProductosDisponibles,
    getTallasDisponibles,
    verificarStock,
    agregarStockPorLoteTalla,
    getProductosFormatoService,
    updateOrCreateMultipleLoteTalla,
    getResumenStockCritico
    
} from '../controllers/lote_talla.controller';

const LoteTallaRouter = Router();

LoteTallaRouter.post('/', createLoteTalla); // Crear un nuevo lote_talla
LoteTallaRouter.get('/', getLotesTalla); // Obtener la lista de todos los lotes_talla
LoteTallaRouter.get('/disponibles', getLotesTallaDisponibles); // Obtener solo lotes_talla disponibles
LoteTallaRouter.get('/filtro-productos', getProductosFormatoService); // Obtener solo lotes_talla disponibles
LoteTallaRouter.get('/eliminados', getLotesTallaEliminados); // Obtener solo lotes_talla eliminados
LoteTallaRouter.get('/lote/:idlote', getLotesTallaByLote); // Obtener lotes_talla por lote
LoteTallaRouter.get('/catalogo/talla', getProductosDisponiblesPorTalla); // Obtener productos disponibles por talla (para catálogo)
// CATÁLOGO Y INVENTARIO
LoteTallaRouter.get('/catalogo', getProductosDisponibles); // Catálogo con filtros
LoteTallaRouter.get('/tallas', getTallasDisponibles); // Tallas por producto
LoteTallaRouter.get('/stock', verificarStock); // Verificación de stock
LoteTallaRouter.put('/multiple', updateOrCreateMultipleLoteTalla);
LoteTallaRouter.patch('/agregar-stock', agregarStockPorLoteTalla); // Agregar stock a un lote_talla específico

// ✅ NUEVA RUTA PARA RESUMEN DE STOCK CRÍTICO
LoteTallaRouter.get('/resumen/stock-critico', getResumenStockCritico);

LoteTallaRouter.get('/:id', getLoteTallaById); // Obtener un lote_talla por ID
LoteTallaRouter.put('/:id', updateLoteTalla); // Actualizar un lote_talla por ID
LoteTallaRouter.patch('/:id/estado', cambiarEstadoLoteTalla); // Cambiar estado del lote_talla (disponible/agotado)
LoteTallaRouter.patch('/:id/eliminar', deleteLoteTalla); // Eliminar lógicamente un lote_talla (cambiar estado a eliminado)
LoteTallaRouter.patch('/:id/restaurar', restaurarLoteTalla); // Restaurar un lote_talla eliminado
// En tu archivo de rutas

// NUEVA RUTA PARA AGREGAR STOCK

export default LoteTallaRouter;
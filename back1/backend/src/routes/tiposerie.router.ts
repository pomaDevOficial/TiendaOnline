import { Router } from "express";
import {
    createTipoSerie,
    getTiposSerie,
    getTipoSerieById,
    updateTipoSerie,
    deleteTipoSerie,
    getTiposSerieRegistrados,
    getTiposSerieEliminados,
    restaurarTipoSerie,
    verificarNombreTipoSerie
} from '../controllers/tipo_serie.controller';

const TipoSerieRouter = Router();

TipoSerieRouter.post('/', createTipoSerie); // Crear un nuevo tipo de serie
TipoSerieRouter.get('/', getTiposSerie); // Obtener la lista de todos los tipos de serie
TipoSerieRouter.get('/registrados', getTiposSerieRegistrados); // Obtener solo tipos de serie registrados/actualizados
TipoSerieRouter.get('/eliminados', getTiposSerieEliminados); // Obtener solo tipos de serie eliminados
TipoSerieRouter.get('/verificar-nombre/:nombre', verificarNombreTipoSerie); // Verificar si existe un tipo de serie con el nombre
TipoSerieRouter.get('/:id', getTipoSerieById); // Obtener un tipo de serie por ID
TipoSerieRouter.put('/:id', updateTipoSerie); // Actualizar un tipo de serie por ID
TipoSerieRouter.patch('/:id/eliminar', deleteTipoSerie); // Eliminar lógicamente un tipo de serie
TipoSerieRouter.patch('/:id/restaurar', restaurarTipoSerie); // Restaurar un tipo de serie eliminado

export default TipoSerieRouter;
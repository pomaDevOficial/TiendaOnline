import { Router } from "express";
import {
    createTalla,
    getTallas,
    getTallaById,
    updateTalla,
    deleteTalla,
    getTallasRegistradas,
    getTallasEliminadas,
    restaurarTalla,
    verificarNombreTalla
} from '../controllers/talla.controller';

const TallaRouter = Router();

TallaRouter.post('/', createTalla); // Crear una nueva talla
TallaRouter.get('/', getTallas); // Obtener la lista de todas las tallas
TallaRouter.get('/registradas', getTallasRegistradas); // Obtener solo tallas registradas/actualizadas
TallaRouter.get('/eliminadas', getTallasEliminadas); // Obtener solo tallas eliminadas
TallaRouter.get('/verificar-nombre/:nombre', verificarNombreTalla); // Verificar si existe una talla con el nombre
TallaRouter.get('/:id', getTallaById); // Obtener una talla por ID
TallaRouter.put('/:id', updateTalla); // Actualizar una talla por ID
TallaRouter.patch('/:id/eliminar', deleteTalla); // Eliminar lógicamente una talla (cambiar estado a eliminado)
TallaRouter.patch('/:id/restaurar', restaurarTalla); // Restaurar una talla eliminada

export default TallaRouter;
import { Router } from "express";
import {
    createMarca,
    getMarcas,
    getMarcaById,
    updateMarca,
    deleteMarca,
    getMarcasRegistradas,
    getMarcasEliminadas,
    restaurarMarca,
    verificarNombreMarca
} from '../controllers/marca.controller';

const MarcaRouter = Router();

MarcaRouter.post('/', createMarca); // Crear una nueva marca
MarcaRouter.get('/', getMarcas); // Obtener la lista de todas las marcas
MarcaRouter.get('/registradas', getMarcasRegistradas); // Obtener solo marcas registradas/actualizadas
MarcaRouter.get('/eliminadas', getMarcasEliminadas); // Obtener solo marcas eliminadas
MarcaRouter.get('/verificar-nombre/:nombre', verificarNombreMarca); // Verificar si existe una marca con el nombre
MarcaRouter.get('/:id', getMarcaById); // Obtener una marca por ID
MarcaRouter.put('/:id', updateMarca); // Actualizar una marca por ID
MarcaRouter.patch('/:id/eliminar', deleteMarca); // Eliminar lógicamente una marca (cambiar estado a eliminado)
MarcaRouter.patch('/:id/restaurar', restaurarMarca); // Restaurar una marca eliminada

export default MarcaRouter;
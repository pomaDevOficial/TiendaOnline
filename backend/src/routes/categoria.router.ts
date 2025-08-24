import { Router } from "express";
import {
    createCategoria,
    getCategorias,
    getCategoriaById,
    updateCategoria,
    deleteCategoria,
    getCategoriasRegistradas,
    getCategoriasEliminadas,
    restaurarCategoria,
    verificarNombreCategoria
} from '../controllers/categoria.controller';

const CategoriaRouter = Router();

CategoriaRouter.post('/', createCategoria); // Crear una nueva categoría
CategoriaRouter.get('/', getCategorias); // Obtener la lista de todas las categorías
CategoriaRouter.get('/registradas', getCategoriasRegistradas); // Obtener solo categorías registradas/actualizadas
CategoriaRouter.get('/eliminadas', getCategoriasEliminadas); // Obtener solo categorías eliminadas
CategoriaRouter.get('/verificar-nombre/:nombre', verificarNombreCategoria); // Verificar si existe una categoría con el nombre
CategoriaRouter.get('/:id', getCategoriaById); // Obtener una categoría por ID
CategoriaRouter.put('/:id', updateCategoria); // Actualizar una categoría por ID
CategoriaRouter.patch('/:id/eliminar', deleteCategoria); // Eliminar lógicamente una categoría (cambiar estado a eliminado)
CategoriaRouter.patch('/:id/restaurar', restaurarCategoria); // Restaurar una categoría eliminada

export default CategoriaRouter;
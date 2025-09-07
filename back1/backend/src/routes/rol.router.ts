import { Router } from "express";
import {
    createRol,
    getRoles,
    getRolById,
    updateRol,
    deleteRol,
    getRolesRegistrados,
    getRolesEliminados,
    restaurarRol
} from '../controllers/rol.controller';

const RolesRouter = Router();

RolesRouter.post('/', createRol); // Crear un nuevo rol
RolesRouter.get('/', getRoles); // Obtener la lista de todos los roles
RolesRouter.get('/registrados', getRolesRegistrados); // Obtener solo roles registrados/actualizados
RolesRouter.get('/eliminados', getRolesEliminados); // Obtener solo roles eliminados
RolesRouter.get('/:id', getRolById); // Obtener un rol por ID
RolesRouter.put('/:id', updateRol); // Actualizar un rol por ID
RolesRouter.patch('/:id/eliminar', deleteRol); // Eliminar lógicamente un rol (cambiar estado a eliminado)
RolesRouter.patch('/:id/restaurar', restaurarRol); // Restaurar un rol eliminado

export default RolesRouter;
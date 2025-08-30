import { Router } from "express";
import {
    createPersona,
    getPersonas,
    getPersonaById,
    updatePersona,
    deletePersona,
    getPersonasRegistradas,
    getPersonasEliminadas,
    restaurarPersona,
    verificarDni,
    listarClientes
} from '../controllers/persona.controller';

const PersonaRouter = Router();

PersonaRouter.post('/', createPersona); // Crear una nueva persona
PersonaRouter.get('/', getPersonas); // Obtener la lista de todas las personas
PersonaRouter.get('/registradas', getPersonasRegistradas); // Obtener solo personas registradas/actualizadas
PersonaRouter.get('/eliminadas', getPersonasEliminadas); // Obtener solo personas eliminadas
PersonaRouter.get('/verificar-dni/:nroidentidad', verificarDni); // Verificar si existe una persona con el DNI
PersonaRouter.get('/:id', getPersonaById); // Obtener una persona por ID
PersonaRouter.put('/:id', updatePersona); // Actualizar una persona por ID
PersonaRouter.patch('/:id/eliminar', deletePersona); // Eliminar lógicamente una persona (cambiar estado a eliminado)
PersonaRouter.patch('/:id/restaurar', restaurarPersona); // Restaurar una persona eliminada
PersonaRouter.get('/clientes', listarClientes); // Nueva ruta para listar clientes

export default PersonaRouter;
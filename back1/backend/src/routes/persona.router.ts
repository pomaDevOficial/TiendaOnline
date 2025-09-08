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
// ⚠️ Coloca primero las rutas “literales”
PersonaRouter.get('/clientes', listarClientes);
PersonaRouter.get('/registradas', getPersonasRegistradas); // Obtener solo personas registradas/actualizadas
PersonaRouter.get('/eliminadas', getPersonasEliminadas); // Obtener solo personas eliminadas
PersonaRouter.get('/verificar-dni/:nroidentidad', verificarDni); // Verificar si existe una persona con el DNI
// ✅ Restringe las rutas con id a solo números
PersonaRouter.get('/:id(\\d+)', getPersonaById);
PersonaRouter.put('/:id(\\d+)', updatePersona);
PersonaRouter.patch('/:id(\\d+)/eliminar', deletePersona);
PersonaRouter.patch('/:id(\\d+)/restaurar', restaurarPersona);
export default PersonaRouter;
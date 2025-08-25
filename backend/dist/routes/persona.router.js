"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persona_controller_1 = require("../controllers/persona.controller");
const PersonaRouter = (0, express_1.Router)();
PersonaRouter.post('/', persona_controller_1.createPersona); // Crear una nueva persona
PersonaRouter.get('/', persona_controller_1.getPersonas); // Obtener la lista de todas las personas
PersonaRouter.get('/registradas', persona_controller_1.getPersonasRegistradas); // Obtener solo personas registradas/actualizadas
PersonaRouter.get('/eliminadas', persona_controller_1.getPersonasEliminadas); // Obtener solo personas eliminadas
PersonaRouter.get('/verificar-dni/:nroidentidad', persona_controller_1.verificarDni); // Verificar si existe una persona con el DNI
PersonaRouter.get('/:id', persona_controller_1.getPersonaById); // Obtener una persona por ID
PersonaRouter.put('/:id', persona_controller_1.updatePersona); // Actualizar una persona por ID
PersonaRouter.patch('/:id/eliminar', persona_controller_1.deletePersona); // Eliminar lógicamente una persona (cambiar estado a eliminado)
PersonaRouter.patch('/:id/restaurar', persona_controller_1.restaurarPersona); // Restaurar una persona eliminada
exports.default = PersonaRouter;

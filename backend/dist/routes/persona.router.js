"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persona_controller_1 = require("../controllers/persona.controller");
const PersonaRouter = (0, express_1.Router)();
PersonaRouter.post('/', persona_controller_1.createPersona); // Crear una nueva persona
PersonaRouter.get('/', persona_controller_1.getPersonas); // Obtener la lista de todas las personas
// ⚠️ Coloca primero las rutas “literales”
PersonaRouter.get('/clientes', persona_controller_1.listarClientes);
PersonaRouter.get("/buscarclientes", persona_controller_1.buscarClientes);
PersonaRouter.get('/registradas', persona_controller_1.getPersonasRegistradas); // Obtener solo personas registradas/actualizadas
PersonaRouter.get('/eliminadas', persona_controller_1.getPersonasEliminadas); // Obtener solo personas eliminadas
PersonaRouter.get('/verificar-dni/:nroidentidad', persona_controller_1.verificarDni); // Verificar si existe una persona con el DNI
// ✅ Restringe las rutas con id a solo números
PersonaRouter.get('/:id(\\d+)', persona_controller_1.getPersonaById);
PersonaRouter.put('/:id(\\d+)', persona_controller_1.updatePersona);
PersonaRouter.patch('/:id(\\d+)/eliminar', persona_controller_1.deletePersona);
PersonaRouter.patch('/:id(\\d+)/restaurar', persona_controller_1.restaurarPersona);
exports.default = PersonaRouter;

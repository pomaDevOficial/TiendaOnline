"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarClientes = exports.listarClientes = exports.restaurarPersona = exports.getPersonasEliminadas = exports.deletePersona = exports.updatePersona = exports.verificarDni = exports.getPersonaById = exports.getPersonasRegistradas = exports.getPersonas = exports.createPersona = void 0;
const persona_model_1 = __importDefault(require("../models/persona.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Insertar nueva persona
const createPersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idtipopersona, nombres, apellidos, idtipoidentidad, nroidentidad, correo, telefono } = req.body;
    try {
        // Validaciones básicas
        if (!nombres || !apellidos) {
            res.status(400).json({
                msg: 'Los campos nombres y apellidos son obligatorios'
            });
            return;
        }
        // Verificar si el número de identidad ya existe
        if (nroidentidad) {
            const existingPersona = yield persona_model_1.default.findOne({ where: { nroidentidad } });
            if (existingPersona) {
                res.status(400).json({ msg: 'El número de identidad ya existe' });
                return;
            }
        }
        // Verificar si el correo ya existe
        if (correo) {
            const existingPersona = yield persona_model_1.default.findOne({ where: { correo } });
            if (existingPersona) {
                res.status(400).json({ msg: 'El correo electrónico ya existe' });
                return;
            }
        }
        // Crear nueva persona
        const nuevaPersona = yield persona_model_1.default.create({
            idtipopersona: idtipopersona || null,
            nombres,
            apellidos,
            idtipoidentidad: idtipoidentidad || null,
            nroidentidad: nroidentidad || null,
            correo: correo || null,
            telefono: telefono || null,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener la persona creada con su relación de estado
        const personaCreada = yield persona_model_1.default.findByPk(nuevaPersona.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Persona creada exitosamente',
            data: personaCreada
        });
    }
    catch (error) {
        console.error('Error en createPersona:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createPersona = createPersona;
// READ - Listar todas las personas
const getPersonas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personas = yield persona_model_1.default.findAll({
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });
        res.json({
            msg: 'Lista de personas obtenida exitosamente',
            data: personas
        });
    }
    catch (error) {
        console.error('Error en getPersonas:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de personas' });
    }
});
exports.getPersonas = getPersonas;
// READ - Listar personas registradas (no eliminadas)
const getPersonasRegistradas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personas = yield persona_model_1.default.findAll({
            where: {
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
        });
        res.json({
            msg: 'Personas registradas obtenidas exitosamente',
            data: personas
        });
    }
    catch (error) {
        console.error('Error en getPersonasRegistradas:', error);
        res.status(500).json({ msg: 'Error al obtener personas registradas' });
    }
});
exports.getPersonasRegistradas = getPersonasRegistradas;
// READ - Obtener persona por ID
const getPersonaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const persona = yield persona_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!persona) {
            res.status(404).json({ msg: 'Persona no encontrada' });
            return;
        }
        res.json({
            msg: 'Persona obtenida exitosamente',
            data: persona
        });
    }
    catch (error) {
        console.error('Error en getPersonaById:', error);
        res.status(500).json({ msg: 'Error al obtener la persona' });
    }
});
exports.getPersonaById = getPersonaById;
// READ - Verificar si existe una persona con el DNI
const verificarDni = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nroidentidad } = req.params;
    try {
        if (!nroidentidad) {
            res.status(400).json({
                msg: 'El número de identidad es requerido'
            });
            return;
        }
        const persona = yield persona_model_1.default.findOne({
            where: { nroidentidad },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (persona) {
            res.json({
                msg: 'El número de identidad ya existe',
                existe: true,
                data: persona
            });
        }
        else {
            res.json({
                msg: 'El número de identidad está disponible',
                existe: false
            });
        }
    }
    catch (error) {
        console.error('Error en verificarDni:', error);
        res.status(500).json({ msg: 'Error al verificar el número de identidad' });
    }
});
exports.verificarDni = verificarDni;
// UPDATE - Actualizar persona
const updatePersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idtipopersona, nombres, apellidos, idtipoidentidad, nroidentidad, correo, telefono } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID de la persona es obligatorio" });
            return;
        }
        const persona = yield persona_model_1.default.findByPk(id);
        if (!persona) {
            res.status(404).json({ msg: `No existe una persona con el id ${id}` });
            return;
        }
        // Validar número de identidad único
        if (nroidentidad && nroidentidad !== persona.nroidentidad) {
            const existingPersona = yield persona_model_1.default.findOne({ where: { nroidentidad } });
            if (existingPersona && existingPersona.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El número de identidad ya está en uso' });
                return;
            }
        }
        // Validar correo único
        if (correo && correo !== persona.correo) {
            const existingPersona = yield persona_model_1.default.findOne({ where: { correo } });
            if (existingPersona && existingPersona.id !== parseInt(id)) {
                res.status(400).json({ msg: 'El correo electrónico ya está en uso' });
                return;
            }
        }
        // Actualizar campos
        if (idtipopersona !== undefined)
            persona.idtipopersona = idtipopersona;
        if (nombres)
            persona.nombres = nombres;
        if (apellidos)
            persona.apellidos = apellidos;
        if (idtipoidentidad !== undefined)
            persona.idtipoidentidad = idtipoidentidad;
        if (nroidentidad !== undefined)
            persona.nroidentidad = nroidentidad;
        if (correo !== undefined)
            persona.correo = correo;
        if (telefono !== undefined)
            persona.telefono = telefono;
        // Cambiar estado a ACTUALIZADO
        persona.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        yield persona.save();
        // Obtener la persona actualizada con relación de estado
        const personaActualizada = yield persona_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Persona actualizada con éxito",
            data: personaActualizada
        });
    }
    catch (error) {
        console.error("Error en updatePersona:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updatePersona = updatePersona;
// DELETE - Eliminar persona (cambiar estado a eliminado)
const deletePersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const persona = yield persona_model_1.default.findByPk(id);
        if (!persona) {
            res.status(404).json({ msg: 'Persona no encontrada' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        persona.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        yield persona.save();
        res.json({
            msg: 'Persona eliminada con éxito',
            data: { id: persona.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deletePersona:', error);
        res.status(500).json({ msg: 'Error al eliminar la persona' });
    }
});
exports.deletePersona = deletePersona;
// READ - Listar personas eliminadas
const getPersonasEliminadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personas = yield persona_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
        });
        res.json({
            msg: 'Personas eliminadas obtenidas exitosamente',
            data: personas
        });
    }
    catch (error) {
        console.error('Error en getPersonasEliminadas:', error);
        res.status(500).json({ msg: 'Error al obtener personas eliminadas' });
    }
});
exports.getPersonasEliminadas = getPersonasEliminadas;
// UPDATE - Restaurar persona eliminada
const restaurarPersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const persona = yield persona_model_1.default.findByPk(id);
        if (!persona) {
            res.status(404).json({ msg: 'Persona no encontrada' });
            return;
        }
        // Cambiar estado a REGISTRADO
        persona.idestado = estados_constans_1.EstadoGeneral.REGISTRADO;
        yield persona.save();
        res.json({
            msg: 'Persona restaurada con éxito',
            data: { id: persona.id, estado: estados_constans_1.EstadoGeneral.REGISTRADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarPersona:', error);
        res.status(500).json({ msg: 'Error al restaurar la persona' });
    }
});
exports.restaurarPersona = restaurarPersona;
// READ - Listar clientes (tipo persona = 1 y no eliminados)
const listarClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield persona_model_1.default.findAll({
            where: {
                idtipopersona: 1, // Filtro por tipo de persona = 1 (clientes)
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO]
            },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
        });
        res.json({
            msg: 'Clientes obtenidos exitosamente',
            data: clientes
        });
    }
    catch (error) {
        console.error('Error en listarClientes:', error);
        res.status(500).json({ msg: 'Error al obtener clientes' });
    }
});
exports.listarClientes = listarClientes;
// READ - Buscar clientes para select/autocomplete
const buscarClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const qraw = req.query.q;
    const q = typeof qraw === "string" ? qraw.trim() : "";
    // Parámetros opcionales: limit (máx resultados)
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    try {
        if (!q) {
            res.status(400).json({ msg: "El parámetro q (búsqueda) es obligatorio" });
            return;
        }
        const like = `%${q}%`;
        const clientes = yield persona_model_1.default.findAll({
            where: {
                idtipopersona: 1, // solo clientes
                idestado: [estados_constans_1.EstadoGeneral.REGISTRADO, estados_constans_1.EstadoGeneral.ACTUALIZADO],
                [sequelize_1.Op.or]: [
                    { nombres: { [sequelize_1.Op.like]: like } },
                    { apellidos: { [sequelize_1.Op.like]: like } },
                    { nroidentidad: { [sequelize_1.Op.like]: like } },
                    { correo: { [sequelize_1.Op.like]: like } },
                    { telefono: { [sequelize_1.Op.like]: like } }
                ],
            },
            include: [
                {
                    model: estado_model_1.default,
                    as: "Estado",
                    attributes: ["id", "nombre"],
                    required: false,
                },
            ],
            order: [["apellidos", "ASC"], ["nombres", "ASC"]],
            limit, // ⬅️ limita resultados
        });
        res.json({
            msg: "Resultados de búsqueda de clientes obtenidos exitosamente",
            data: clientes,
        });
    }
    catch (error) {
        console.error("Error en buscarClientes:", error);
        res.status(500).json({ msg: "Error al buscar clientes" });
    }
});
exports.buscarClientes = buscarClientes;

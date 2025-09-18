"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurarMetodoPago = exports.deleteMetodoPago = exports.getMetodosPagoEliminados = exports.verificarNombreMetodoPago = exports.getMetodoPagoById = exports.getMetodosPagoRegistrados = exports.getMetodosPago = exports.updateMetodoPago = exports.createMetodoPago = void 0;
const metodo_pago_model_1 = __importDefault(require("../models/metodo_pago.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const sequelize_1 = require("sequelize");
// CREATE - Insertar nuevo método de pago
const createMetodoPago = async (req, res) => {
    const { nombre } = req.body;
    try {
        // Validaciones
        if (!nombre) {
            res.status(400).json({
                msg: 'El campo nombre es obligatorio'
            });
            return;
        }
        // Verificar si ya existe un método de pago con el mismo nombre (no eliminado)
        const metodoPagoExistente = await metodo_pago_model_1.default.findOne({
            where: {
                nombre,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            }
        });
        if (metodoPagoExistente) {
            res.status(400).json({
                msg: 'Ya existe un método de pago con ese nombre'
            });
            return;
        }
        // Crear nuevo método de pago
        const nuevoMetodoPago = await metodo_pago_model_1.default.create({
            nombre,
            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
        });
        // Obtener el método de pago creado con sus relaciones
        const metodoPagoCreado = await metodo_pago_model_1.default.findByPk(nuevoMetodoPago.id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Método de pago creado exitosamente',
            data: metodoPagoCreado
        });
    }
    catch (error) {
        console.error('Error en createMetodoPago:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};
exports.createMetodoPago = createMetodoPago;
// UPDATE - Actualizar método de pago
const updateMetodoPago = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del método de pago es obligatorio" });
            return;
        }
        const metodoPago = await metodo_pago_model_1.default.findByPk(id);
        if (!metodoPago) {
            res.status(404).json({ msg: `No existe un método de pago con el id ${id}` });
            return;
        }
        // Verificar si ya existe otro método de pago con el mismo nombre (no eliminado)
        if (nombre && nombre !== metodoPago.nombre) {
            const metodoPagoExistente = await metodo_pago_model_1.default.findOne({
                where: {
                    nombre,
                    id: { [sequelize_1.Op.ne]: id },
                    idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
                }
            });
            if (metodoPagoExistente) {
                res.status(400).json({
                    msg: 'Ya existe otro método de pago con ese nombre'
                });
                return;
            }
        }
        // Actualizar campos
        if (nombre)
            metodoPago.nombre = nombre;
        // Cambiar estado a ACTUALIZADO si no está eliminado
        if (metodoPago.idestado !== estados_constans_1.EstadoGeneral.ELIMINADO) {
            metodoPago.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        }
        await metodoPago.save();
        // Obtener el método de pago actualizado con relaciones
        const metodoPagoActualizado = await metodo_pago_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Método de pago actualizado con éxito",
            data: metodoPagoActualizado
        });
    }
    catch (error) {
        console.error("Error en updateMetodoPago:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
};
exports.updateMetodoPago = updateMetodoPago;
// READ - Listar todos los métodos de pago
const getMetodosPago = async (req, res) => {
    try {
        const metodosPago = await metodo_pago_model_1.default.findAll({
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Lista de métodos de pago obtenida exitosamente',
            data: metodosPago
        });
    }
    catch (error) {
        console.error('Error en getMetodosPago:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de métodos de pago' });
    }
};
exports.getMetodosPago = getMetodosPago;
// READ - Listar métodos de pago registrados/actualizados (no eliminados)
const getMetodosPagoRegistrados = async (req, res) => {
    try {
        const metodosPago = await metodo_pago_model_1.default.findAll({
            where: {
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Métodos de pago registrados obtenidos exitosamente',
            data: metodosPago
        });
    }
    catch (error) {
        console.error('Error en getMetodosPagoRegistrados:', error);
        res.status(500).json({ msg: 'Error al obtener métodos de pago registrados' });
    }
};
exports.getMetodosPagoRegistrados = getMetodosPagoRegistrados;
// READ - Obtener método de pago por ID
const getMetodoPagoById = async (req, res) => {
    const { id } = req.params;
    try {
        const metodoPago = await metodo_pago_model_1.default.findByPk(id, {
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!metodoPago) {
            res.status(404).json({ msg: 'Método de pago no encontrado' });
            return;
        }
        res.json({
            msg: 'Método de pago obtenido exitosamente',
            data: metodoPago
        });
    }
    catch (error) {
        console.error('Error en getMetodoPagoById:', error);
        res.status(500).json({ msg: 'Error al obtener el método de pago' });
    }
};
exports.getMetodoPagoById = getMetodoPagoById;
// READ - Verificar si existe un método de pago por nombre
const verificarNombreMetodoPago = async (req, res) => {
    const { nombre } = req.params;
    try {
        const metodoPago = await metodo_pago_model_1.default.findOne({
            where: {
                nombre,
                idestado: { [sequelize_1.Op.ne]: estados_constans_1.EstadoGeneral.ELIMINADO }
            }
        });
        res.json({
            existe: !!metodoPago,
            data: metodoPago
        });
    }
    catch (error) {
        console.error('Error en verificarNombreMetodoPago:', error);
        res.status(500).json({ msg: 'Error al verificar el nombre del método de pago' });
    }
};
exports.verificarNombreMetodoPago = verificarNombreMetodoPago;
// READ - Listar métodos de pago eliminados
const getMetodosPagoEliminados = async (req, res) => {
    try {
        const metodosPago = await metodo_pago_model_1.default.findAll({
            where: { idestado: estados_constans_1.EstadoGeneral.ELIMINADO },
            include: [
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({
            msg: 'Métodos de pago eliminados obtenidos exitosamente',
            data: metodosPago
        });
    }
    catch (error) {
        console.error('Error en getMetodosPagoEliminados:', error);
        res.status(500).json({ msg: 'Error al obtener métodos de pago eliminados' });
    }
};
exports.getMetodosPagoEliminados = getMetodosPagoEliminados;
// DELETE - Eliminar método de pago (cambiar estado a eliminado)
const deleteMetodoPago = async (req, res) => {
    const { id } = req.params;
    try {
        const metodoPago = await metodo_pago_model_1.default.findByPk(id);
        if (!metodoPago) {
            res.status(404).json({ msg: 'Método de pago no encontrado' });
            return;
        }
        // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
        metodoPago.idestado = estados_constans_1.EstadoGeneral.ELIMINADO;
        await metodoPago.save();
        res.json({
            msg: 'Método de pago eliminado con éxito',
            data: { id: metodoPago.id, estado: estados_constans_1.EstadoGeneral.ELIMINADO }
        });
    }
    catch (error) {
        console.error('Error en deleteMetodoPago:', error);
        res.status(500).json({ msg: 'Error al eliminar el método de pago' });
    }
};
exports.deleteMetodoPago = deleteMetodoPago;
// UPDATE - Restaurar método de pago eliminado
const restaurarMetodoPago = async (req, res) => {
    const { id } = req.params;
    try {
        const metodoPago = await metodo_pago_model_1.default.findByPk(id);
        if (!metodoPago) {
            res.status(404).json({ msg: 'Método de pago no encontrado' });
            return;
        }
        // Cambiar estado a ACTUALIZADO
        metodoPago.idestado = estados_constans_1.EstadoGeneral.ACTUALIZADO;
        await metodoPago.save();
        res.json({
            msg: 'Método de pago restaurado con éxito',
            data: { id: metodoPago.id, estado: estados_constans_1.EstadoGeneral.ACTUALIZADO }
        });
    }
    catch (error) {
        console.error('Error en restaurarMetodoPago:', error);
        res.status(500).json({ msg: 'Error al restaurar el método de pago' });
    }
};
exports.restaurarMetodoPago = restaurarMetodoPago;

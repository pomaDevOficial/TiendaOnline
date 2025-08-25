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
exports.restaurarPedido = exports.getPedidosCancelados = exports.deletePedido = exports.cambiarEstadoPedido = exports.getPedidosByPersona = exports.getPedidoById = exports.getPedidosByEstado = exports.getPedidos = exports.updatePedido = exports.createPedido = void 0;
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const metodo_pago_model_1 = __importDefault(require("../models/metodo_pago.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
// CREATE - Insertar nuevo pedido
const createPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto } = req.body;
    try {
        // Validaciones
        if (!idpersona || !idmetodopago || totalimporte === undefined) {
            res.status(400).json({
                msg: 'Los campos idpersona, idmetodopago y totalimporte son obligatorios'
            });
            return;
        }
        // Verificar si existe la persona
        const persona = yield persona_model_1.default.findByPk(idpersona);
        if (!persona) {
            res.status(400).json({ msg: 'La persona no existe' });
            return;
        }
        // Verificar si existe el método de pago
        const metodoPago = yield metodo_pago_model_1.default.findByPk(idmetodopago);
        if (!metodoPago) {
            res.status(400).json({ msg: 'El método de pago no existe' });
            return;
        }
        // Crear nuevo pedido
        const nuevoPedido = yield pedido_model_1.default.create({
            idpersona,
            idmetodopago,
            fechaoperacion: fechaoperacion || new Date(),
            totalimporte,
            adjunto: adjunto || null,
            idestado: estados_constans_1.PedidoEstado.EN_ESPERA
        });
        // Obtener el pedido creado con sus relaciones
        const pedidoCreado = yield pedido_model_1.default.findByPk(nuevoPedido.id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.status(201).json({
            msg: 'Pedido creado exitosamente',
            data: pedidoCreado
        });
    }
    catch (error) {
        console.error('Error en createPedido:', error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
});
exports.createPedido = createPedido;
// UPDATE - Actualizar pedido
const updatePedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto, idestado } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del pedido es obligatorio" });
            return;
        }
        const pedido = yield pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: `No existe un pedido con el id ${id}` });
            return;
        }
        // Verificar si existe la persona (si se está actualizando)
        if (idpersona) {
            const persona = yield persona_model_1.default.findByPk(idpersona);
            if (!persona) {
                res.status(400).json({ msg: 'La persona no existe' });
                return;
            }
        }
        // Verificar si existe el método de pago (si se está actualizando)
        if (idmetodopago) {
            const metodoPago = yield metodo_pago_model_1.default.findByPk(idmetodopago);
            if (!metodoPago) {
                res.status(400).json({ msg: 'El método de pago no existe' });
                return;
            }
        }
        // Validar estado (si se está actualizando)
        if (idestado && !Object.values(estados_constans_1.PedidoEstado).includes(idestado)) {
            res.status(400).json({
                msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)'
            });
            return;
        }
        // Actualizar campos
        if (idpersona)
            pedido.idpersona = idpersona;
        if (idmetodopago)
            pedido.idmetodopago = idmetodopago;
        if (fechaoperacion)
            pedido.fechaoperacion = fechaoperacion;
        if (totalimporte !== undefined)
            pedido.totalimporte = totalimporte;
        if (adjunto !== undefined)
            pedido.adjunto = adjunto;
        if (idestado)
            pedido.idestado = idestado;
        yield pedido.save();
        // Obtener el pedido actualizado con relaciones
        const pedidoActualizado = yield pedido_model_1.default.findByPk(id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        res.json({
            msg: "Pedido actualizado con éxito",
            data: pedidoActualizado
        });
    }
    catch (error) {
        console.error("Error en updatePedido:", error);
        res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
    }
});
exports.updatePedido = updatePedido;
// READ - Listar todos los pedidos
const getPedidos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pedidos = yield pedido_model_1.default.findAll({
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechaoperacion', 'DESC']]
        });
        res.json({
            msg: 'Lista de pedidos obtenida exitosamente',
            data: pedidos
        });
    }
    catch (error) {
        console.error('Error en getPedidos:', error);
        res.status(500).json({ msg: 'Error al obtener la lista de pedidos' });
    }
});
exports.getPedidos = getPedidos;
// READ - Listar pedidos por estado
const getPedidosByEstado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estado } = req.params;
    try {
        const pedidos = yield pedido_model_1.default.findAll({
            where: { idestado: estado },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechaoperacion', 'DESC']]
        });
        res.json({
            msg: `Pedidos con estado ${estado} obtenidos exitosamente`,
            data: pedidos
        });
    }
    catch (error) {
        console.error('Error en getPedidosByEstado:', error);
        res.status(500).json({ msg: 'Error al obtener pedidos por estado' });
    }
});
exports.getPedidosByEstado = getPedidosByEstado;
// READ - Obtener pedido por ID
const getPedidoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pedido = yield pedido_model_1.default.findByPk(id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ]
        });
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        res.json({
            msg: 'Pedido obtenido exitosamente',
            data: pedido
        });
    }
    catch (error) {
        console.error('Error en getPedidoById:', error);
        res.status(500).json({ msg: 'Error al obtener el pedido' });
    }
});
exports.getPedidoById = getPedidoById;
// READ - Obtener pedidos por persona
const getPedidosByPersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpersona } = req.params;
    try {
        const pedidos = yield pedido_model_1.default.findAll({
            where: { idpersona },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                },
                {
                    model: estado_model_1.default,
                    as: 'Estado',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechaoperacion', 'DESC']]
        });
        res.json({
            msg: 'Pedidos de la persona obtenidos exitosamente',
            data: pedidos
        });
    }
    catch (error) {
        console.error('Error en getPedidosByPersona:', error);
        res.status(500).json({ msg: 'Error al obtener pedidos de la persona' });
    }
});
exports.getPedidosByPersona = getPedidosByPersona;
// UPDATE - Cambiar estado del pedido
const cambiarEstadoPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        if (!estado || !Object.values(estados_constans_1.PedidoEstado).includes(estado)) {
            res.status(400).json({
                msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)'
            });
            return;
        }
        const pedido = yield pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        pedido.idestado = estado;
        yield pedido.save();
        res.json({
            msg: 'Estado del pedido actualizado con éxito',
            data: { id: pedido.id, estado }
        });
    }
    catch (error) {
        console.error('Error en cambiarEstadoPedido:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado del pedido' });
    }
});
exports.cambiarEstadoPedido = cambiarEstadoPedido;
// DELETE - Eliminar pedido (cambiar estado a cancelado)
const deletePedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pedido = yield pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        // Cambiar estado a CANCELADO en lugar de eliminar físicamente
        pedido.idestado = estados_constans_1.PedidoEstado.CANCELADO;
        yield pedido.save();
        res.json({
            msg: 'Pedido cancelado con éxito',
            data: { id: pedido.id, estado: estados_constans_1.PedidoEstado.CANCELADO }
        });
    }
    catch (error) {
        console.error('Error en deletePedido:', error);
        res.status(500).json({ msg: 'Error al cancelar el pedido' });
    }
});
exports.deletePedido = deletePedido;
// READ - Listar pedidos cancelados
const getPedidosCancelados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pedidos = yield pedido_model_1.default.findAll({
            where: { idestado: estados_constans_1.PedidoEstado.CANCELADO },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
                },
                {
                    model: metodo_pago_model_1.default,
                    as: 'MetodoPago',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['fechaoperacion', 'DESC']]
        });
        res.json({
            msg: 'Pedidos cancelados obtenidos exitosamente',
            data: pedidos
        });
    }
    catch (error) {
        console.error('Error en getPedidosCancelados:', error);
        res.status(500).json({ msg: 'Error al obtener pedidos cancelados' });
    }
});
exports.getPedidosCancelados = getPedidosCancelados;
// UPDATE - Restaurar pedido cancelado
const restaurarPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pedido = yield pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        // Cambiar estado a EN_ESPERA
        pedido.idestado = estados_constans_1.PedidoEstado.EN_ESPERA;
        yield pedido.save();
        res.json({
            msg: 'Pedido restaurado con éxito',
            data: { id: pedido.id, estado: estados_constans_1.PedidoEstado.EN_ESPERA }
        });
    }
    catch (error) {
        console.error('Error en restaurarPedido:', error);
        res.status(500).json({ msg: 'Error al restaurar el pedido' });
    }
});
exports.restaurarPedido = restaurarPedido;

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
exports.aprobarPedido = exports.restaurarPedido = exports.getPedidosCancelados = exports.deletePedido = exports.cambiarEstadoPedido = exports.getPedidosByPersona = exports.getPedidoById = exports.getPedidosByEstado = exports.getPedidos = exports.updatePedido = exports.createPedido = void 0;
const pedido_model_1 = __importDefault(require("../models/pedido.model"));
const persona_model_1 = __importDefault(require("../models/persona.model"));
const metodo_pago_model_1 = __importDefault(require("../models/metodo_pago.model"));
const estado_model_1 = __importDefault(require("../models/estado.model"));
const estados_constans_1 = require("../estadosTablas/estados.constans");
const comprobante_model_1 = __importDefault(require("../models/comprobante.model"));
const tipo_comprobante_model_1 = __importDefault(require("../models/tipo_comprobante.model"));
const venta_model_1 = __importDefault(require("../models/venta.model"));
const lote_talla_model_1 = __importDefault(require("../models/lote_talla.model"));
const pedido_detalle_model_1 = __importDefault(require("../models/pedido_detalle.model"));
const detalle_venta_model_1 = __importDefault(require("../models/detalle_venta.model"));
const movimiento_lote_model_1 = __importDefault(require("../models/movimiento_lote.model"));
const connection_db_1 = __importDefault(require("../db/connection.db"));
const wsp_controller_1 = require("./wsp.controller");
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
            idestado: estados_constans_1.PedidoEstado.EN_ESPERA,
            esWeb: 1
        });
        // Obtener el pedido creado con sus relaciones
        const pedidoCreado = yield pedido_model_1.default.findByPk(nuevoPedido.id, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
            where: {
                esWeb: 1
            },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
            where: { idestado: estado,
                esWeb: 1
            },
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona',
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
                    attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono', 'correo']
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
const aprobarPedido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { idPedido } = req.body;
    try {
        // Validaciones
        if (!idPedido) {
            res.status(400).json({ msg: 'El ID del pedido es obligatorio' });
            return;
        }
        // Buscar el pedido por ID con la persona
        const pedido = yield pedido_model_1.default.findByPk(idPedido, {
            include: [
                {
                    model: persona_model_1.default,
                    as: 'Persona'
                }
            ]
        });
        if (!pedido) {
            res.status(400).json({ msg: 'El pedido no existe' });
            return;
        }
        // Verificar que el pedido esté en estado EN_ESPERA
        if (pedido.idestado !== estados_constans_1.PedidoEstado.EN_ESPERA) {
            res.status(400).json({
                msg: `El pedido no puede ser aprobado. Estado actual: ${pedido.idestado}`
            });
            return;
        }
        // Obtener los detalles del pedido
        const detallesPedido = yield pedido_detalle_model_1.default.findAll({
            where: { idpedido: idPedido },
            include: [
                {
                    model: lote_talla_model_1.default,
                    as: 'LoteTalla'
                }
            ]
        });
        if (!detallesPedido || detallesPedido.length === 0) {
            res.status(400).json({ msg: 'El pedido no tiene detalles' });
            return;
        }
        // Iniciar transacción
        const transaction = yield connection_db_1.default.transaction();
        try {
            // 1. Actualizar estado del pedido a PAGADO
            yield pedido.update({
                idestado: estados_constans_1.PedidoEstado.PAGADO
            }, { transaction });
            // 2. Crear la venta
            const nuevaVenta = yield venta_model_1.default.create({
                fechaventa: new Date(),
                idusuario: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                idpedido: pedido.id,
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            }, { transaction });
            // 3. Crear detalles de venta y actualizar stock
            for (const detallePedido of detallesPedido) {
                // Crear detalle de venta
                yield detalle_venta_model_1.default.create({
                    idpedidodetalle: detallePedido.id,
                    idventa: nuevaVenta.id,
                    precio_venta_real: detallePedido.precio,
                    subtotal_real: detallePedido.subtotal,
                    idestado: estados_constans_1.EstadoGeneral.REGISTRADO
                }, { transaction });
                // Actualizar stock solo si tiene lote_talla válido
                if (detallePedido.idlote_talla && detallePedido.cantidad) {
                    const loteTalla = yield lote_talla_model_1.default.findByPk(detallePedido.idlote_talla, { transaction });
                    if (loteTalla && loteTalla.stock !== null) {
                        const nuevoStock = Number(loteTalla.stock) - Number(detallePedido.cantidad);
                        yield loteTalla.update({
                            stock: nuevoStock,
                            idestado: nuevoStock > 0 ? estados_constans_1.LoteEstado.DISPONIBLE : estados_constans_1.LoteEstado.AGOTADO
                        }, { transaction });
                        // Registrar movimiento de lote
                        yield movimiento_lote_model_1.default.create({
                            idlote_talla: detallePedido.idlote_talla,
                            tipomovimiento: estados_constans_1.TipoMovimientoLote.SALIDA,
                            cantidad: detallePedido.cantidad,
                            fechamovimiento: new Date(),
                            idestado: estados_constans_1.EstadoGeneral.REGISTRADO
                        }, { transaction });
                    }
                }
            }
            // 4. Determinar el tipo de comprobante
            let idTipoComprobante;
            if (pedido.Persona && pedido.Persona.idtipopersona === 2) {
                idTipoComprobante = 2; // FACTURA
            }
            else {
                idTipoComprobante = 1; // BOLETA
            }
            // 5. Crear comprobante
            const tipoComprobante = yield tipo_comprobante_model_1.default.findByPk(idTipoComprobante, { transaction });
            if (!tipoComprobante) {
                throw new Error('Tipo de comprobante no encontrado');
            }
            // Calcular IGV (18% del total)
            const total = Number(pedido.totalimporte) || 0;
            const igv = total * 0.18;
            const nuevoComprobante = yield comprobante_model_1.default.create({
                idventa: nuevaVenta.id,
                igv: igv,
                descuento: 0,
                total: total,
                idtipocomprobante: tipoComprobante.id,
                numserie: yield generarNumeroSerieUnico(tipoComprobante.id, transaction),
                idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
            }, { transaction });
            // Confirmar transacción
            yield transaction.commit();
            // Obtener datos completos para respuesta
            const ventaCompleta = yield venta_model_1.default.findByPk(nuevaVenta.id, {
                include: [
                    {
                        model: pedido_model_1.default,
                        as: 'Pedido',
                        include: [
                            {
                                model: persona_model_1.default,
                                as: 'Persona'
                            }
                        ]
                    }
                ]
            });
            const comprobanteCompleto = yield comprobante_model_1.default.findByPk(nuevoComprobante.id, {
                include: [
                    {
                        model: tipo_comprobante_model_1.default,
                        as: 'TipoComprobante'
                    },
                    {
                        model: venta_model_1.default,
                        as: 'Venta'
                    }
                ]
            });
            const detallesVenta = yield detalle_venta_model_1.default.findAll({
                where: { idventa: nuevaVenta.id },
                include: [
                    {
                        model: pedido_detalle_model_1.default,
                        as: 'PedidoDetalle',
                        include: [
                            {
                                model: lote_talla_model_1.default,
                                as: 'LoteTalla'
                            }
                        ]
                    }
                ]
            });
            // Generar el PDF del comprobante SOLO si el teléfono es válido
            const telefono = (_c = (_b = pedido === null || pedido === void 0 ? void 0 : pedido.Persona) === null || _b === void 0 ? void 0 : _b.telefono) !== null && _c !== void 0 ? _c : '';
            const phoneRegex = /^\d{9,15}$/; // valida de 9 a 15 dígitos
            if (telefono && phoneRegex.test(telefono)) {
                // Generar PDF
                const nombreArchivo = yield (0, wsp_controller_1.generarPDFComprobante)(comprobanteCompleto, ventaCompleta, pedido, detallesVenta);
                // Enviar por WhatsApp
                yield (0, wsp_controller_1.enviarArchivoWSP)(telefono, nombreArchivo, `📄 ${((_d = comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.TipoComprobante) === null || _d === void 0 ? void 0 : _d.nombre) || 'Comprobante'} ${comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.numserie}`);
                res.status(200).json({
                    msg: 'Pedido aprobado exitosamente y comprobante enviado',
                    data: {
                        pedido,
                        venta: ventaCompleta,
                        comprobante: comprobanteCompleto,
                        detallesVenta
                    }
                });
            }
            else {
                res.status(200).json({
                    msg: 'Pedido aprobado exitosamente (sin envío por WhatsApp: número no válido)',
                    data: {
                        pedido,
                        venta: ventaCompleta,
                        comprobante: comprobanteCompleto,
                        detallesVenta
                    }
                });
            }
        }
        catch (error) {
            // Revertir transacción en caso de error
            yield transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        console.error('Error en aprobarPedido:', error);
        res.status(500).json({
            msg: 'Ocurrió un error al aprobar el pedido',
            error: error.message
        });
    }
});
exports.aprobarPedido = aprobarPedido;
// Función para generar número de serie único
const generarNumeroSerieUnico = (idTipoComprobante, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const tipoComprobante = yield tipo_comprobante_model_1.default.findByPk(idTipoComprobante, {
        include: [{ model: connection_db_1.default.models.TipoSerie, as: 'TipoSerie' }],
        transaction
    });
    if (!tipoComprobante || !tipoComprobante.TipoSerie) {
        throw new Error('Tipo de comprobante o serie no encontrado');
    }
    // Obtener el último comprobante de este tipo
    const ultimoComprobante = yield comprobante_model_1.default.findOne({
        where: { idtipocomprobante: idTipoComprobante },
        order: [['id', 'DESC']],
        transaction
    });
    let siguienteNumero = 1;
    if (ultimoComprobante && ultimoComprobante.numserie) {
        // Extraer el número del último comprobante e incrementarlo
        const partes = ultimoComprobante.numserie.split('-');
        if (partes.length > 1) {
            const ultimoNumero = parseInt(partes[1]) || 0;
            siguienteNumero = ultimoNumero + 1;
        }
    }
    // Formato: [SERIE]-[NÚMERO]
    return `${tipoComprobante.TipoSerie.nombre}-${siguienteNumero.toString().padStart(8, '0')}`;
});

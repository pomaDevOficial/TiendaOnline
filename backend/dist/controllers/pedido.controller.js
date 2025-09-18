"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aprobarPedido = exports.restaurarPedido = exports.getPedidosCancelados = exports.deletePedido = exports.cambiarEstadoPedido = exports.getPedidosByPersona = exports.getPedidoById = exports.getPedidosByEstado = exports.getPedidos = exports.updatePedido = exports.createPedido = exports.crearPedidoConComprobante = void 0;
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
const moment_1 = __importDefault(require("moment"));
//CREAR PEDIDO WEB
// export const crearPedidoConComprobante = async (req: Request, res: Response): Promise<void> => {
//     const { persona, metodoPago, productos, total, idusuario, fechaventa } = req.body;
//     console.log(persona)
//     const file = req.file;
//     const {nroidentidad, correo, nombres, telefono, apellidos}: Persona = persona;
//     var cli;
//     var esCliente = false;
//     if (nroidentidad) {
//       const existingPersona = await Persona.findOne({ where: { nroidentidad } });
//       if (existingPersona) {
//          cli= existingPersona;
//          esCliente = true;
//         res.status(400).json({ msg: 'El número de identidad ya existe' });
//         return;
//       }
//     }
//      // Verificar si el correo ya existe
//     if (correo) {
//       const existingPersona = await Persona.findOne({ where: { correo } });
//       if (existingPersona && esCliente == false) {
//         res.status(400).json({ msg: 'El correo electrónico ya existe' });
//         return;
//       }
//     }
// if(esCliente == false){
//    const cliente: any = await Persona.create({
//       idtipopersona: 1,
//       nombres,
//       apellidos,
//       idtipoidentidad: 1 ,
//       nroidentidad: nroidentidad || null,
//       correo: correo || null,
//       telefono: telefono || null,
//       idestado: EstadoGeneral.REGISTRADO
//     });
//   cli= cliente
// }
//   // 0) VALIDACIONES BÁSICAS
//   if (!cli?.id || !metodoPago?.id || !Array.isArray(productos) || productos.length === 0) {
//     res.status(400).json({ msg: 'cliente.id, metodoPago.id y productos[] son obligatorios' });
//     return;
//   }
//   if (!idusuario && !(req as any).user?.id) {
//     res.status(400).json({ msg: 'idusuario es obligatorio (o debe venir en req.user)' });
//     return;
//   }
//    if (!file) {
//       res.status(400).json({ msg: "La imagen es obligatoria" });
//       return;
//     } 
//   const transaction = await db.transaction();
//   const imagePath = `${file.filename}`;
//   try {
//     // 1) CREAR PEDIDO (cabecera)
//     const pedido = await Pedido.create({
//       idpersona: cli.id,
//       idmetodopago: metodoPago.id,
//       adjunto: imagePath,
//       esWeb: 1,
//       fechaoperacion: new Date(),
//       totalimporte: Number(total) || 0,
//       idestado: PedidoEstado.EN_ESPERA
//     }, { transaction });
//     // 2) DETALLES DE PEDIDO + DESCUENTO DE STOCK (ATÓMICO Y CONCURRENTE)
//     const pedidoDetalles: PedidoDetalle[] = [];
//     for (const p of productos) {
//       const { loteTalla, cantidad, precio, subtotal } = p;
//       if (!loteTalla?.id || cantidad == null || precio == null) {
//         throw new Error('Cada producto debe incluir loteTalla.id, cantidad y precio');
//       }
//       const cantidadNum = Number(cantidad);
//       const precioNum = Number(precio);
//       const subtotalNum = subtotal != null ? Number(subtotal) : cantidadNum * precioNum;
//       // 🔐 Descontar stock atómicamente
//       const [results, metadata] = await db.query(
//             `
//             UPDATE lote_talla
//             SET stock = stock - :cantidad
//             WHERE id = :id AND stock >= :cantidad
//             `,
//             {
//               replacements: { id: loteTalla.id, cantidad: cantidadNum },
//               transaction
//             }
//           ) as [any, { affectedRows: number }];
//       // Validar que se haya actualizado (stock suficiente)
//       if (((metadata as any).rowCount ?? (metadata as any).affectedRows) === 0) {
//         throw new Error(`Stock insuficiente para LoteTalla ${loteTalla.id}`);
//       }
//       // Crear detalle de pedido
//       const det = await PedidoDetalle.create({
//         idpedido: pedido.id,
//         idlote_talla: loteTalla.id,
//         cantidad: cantidadNum,
//         precio: precioNum,
//         subtotal: subtotalNum
//       }, { transaction });
//       pedidoDetalles.push(det);
//       // Registrar movimiento de salida
//       await MovimientoLote.create({
//         idlote_talla: loteTalla.id,
//         tipomovimiento: TipoMovimientoLote.SALIDA,
//         cantidad: cantidadNum,
//         fechamovimiento: moment().tz("America/Lima").toDate(),
//         idestado: EstadoGeneral.REGISTRADO
//       }, { transaction });
//     }
//     // 8) GENERAR PDF Y ENVIAR POR WHATSAPP
//     const telefonoRaw = cli?.telefono;
//     const telefono = String(telefonoRaw).replace(/\D/g, ''); // solo dígitos
//     const phoneRegex = /^\d{9,15}$/;
//     if (telefono && phoneRegex.test(telefono)) {
//       try {
//         const resultadoEnvio = await enviarMensajePedido(
//           telefono, 'Se envia la informacion '
//         );
//         if (!resultadoEnvio.success) {
//           throw new Error(resultadoEnvio.error || 'Error desconocido al enviar WhatsApp');
//         }
//         res.status(201).json({
//           msg: 'Venta, detalles y comprobante creados y enviados exitosamente por WhatsApp',
//         });
//         return;
//       } catch (err) {
//         console.error('Error al generar/enviar comprobante por WhatsApp:', err);
//         // seguimos igual, no rompemos la venta
//       }
//     }
//     // RESPUESTA FINAL
//     res.status(201).json({
//       msg: `Venta, detalles y comprobante creados exitosamente${telefono ? ' (intento de envío por WhatsApp)' : ''}`,
//     });
//   }catch (error) {
//     await transaction.rollback();
//     console.error('Error en crearVentaCompletaConComprobante:', error);
//     res.status(500).json({
//       msg: 'Ocurrió un error al crear la venta completa',
//       error: (error as Error).message
//     });
//   }
// };
// controllers/PedidoController.ts
const crearPedidoConComprobante = async (req, res) => {
    var _a;
    console.log("hola");
    const transaction = await connection_db_1.default.transaction();
    try {
        // 1) Parsear datos (porque vienen en FormData como string JSON)
        const personaObj = JSON.parse(req.body.persona);
        console.log(personaObj);
        const metodoPagoObj = JSON.parse(req.body.metodoPago);
        const productosArr = JSON.parse(req.body.productos);
        const total = Number(req.body.total);
        const idusuario = req.body.idusuario;
        const file = req.file;
        if (!file) {
            res.status(400).json({ msg: "La imagen es obligatoria" });
            return;
        }
        const { nroidentidad, correo, nombres, telefono, apellidos } = personaObj;
        // 2) Validar duplicados
        var cli;
        var esCliente = false;
        if (nroidentidad) {
            const existing = await persona_model_1.default.findOne({ where: { nroidentidad } });
            if (existing) {
                cli = existing;
                esCliente = true;
                // res.status(400).json({ msg: "El número de identidad ya existe" });
                // return;
            }
        }
        if (correo) {
            const existing = await persona_model_1.default.findOne({ where: { correo } });
            if (existing && esCliente == false) {
                res.status(400).json({ msg: "El correo electrónico ya existe" });
                return;
            }
        }
        if (esCliente == false) {
            const cliente = await persona_model_1.default.create({
                idtipopersona: 1,
                nombres,
                apellidos,
                idtipoidentidad: 1,
                nroidentidad: nroidentidad || null,
                correo: correo || null,
                telefono: telefono || null,
                idestado: estados_constans_1.EstadoGeneral.REGISTRADO
            }, { transaction });
            cli = cliente;
        }
        // 3) Crear cliente
        // 4) Crear pedido
        const pedido = await pedido_model_1.default.create({
            idpersona: cli.id,
            idmetodopago: metodoPagoObj.id,
            adjunto: file.filename,
            esWeb: 1,
            fechaoperacion: new Date(),
            totalimporte: total,
            idestado: estados_constans_1.PedidoEstado.EN_ESPERA
        }, { transaction });
        // 5) Detalles + stock
        for (const p of productosArr) {
            const { loteTalla, cantidad, precio, subtotal } = p;
            const cantidadNum = Number(cantidad);
            const precioNum = Number(precio);
            const subtotalNum = subtotal != null ? Number(subtotal) : cantidadNum * precioNum;
            // Descontar stock
            const [results, metadata] = await connection_db_1.default.query(`
        UPDATE lote_talla
        SET stock = stock - :cantidad
        WHERE id = :id AND stock >= :cantidad
        `, {
                replacements: { id: loteTalla.id, cantidad: cantidadNum },
                transaction
            });
            if (((_a = metadata.rowCount) !== null && _a !== void 0 ? _a : metadata.affectedRows) === 0) {
                throw new Error(`Stock insuficiente para LoteTalla ${loteTalla.id}`);
            }
            // Crear detalle
            await pedido_detalle_model_1.default.create({
                idpedido: pedido.id,
                idlote_talla: loteTalla.id,
                cantidad: cantidadNum,
                precio: precioNum,
                subtotal: subtotalNum
            }, { transaction });
            // Registrar movimiento
            await movimiento_lote_model_1.default.create({
                idlote_talla: loteTalla.id,
                tipomovimiento: estados_constans_1.TipoMovimientoLote.SALIDA,
                cantidad: cantidadNum,
                fechamovimiento: (0, moment_1.default)().tz("America/Lima").toDate(),
                idestado: estados_constans_1.EstadoGeneral.REGISTRADO
            }, { transaction });
        }
        await transaction.commit();
        // 6) Enviar WhatsApp
        let telefonoParsed = String((cli === null || cli === void 0 ? void 0 : cli.telefono) || "").replace(/\D/g, "");
        if (telefonoParsed.length === 9)
            telefonoParsed = "51" + telefonoParsed;
        if (telefonoParsed) {
            const resultadoEnvio = await (0, wsp_controller_1.enviarMensajePedido)(telefonoParsed, `Hola ${cli.nombres}, tu pedido fue registrado con éxito. Total: S/ ${total}`);
            if (!resultadoEnvio.success) {
                console.error("Error WhatsApp:", resultadoEnvio.error);
            }
        }
        res.status(201).json({
            msg: "Venta, detalles y comprobante creados correctamente"
        });
    }
    catch (error) {
        await transaction.rollback();
        console.error("Error en crearPedidoConComprobante:", error);
        res.status(500).json({
            msg: "Ocurrió un error al crear el pedido",
            error: error.message
        });
    }
};
exports.crearPedidoConComprobante = crearPedidoConComprobante;
// CREATE - Insertar nuevo pedido
const createPedido = async (req, res) => {
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
        const persona = await persona_model_1.default.findByPk(idpersona);
        if (!persona) {
            res.status(400).json({ msg: 'La persona no existe' });
            return;
        }
        // Verificar si existe el método de pago
        const metodoPago = await metodo_pago_model_1.default.findByPk(idmetodopago);
        if (!metodoPago) {
            res.status(400).json({ msg: 'El método de pago no existe' });
            return;
        }
        // Crear nuevo pedido
        const nuevoPedido = await pedido_model_1.default.create({
            idpersona,
            idmetodopago,
            fechaoperacion: fechaoperacion || new Date(),
            totalimporte,
            adjunto: adjunto || null,
            idestado: estados_constans_1.PedidoEstado.EN_ESPERA,
            esWeb: 1
        });
        // Obtener el pedido creado con sus relaciones
        const pedidoCreado = await pedido_model_1.default.findByPk(nuevoPedido.id, {
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
};
exports.createPedido = createPedido;
// UPDATE - Actualizar pedido
const updatePedido = async (req, res) => {
    const { id } = req.params;
    const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto, idestado } = req.body;
    try {
        if (!id) {
            res.status(400).json({ msg: "El ID del pedido es obligatorio" });
            return;
        }
        const pedido = await pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: `No existe un pedido con el id ${id}` });
            return;
        }
        // Verificar si existe la persona (si se está actualizando)
        if (idpersona) {
            const persona = await persona_model_1.default.findByPk(idpersona);
            if (!persona) {
                res.status(400).json({ msg: 'La persona no existe' });
                return;
            }
        }
        // Verificar si existe el método de pago (si se está actualizando)
        if (idmetodopago) {
            const metodoPago = await metodo_pago_model_1.default.findByPk(idmetodopago);
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
        await pedido.save();
        // Obtener el pedido actualizado con relaciones
        const pedidoActualizado = await pedido_model_1.default.findByPk(id, {
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
};
exports.updatePedido = updatePedido;
// READ - Listar todos los pedidos
const getPedidos = async (req, res) => {
    try {
        const pedidos = await pedido_model_1.default.findAll({
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
};
exports.getPedidos = getPedidos;
// READ - Listar pedidos por estado
const getPedidosByEstado = async (req, res) => {
    const { estado } = req.params;
    try {
        const pedidos = await pedido_model_1.default.findAll({
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
};
exports.getPedidosByEstado = getPedidosByEstado;
// READ - Obtener pedido por ID
const getPedidoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pedido = await pedido_model_1.default.findByPk(id, {
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
};
exports.getPedidoById = getPedidoById;
// READ - Obtener pedidos por persona
const getPedidosByPersona = async (req, res) => {
    const { idpersona } = req.params;
    try {
        const pedidos = await pedido_model_1.default.findAll({
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
};
exports.getPedidosByPersona = getPedidosByPersona;
// UPDATE - Cambiar estado del pedido
const cambiarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        if (!estado || !Object.values(estados_constans_1.PedidoEstado).includes(estado)) {
            res.status(400).json({
                msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)'
            });
            return;
        }
        const pedido = await pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        pedido.idestado = estado;
        await pedido.save();
        res.json({
            msg: 'Estado del pedido actualizado con éxito',
            data: { id: pedido.id, estado }
        });
    }
    catch (error) {
        console.error('Error en cambiarEstadoPedido:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado del pedido' });
    }
};
exports.cambiarEstadoPedido = cambiarEstadoPedido;
// DELETE - Eliminar pedido (cambiar estado a cancelado)
const deletePedido = async (req, res) => {
    const { id } = req.params;
    try {
        const pedido = await pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        // Cambiar estado a CANCELADO en lugar de eliminar físicamente
        pedido.idestado = estados_constans_1.PedidoEstado.CANCELADO;
        await pedido.save();
        res.json({
            msg: 'Pedido cancelado con éxito',
            data: { id: pedido.id, estado: estados_constans_1.PedidoEstado.CANCELADO }
        });
    }
    catch (error) {
        console.error('Error en deletePedido:', error);
        res.status(500).json({ msg: 'Error al cancelar el pedido' });
    }
};
exports.deletePedido = deletePedido;
// READ - Listar pedidos cancelados
const getPedidosCancelados = async (req, res) => {
    try {
        const pedidos = await pedido_model_1.default.findAll({
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
};
exports.getPedidosCancelados = getPedidosCancelados;
// UPDATE - Restaurar pedido cancelado
const restaurarPedido = async (req, res) => {
    const { id } = req.params;
    try {
        const pedido = await pedido_model_1.default.findByPk(id);
        if (!pedido) {
            res.status(404).json({ msg: 'Pedido no encontrado' });
            return;
        }
        // Cambiar estado a EN_ESPERA
        pedido.idestado = estados_constans_1.PedidoEstado.EN_ESPERA;
        await pedido.save();
        res.json({
            msg: 'Pedido restaurado con éxito',
            data: { id: pedido.id, estado: estados_constans_1.PedidoEstado.EN_ESPERA }
        });
    }
    catch (error) {
        console.error('Error en restaurarPedido:', error);
        res.status(500).json({ msg: 'Error al restaurar el pedido' });
    }
};
exports.restaurarPedido = restaurarPedido;
const aprobarPedido = async (req, res) => {
    var _a, _b, _c;
    const { id } = req.params;
    try {
        // Validaciones
        if (!id) {
            res.status(400).json({ msg: 'El ID del pedido es obligatorio' });
            return;
        }
        // Buscar el pedido por ID con la persona
        const pedido = await pedido_model_1.default.findByPk(id, {
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
        const detallesPedido = await pedido_detalle_model_1.default.findAll({
            where: { idpedido: id },
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
        const transaction = await connection_db_1.default.transaction();
        try {
            // 1. Actualizar estado del pedido a PAGADO
            await pedido.update({
                idestado: estados_constans_1.PedidoEstado.PAGADO
            }, { transaction });
            // 2. Crear la venta
            const nuevaVenta = await venta_model_1.default.create({
                fechaventa: new Date(),
                idusuario: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                idpedido: pedido.id,
                idestado: estados_constans_1.VentaEstado.REGISTRADO
            }, { transaction });
            // 3. Crear detalles de venta y actualizar stock
            for (const detallePedido of detallesPedido) {
                // Crear detalle de venta
                await detalle_venta_model_1.default.create({
                    idpedidodetalle: detallePedido.id,
                    idventa: nuevaVenta.id,
                    precio_venta_real: detallePedido.precio,
                    subtotal_real: detallePedido.subtotal,
                    idestado: estados_constans_1.EstadoGeneral.REGISTRADO
                }, { transaction });
                // Actualizar stock solo si tiene lote_talla válido
                if (detallePedido.idlote_talla && detallePedido.cantidad) {
                    const loteTalla = await lote_talla_model_1.default.findByPk(detallePedido.idlote_talla, { transaction });
                    if (loteTalla && loteTalla.stock !== null) {
                        const nuevoStock = Number(loteTalla.stock) - Number(detallePedido.cantidad);
                        await loteTalla.update({
                            stock: nuevoStock,
                            idestado: nuevoStock > 0 ? estados_constans_1.LoteEstado.DISPONIBLE : estados_constans_1.LoteEstado.AGOTADO
                        }, { transaction });
                        // Registrar movimiento de lote
                        await movimiento_lote_model_1.default.create({
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
            const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idTipoComprobante, { transaction });
            if (!tipoComprobante) {
                throw new Error('Tipo de comprobante no encontrado');
            }
            // Calcular IGV (18% del total)
            const total = Number(pedido.totalimporte) || 0;
            const igv = total * 0.18;
            const nuevoComprobante = await comprobante_model_1.default.create({
                idventa: nuevaVenta.id,
                igv: igv,
                descuento: 0,
                total: total,
                idtipocomprobante: tipoComprobante.id,
                numserie: await generarNumeroSerieUnico(tipoComprobante.id, transaction),
                idestado: estados_constans_1.ComprobanteEstado.REGISTRADO
            }, { transaction });
            // Confirmar transacción
            await transaction.commit();
            // Obtener datos completos para respuesta
            const ventaCompleta = await venta_model_1.default.findByPk(nuevaVenta.id, {
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
            const comprobanteCompleto = await comprobante_model_1.default.findByPk(nuevoComprobante.id, {
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
            const detallesVenta = await detalle_venta_model_1.default.findAll({
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
            var resultado = await (0, wsp_controller_1.enviarComprobanteService)(comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.id);
            res.status(200).json(resultado);
            // if (telefono && phoneRegex.test(telefono)) {
            //   // Generar PDF
            //   const nombreArchivo = await generarPDFComprobante(
            //     comprobanteCompleto, 
            //     ventaCompleta, 
            //     pedido, 
            //     detallesVenta
            //   );
            //   // Enviar por WhatsApp
            //   await enviarArchivoWSP(
            //     telefono, 
            //     nombreArchivo,
            //     `📄 ${comprobanteCompleto?.TipoComprobante?.nombre || 'Comprobante'} ${comprobanteCompleto?.numserie}`
            //   );
            //   res.status(200).json({
            //     msg: 'Pedido aprobado exitosamente y comprobante enviado',
            //     data: {
            //       pedido,
            //       venta: ventaCompleta,
            //       comprobante: comprobanteCompleto,
            //       detallesVenta
            //     }
            //   });
            // } else {
            //   res.status(200).json({
            //     msg: 'Pedido aprobado exitosamente (sin envío por WhatsApp: número no válido)',
            //     data: {
            //       pedido,
            //       venta: ventaCompleta,
            //       comprobante: comprobanteCompleto,
            //       detallesVenta
            //     }
            //   });
            // }
        }
        catch (error) {
            // Revertir transacción en caso de error
            await transaction.rollback();
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
};
exports.aprobarPedido = aprobarPedido;
// Función para generar número de serie único
const generarNumeroSerieUnico = async (idTipoComprobante, transaction) => {
    const tipoComprobante = await tipo_comprobante_model_1.default.findByPk(idTipoComprobante, {
        include: [{ model: connection_db_1.default.models.TipoSerie, as: 'TipoSerie' }],
        transaction
    });
    if (!tipoComprobante || !tipoComprobante.TipoSerie) {
        throw new Error('Tipo de comprobante o serie no encontrado');
    }
    // Obtener el último comprobante de este tipo
    const ultimoComprobante = await comprobante_model_1.default.findOne({
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
};

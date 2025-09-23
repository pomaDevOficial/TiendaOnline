import { Request, Response } from 'express';
import Pedido from '../models/pedido.model';
import Persona from '../models/persona.model';
import MetodoPago from '../models/metodo_pago.model';
import Estado from '../models/estado.model';
import { ComprobanteEstado, EstadoGeneral, LoteEstado, PedidoEstado, TipoMovimientoLote, VentaEstado } from '../estadosTablas/estados.constans';
import { Op, Transaction } from 'sequelize';
import Comprobante from '../models/comprobante.model';
import TipoComprobante from '../models/tipo_comprobante.model';
import TipoSerie from '../models/tiposerie.model';
import Venta from '../models/venta.model';
import Talla from '../models/talla.model';
import Producto from '../models/producto.model';
import Lote from '../models/lote.model';
import LoteTalla from '../models/lote_talla.model';
import PedidoDetalle from '../models/pedido_detalle.model';
import DetalleVenta from '../models/detalle_venta.model';
import MovimientoLote from '../models/movimiento_lote.model';
import { server } from '../server';
import db from '../db/connection.db';
import { generarPDFComprobante, enviarArchivoWSP, enviarComprobanteWSP,enviarMensajePedido, enviarComprobanteService } from './wsp.controller';
import moment from 'moment';
import 'dotenv/config' ; 
import Usuario from '../models/usuario.model';


export const crearPedidoConComprobante = async (req: Request, res: Response): Promise<void> => {
 console.log("hola")
  const transaction = await db.transaction();

  try {
    // 1) Parsear datos (porque vienen en FormData como string JSON)
    const personaObj: Persona = JSON.parse(req.body.persona);
    console.log(personaObj)
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
      const existing = await Persona.findOne({ where: { nroidentidad } });
      if (existing) {
        cli= existing;
        esCliente = true;
        // res.status(400).json({ msg: "El número de identidad ya existe" });
        // return;
      }
    }
    if (correo) {
      const existing = await Persona.findOne({ where: { correo } });
      if (existing && esCliente == false) {
        res.status(400).json({ msg: "El correo electrónico ya existe" });
        return;
      }
    }

    if(esCliente == false){
      
      const cliente: any = await Persona.create({
        idtipopersona: 1,
        nombres,
        apellidos,
        idtipoidentidad: 1,
        nroidentidad: nroidentidad || null,
        correo: correo || null,
        telefono: telefono || null,
        idestado: EstadoGeneral.REGISTRADO
      }, { transaction });
      cli= cliente
    }
    // 3) Crear cliente

    // 4) Crear pedido
    const pedido = await Pedido.create({
      idpersona: cli.id,
      idmetodopago: metodoPagoObj.id,
      adjunto: file.filename,
      esWeb: 1,
      fechaoperacion: new Date(),
      totalimporte: total,
      idestado: PedidoEstado.EN_ESPERA
    }, { transaction });

    // 5) Detalles + stock
    for (const p of productosArr) {
      const { loteTalla, cantidad, precio, subtotal } = p;

      const cantidadNum = Number(cantidad);
      const precioNum = Number(precio);
      const subtotalNum = subtotal != null ? Number(subtotal) : cantidadNum * precioNum;

      // Descontar stock
      const [results, metadata] = await db.query(
        `
        UPDATE lote_talla
        SET stock = stock - :cantidad
        WHERE id = :id AND stock >= :cantidad
        `,
        {
          replacements: { id: loteTalla.id, cantidad: cantidadNum },
          transaction
        }
      ) as [any, { affectedRows: number }];

      if (((metadata as any).rowCount ?? (metadata as any).affectedRows) === 0) {
        throw new Error(`Stock insuficiente para LoteTalla ${loteTalla.id}`);
      }

      // Crear detalle
      await PedidoDetalle.create({
        idpedido: pedido.id,
        idlote_talla: loteTalla.id,
        cantidad: cantidadNum,
        precio: precioNum,
        subtotal: subtotalNum
      }, { transaction });

      // Registrar movimiento
      await MovimientoLote.create({
        idlote_talla: loteTalla.id,
        tipomovimiento: TipoMovimientoLote.SALIDA,
        cantidad: cantidadNum,
        fechamovimiento: moment().tz("America/Lima").toDate(),
        idestado: EstadoGeneral.REGISTRADO
      }, { transaction });
    }


    // 6) Enviar WhatsApp
    let telefonoParsed = String(cli?.telefono || "").replace(/\D/g, "");
    if (telefonoParsed.length === 9) telefonoParsed = "51" + telefonoParsed;
    // NOTIFICAR USUARIO
    var nroUsuario = "51"+process.env.NRO_NOTIFICCION!

    // DESGLOSAR LA INFORMACION DEL PEDIDO EN DETALLE PARA NOTIFICAR AL USUARIO SOBRE EL PEDIDO DEL CLIENTE
    const detallesPedido = await PedidoDetalle.findAll({
        where: { idpedido: pedido.id },
        include: [
          {
            model: LoteTalla,
            as: "LoteTalla", // 👈 usa el alias real que definiste en la asociación
            include: [
              {
                model: Lote,
                as: "Lote", // 👈 alias usado en la relación
                include: [
                  {
                    model: Producto,
                    as: "Producto", // 👈 alias usado en la relación
                    attributes: ["nombre"]
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });
      console.log(detallesPedido)
            // Generar el texto del detalle
     const listaProductos = detallesPedido.map(
  (d, i) =>
    `${i + 1}. ${d.LoteTalla?.Lote?.Producto?.nombre} x${d.cantidad} = S/ ${Number(d.subtotal!).toFixed(2)}`
).join("\n");

      // Armar el mensaje
      const mensaje = `📢 Nuevo pedido registrado
      👤 Cliente: ${cli.nombres}
      🛒 Ítems: ${detallesPedido.length}
      💵 Total: S/ ${total.toFixed(2)}

      📦 Detalles:
      ${listaProductos}`;

    await transaction.commit();

    await enviarMensajePedido(
            nroUsuario,
           mensaje
    );
    //NOTIFICAR CLIENTE
    if (telefonoParsed) {
      const resultadoEnvio = await enviarMensajePedido(
        telefonoParsed,
        `Hola ${cli.nombres}, tu pedido fue registrado con éxito 🛒\n` +
        `💵 Total: S/ ${total.toFixed(2)}\n` +
        `⏳ Tu pedido está pendiente de revisión del comprobante. Te informaremos una vez sea aprobado.`
      );
      if (!resultadoEnvio.success) {
        console.error("Error WhatsApp:", resultadoEnvio.error);
      }
    }

    res.status(201).json({
      msg: "Venta, detalles y comprobante creados correctamente"
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error en crearPedidoConComprobante:", error);
    res.status(500).json({
      msg: "Ocurrió un error al crear el pedido",
      error: (error as Error).message
    });
  }
};


// CREATE - Insertar nuevo pedido
export const createPedido = async (req: Request, res: Response): Promise<void> => {
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
    const persona = await Persona.findByPk(idpersona);
    if (!persona) {
      res.status(400).json({ msg: 'La persona no existe' });
      return;
    }

    // Verificar si existe el método de pago
    const metodoPago = await MetodoPago.findByPk(idmetodopago);
    if (!metodoPago) {
      res.status(400).json({ msg: 'El método de pago no existe' });
      return;
    }

    // Crear nuevo pedido
    const nuevoPedido: any = await Pedido.create({
      idpersona,
      idmetodopago,
      fechaoperacion: fechaoperacion || new Date(),
      totalimporte,
      adjunto: adjunto || null,
      idestado: PedidoEstado.EN_ESPERA,
      esWeb :1
    });

    // Obtener el pedido creado con sus relaciones
    const pedidoCreado = await Pedido.findByPk(nuevoPedido.id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Pedido creado exitosamente',
      data: pedidoCreado
    });
  } catch (error) {
    console.error('Error en createPedido:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar pedido
export const updatePedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idpersona, idmetodopago, fechaoperacion, totalimporte, adjunto, idestado } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del pedido es obligatorio" });
      return;
    }

    const pedido: any = await Pedido.findByPk(id);
    if (!pedido) {
      res.status(404).json({ msg: `No existe un pedido con el id ${id}` });
      return;
    }

    // Verificar si existe la persona (si se está actualizando)
    if (idpersona) {
      const persona = await Persona.findByPk(idpersona);
      if (!persona) {
        res.status(400).json({ msg: 'La persona no existe' });
        return;
      }
    }

    // Verificar si existe el método de pago (si se está actualizando)
    if (idmetodopago) {
      const metodoPago = await MetodoPago.findByPk(idmetodopago);
      if (!metodoPago) {
        res.status(400).json({ msg: 'El método de pago no existe' });
        return;
      }
    }

    // Validar estado (si se está actualizando)
    if (idestado && !Object.values(PedidoEstado).includes(idestado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)' 
      });
      return;
    }

    // Actualizar campos
    if (idpersona) pedido.idpersona = idpersona;
    if (idmetodopago) pedido.idmetodopago = idmetodopago;
    if (fechaoperacion) pedido.fechaoperacion = fechaoperacion;
    if (totalimporte !== undefined) pedido.totalimporte = totalimporte;
    if (adjunto !== undefined) pedido.adjunto = adjunto;
    if (idestado) pedido.idestado = idestado;

    await pedido.save();

    // Obtener el pedido actualizado con relaciones
    const pedidoActualizado = await Pedido.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Pedido actualizado con éxito",
      data: pedidoActualizado
    });

  } catch (error) {
    console.error("Error en updatePedido:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los pedidos
export const getPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedidos = await Pedido.findAll({
      where: {
        esWeb: 1
      },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
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
  } catch (error) {
    console.error('Error en getPedidos:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de pedidos' });
  }
};

// READ - Listar pedidos por estado
export const getPedidosByEstado = async (req: Request, res: Response): Promise<void> => {
  const { estado } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      where: { idestado: estado,
        esWeb: 1
       },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
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
  } catch (error) {
    console.error('Error en getPedidosByEstado:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos por estado' });
  }
};

// READ - Obtener pedido por ID
export const getPedidoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
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
  } catch (error) {
    console.error('Error en getPedidoById:', error);
    res.status(500).json({ msg: 'Error al obtener el pedido' });
  }
};

// READ - Obtener pedidos por persona
export const getPedidosByPersona = async (req: Request, res: Response): Promise<void> => {
  const { idpersona } = req.params;

  try {
    const pedidos = await Pedido.findAll({
      where: { idpersona },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
          as: 'MetodoPago',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
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
  } catch (error) {
    console.error('Error en getPedidosByPersona:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos de la persona' });
  }
};

// UPDATE - Cambiar estado del pedido
export const cambiarEstadoPedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    if (!estado || !Object.values(PedidoEstado).includes(estado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser: EN_ESPERA (1), PAGADO (2) o CANCELADO (3)' 
      });
      return;
    }

    const pedido: any = await Pedido.findByPk(id);
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
  } catch (error) {
    console.error('Error en cambiarEstadoPedido:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado del pedido' });
  }
};

// DELETE - Eliminar pedido (cambiar estado a cancelado)
export const deletePedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido: any = await Pedido.findByPk(id);

    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    // Cambiar estado a CANCELADO en lugar de eliminar físicamente
    pedido.idestado = PedidoEstado.CANCELADO;
    await pedido.save();

    res.json({ 
      msg: 'Pedido cancelado con éxito',
      data: { id: pedido.id, estado: PedidoEstado.CANCELADO }
    });
  } catch (error) {
    console.error('Error en deletePedido:', error);
    res.status(500).json({ msg: 'Error al cancelar el pedido' });
  }
};

// READ - Listar pedidos cancelados
export const getPedidosCancelados = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedidos = await Pedido.findAll({
      where: { idestado: PedidoEstado.CANCELADO },
      include: [
        { 
          model: Persona, 
          as: 'Persona',
          attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono','correo']
        },
        { 
          model: MetodoPago, 
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
  } catch (error) {
    console.error('Error en getPedidosCancelados:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos cancelados' });
  }
};

// UPDATE - Restaurar pedido cancelado
export const restaurarPedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pedido: any = await Pedido.findByPk(id);

    if (!pedido) {
      res.status(404).json({ msg: 'Pedido no encontrado' });
      return;
    }

    // Cambiar estado a EN_ESPERA
    pedido.idestado = PedidoEstado.EN_ESPERA;
    await pedido.save();

    res.json({ 
      msg: 'Pedido restaurado con éxito',
      data: { id: pedido.id, estado: PedidoEstado.EN_ESPERA }
    });
  } catch (error) {
    console.error('Error en restaurarPedido:', error);
    res.status(500).json({ msg: 'Error al restaurar el pedido' });
  }
};

export const aprobarPedido = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
let transaction: Transaction | null = null;
  try {
    // Validaciones
    if (!id) {
      res.status(400).json({ msg: 'El ID del pedido es obligatorio' });
      return;
    }

    // Buscar el pedido por ID con la persona
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Persona,
          as: 'Persona'
        }
      ]
    });

    if (!pedido) {
      res.status(400).json({ msg: 'El pedido no existe' });
      return;
    }

    // Verificar que el pedido esté en estado EN_ESPERA
    if (pedido.idestado !== PedidoEstado.EN_ESPERA) {
      res.status(400).json({ 
        msg: `El pedido no puede ser aprobado. Estado actual: ${pedido.idestado}` 
      });
      return;
    }

    // Obtener los detalles del pedido
    const detallesPedido = await PedidoDetalle.findAll({
      where: { idpedido: id },
      include: [
        {
          model: LoteTalla,
          as: 'LoteTalla'
        }
      ]
    });

    if (!detallesPedido || detallesPedido.length === 0) {
      res.status(400).json({ msg: 'El pedido no tiene detalles' });
      return;
    }

    // Iniciar transacción
     transaction = await db.transaction();

    try {
      // 1. Actualizar estado del pedido a PAGADO
      await pedido.update({
        idestado: PedidoEstado.PAGADO
      }, { transaction });

      // 2. Crear la venta
      const nuevaVenta = await Venta.create({
        fechaventa: new Date(),
        idusuario: (req as any).user?.id,
        idpedido: pedido.id,
        idestado: VentaEstado.REGISTRADO
      }, { transaction });

      // 3. Crear detalles de venta y actualizar stock
      for (const detallePedido of detallesPedido) {
        // Crear detalle de venta
        await DetalleVenta.create({
          idpedidodetalle: detallePedido.id,
          idventa: nuevaVenta.id,
          precio_venta_real: detallePedido.precio,
          subtotal_real: detallePedido.subtotal,
          idestado: EstadoGeneral.REGISTRADO
        }, { transaction });

        // Actualizar stock solo si tiene lote_talla válido
        if (detallePedido.idlote_talla && detallePedido.cantidad) {
          const loteTalla = await LoteTalla.findByPk(detallePedido.idlote_talla, { transaction });
          
          if (loteTalla && loteTalla.stock !== null) {
            const nuevoStock = Number(loteTalla.stock) - Number(detallePedido.cantidad);
            
            await loteTalla.update({
              stock: nuevoStock,
              idestado: nuevoStock > 0 ? LoteEstado.DISPONIBLE : LoteEstado.AGOTADO
            }, { transaction });

          }
        }
      }

      // 4. Determinar el tipo de comprobante
      let idTipoComprobante: number;
      
      if (pedido.Persona && pedido.Persona.idtipopersona === 2) {
        idTipoComprobante = 2; // FACTURA
      } else {
        idTipoComprobante = 1; // BOLETA
      }

      // 5. Crear comprobante
      const tipoComprobante = await TipoComprobante.findByPk(idTipoComprobante, { transaction });
      
      if (!tipoComprobante) {
        throw new Error('Tipo de comprobante no encontrado');
      }

      // Calcular IGV (18% del total)
      const total = Number(pedido.totalimporte) || 0;
      const igv = total * 0.18;

      const nuevoComprobante = await Comprobante.create({
        idventa: nuevaVenta.id,
        igv: igv,
        descuento: 0,
        total: total,
        idtipocomprobante: tipoComprobante.id,
        numserie: await generarNumeroSerieUnico(tipoComprobante.id, transaction),
        idestado: ComprobanteEstado.REGISTRADO
      }, { transaction });

      // Confirmar transacción
       
    await transaction.commit();
    transaction = null;

      // Obtener datos completos para respuesta
      const ventaCompleta = await Venta.findByPk(nuevaVenta.id, {
        include: [
          {
            model: Pedido,
            as: 'Pedido',
            include: [
              {
                model: Persona,
                as: 'Persona'
              }
            ]
          }
        ]
      });

      const comprobanteCompleto = await Comprobante.findByPk(nuevoComprobante.id, {
        include: [
          {
            model: TipoComprobante,
            as: 'TipoComprobante'
          },
          {
            model: Venta,
            as: 'Venta'
          }
        ]
      });
      console.log(nuevoComprobante)
      console.log(comprobanteCompleto)

      const detallesVenta = await DetalleVenta.findAll({
        where: { idventa: nuevaVenta.id },
        include: [
          {
            model: PedidoDetalle,
            as: 'PedidoDetalle',
            include: [
              {
                model: LoteTalla,
                as: 'LoteTalla'
              }
            ]
          }
        ]
      });

    // Generar el PDF del comprobante SOLO si el teléfono es válido
const telefono = pedido?.Persona?.telefono ?? '';
const phoneRegex = /^\d{9,15}$/; // valida de 9 a 15 dígitos

console.log(comprobanteCompleto)
var resultado = await enviarComprobanteService(nuevoComprobante?.id!)
res.status(200).json(resultado);

    } catch (error) {
      // Revertir transacción en caso de error
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
 
  } catch (error) {
    console.error('Error en aprobarPedido:', error);
    res.status(500).json({ 
      msg: 'Ocurrió un error al aprobar el pedido', 
      error: (error as Error).message 
    });
  }
};

// Función para generar número de serie único
const generarNumeroSerieUnico = async (idTipoComprobante: number, transaction: any): Promise<string> => {
  const tipoComprobante = await TipoComprobante.findByPk(idTipoComprobante, {
    include: [{ model: (db as any).models.TipoSerie, as: 'TipoSerie' }],
    transaction
  });

  if (!tipoComprobante || !(tipoComprobante as any).TipoSerie) {
    throw new Error('Tipo de comprobante o serie no encontrado');
  }

  // Obtener el último comprobante de este tipo
  const ultimoComprobante = await Comprobante.findOne({
    where: { idtipocomprobante: idTipoComprobante },
    order: [['id', 'DESC']],
    transaction
  });

  let siguienteNumero = 1;
  if (ultimoComprobante && ultimoComprobante.numserie) {
    // Extraer el número del último comprobante e incrementarlo
    const partes = ultimoComprobante.numserie!.split('-');
    if (partes.length > 1) {
      const ultimoNumero = parseInt(partes[1]) || 0;
      siguienteNumero = ultimoNumero + 1;
    }
  }

  // Formato: [SERIE]-[NÚMERO]
  return `${(tipoComprobante as any).TipoSerie.nombre}-${siguienteNumero.toString().padStart(8, '0')}`;
};
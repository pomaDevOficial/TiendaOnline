import { Request, Response } from 'express';
import Comprobante from '../models/comprobante.model';
import Venta from '../models/venta.model';
import TipoComprobante from '../models/tipo_comprobante.model';
import Estado from '../models/estado.model';
import { ComprobanteEstado, EstadoGeneral, PedidoEstado, VentaEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';
import { generarPDFComprobante, enviarArchivoWSP } from './wsp.controller';
import PedidoDetalle from '../models/pedido_detalle.model';
import DetalleVenta from '../models/detalle_venta.model';
import LoteTalla from '../models/lote_talla.model';
import db from '../db/connection.db';
import Producto from '../models/producto.model';
import Lote from '../models/lote.model';
import Persona from '../models/persona.model';
import Usuario from '../models/usuario.model';
import Pedido from '../models/pedido.model';
import MetodoPago from '../models/metodo_pago.model';
import Talla from '../models/talla.model';
import moment from "moment-timezone";

// CREATE - Insertar nuevo comprobante
export const createComprobante = async (req: Request, res: Response): Promise<void> => {
  const { idventa, igv, descuento, total, idtipocomprobante, numserie } = req.body;

  try {
    // Validaciones
    if (!idventa || !idtipocomprobante || total === undefined) {
      res.status(400).json({ 
        msg: 'Los campos idventa, idtipocomprobante y total son obligatorios' 
      });
      return;
    }

    // Verificar si existe la venta
    const venta = await Venta.findByPk(idventa);
    if (!venta) {
      res.status(400).json({ msg: 'La venta no existe' });
      return;
    }

    // Verificar si existe el tipo de comprobante
    const tipoComprobante = await TipoComprobante.findByPk(idtipocomprobante);
    if (!tipoComprobante) {
      res.status(400).json({ msg: 'El tipo de comprobante no existe' });
      return;
    }

    // Verificar si la venta ya tiene un comprobante asociado
    const comprobanteExistente = await Comprobante.findOne({
      where: { idventa }
    });

    if (comprobanteExistente) {
      res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
      return;
    }

    // Crear nuevo comprobante
    const nuevoComprobante: any = await Comprobante.create({
      idventa,
      igv: igv || 0,
      descuento: descuento || 0,
      total,
      idtipocomprobante,
      numserie: numserie || null,
      idestado: ComprobanteEstado.REGISTRADO
    });

    // Obtener el comprobante creado con sus relaciones
    const comprobanteCreado = await Comprobante.findByPk(nuevoComprobante.id, {
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
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
      msg: 'Comprobante creado exitosamente',
      data: comprobanteCreado
    });
  } catch (error) {
    console.error('Error en createComprobante:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar comprobante
export const updateComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idventa, igv, descuento, total, idtipocomprobante, numserie } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del comprobante es obligatorio" });
      return;
    }

    const comprobante: any = await Comprobante.findByPk(id);
    if (!comprobante) {
      res.status(404).json({ msg: `No existe un comprobante con el id ${id}` });
      return;
    }

    // Verificar si existe la venta (si se está actualizando)
    if (idventa && idventa !== comprobante.idventa) {
      const venta = await Venta.findByPk(idventa);
      if (!venta) {
        res.status(400).json({ msg: 'La venta no existe' });
        return;
      }

      // Verificar si la nueva venta ya tiene un comprobante asociado
      const comprobanteExistente = await Comprobante.findOne({
        where: { idventa }
      });

      if (comprobanteExistente) {
        res.status(400).json({ msg: 'La venta ya tiene un comprobante asociado' });
        return;
      }
    }

    // Verificar si existe el tipo de comprobante (si se está actualizando)
    if (idtipocomprobante) {
      const tipoComprobante = await TipoComprobante.findByPk(idtipocomprobante);
      if (!tipoComprobante) {
        res.status(400).json({ msg: 'El tipo de comprobante no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idventa) comprobante.idventa = idventa;
    if (igv !== undefined) comprobante.igv = igv;
    if (descuento !== undefined) comprobante.descuento = descuento;
    if (total !== undefined) comprobante.total = total;
    if (idtipocomprobante) comprobante.idtipocomprobante = idtipocomprobante;
    if (numserie !== undefined) comprobante.numserie = numserie;

    await comprobante.save();

    // Obtener el comprobante actualizado con relaciones
    const comprobanteActualizado = await Comprobante.findByPk(id, {
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
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
      msg: "Comprobante actualizado con éxito",
      data: comprobanteActualizado
    });

  } catch (error) {
    console.error("Error en updateComprobante:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los comprobantes
export const getComprobantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const comprobantes = await Comprobante.findAll({
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      msg: 'Lista de comprobantes obtenida exitosamente',
      data: comprobantes
    });
  } catch (error) {
    console.error('Error en getComprobantes:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de comprobantes' });
  }
};

// READ - Listar comprobantes por rango de fechas
export const getComprobantesByFecha = async (req: Request, res: Response): Promise<void> => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    if (!fechaInicio || !fechaFin) {
      res.status(400).json({
        msg: "Los parámetros fechaInicio y fechaFin son obligatorios",
      });
      return;
    }

    // ✅ Convertir a rango de Lima
    const inicio = moment.tz(fechaInicio as string, "America/Lima").startOf("day").toDate();
    const fin = moment.tz(fechaFin as string, "America/Lima").endOf("day").toDate();

    const comprobantes = await Comprobante.findAll({
      include: [
        {
          model: Venta,
          as: "Venta",
          attributes: ["id", "fechaventa"],
          where: {
            fechaventa: {
              [Op.between]: [inicio, fin],
            },
          },
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: "Usuario",
              attributes: ["id", "usuario"],
            },
            {
              model: Venta.associations.Pedido.target,
              as: "Pedido",
              attributes: ["id", "fechaoperacion", "totalimporte"],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: "Persona",
                  attributes: ["id", "nombres", "apellidos", "nroidentidad", "telefono", "correo"],
                },
              ],
            },
          ],
        },
        {
          model: TipoComprobante,
          as: "TipoComprobante",
          attributes: ["id", "nombre"],
        },
        {
          model: Estado,
          as: "Estado",
          attributes: ["id", "nombre"],
        },
      ],
      order: [[{ model: Venta, as: "Venta" }, "fechaventa", "DESC"]],
    });

    res.json({
      msg: "Comprobantes por fecha obtenidos exitosamente",
      data: comprobantes,
    });
  } catch (error) {
    console.error("Error en getComprobantesByFecha:", error);
    res.status(500).json({ msg: "Error al obtener comprobantes por fecha" });
  }
};

// READ - Listar comprobantes registrados (no anulados)
export const getComprobantesRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const comprobantes = await Comprobante.findAll({
      where: { 
        idestado: ComprobanteEstado.REGISTRADO
      },
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      msg: 'Comprobantes registrados obtenidos exitosamente',
      data: comprobantes
    });
  } catch (error) {
    console.error('Error en getComprobantesRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener comprobantes registrados' });
  }
};

// READ - Obtener comprobante por ID
export const getComprobanteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comprobante = await Comprobante.findByPk(id, {
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!comprobante) {
      res.status(404).json({ msg: 'Comprobante no encontrado' });
      return;
    }

    res.json({
      msg: 'Comprobante obtenido exitosamente',
      data: comprobante
    });
  } catch (error) {
    console.error('Error en getComprobanteById:', error);
    res.status(500).json({ msg: 'Error al obtener el comprobante' });
  }
};

// READ - Obtener comprobantes por venta
export const getComprobantesByVenta = async (req: Request, res: Response): Promise<void> => {
  const { idventa } = req.params;

  try {
    const comprobantes = await Comprobante.findAll({
      where: { idventa },
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      msg: 'Comprobantes de la venta obtenidos exitosamente',
      data: comprobantes
    });
  } catch (error) {
    console.error('Error en getComprobantesByVenta:', error);
    res.status(500).json({ msg: 'Error al obtener comprobantes de la venta' });
  }
};

// READ - Listar comprobantes anulados
export const getComprobantesAnulados = async (req: Request, res: Response): Promise<void> => {
  try {
    const comprobantes = await Comprobante.findAll({
      where: { idestado: ComprobanteEstado.ANULADO },
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'usuario']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad','telefono','correo']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      msg: 'Comprobantes anulados obtenidos exitosamente',
      data: comprobantes
    });
  } catch (error) {
    console.error('Error en getComprobantesAnulados:', error);
    res.status(500).json({ msg: 'Error al obtener comprobantes anulados' });
  }
};

// UPDATE - Anular comprobante
export const anularComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comprobante: any = await Comprobante.findByPk(id);
    if (!comprobante) {
      res.status(404).json({ msg: 'Comprobante no encontrado' });
      return;
    }

    comprobante.idestado = ComprobanteEstado.ANULADO;
    await comprobante.save();

    res.json({ 
      msg: 'Comprobante anulado con éxito',
      data: { id: comprobante.id, estado: ComprobanteEstado.ANULADO }
    });
  } catch (error) {
    console.error('Error en anularComprobante:', error);
    res.status(500).json({ msg: 'Error al anular el comprobante' });
  }
};

// UPDATE - Restaurar comprobante anulado
export const restaurarComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comprobante: any = await Comprobante.findByPk(id);

    if (!comprobante) {
      res.status(404).json({ msg: 'Comprobante no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    comprobante.idestado = ComprobanteEstado.REGISTRADO;
    await comprobante.save();

    res.json({ 
      msg: 'Comprobante restaurado con éxito',
      data: { id: comprobante.id, estado: ComprobanteEstado.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarComprobante:', error);
    res.status(500).json({ msg: 'Error al restaurar el comprobante' });
  }
};

// DELETE - Eliminar comprobante físicamente
export const deleteComprobante = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comprobante = await Comprobante.findByPk(id);

    if (!comprobante) {
      res.status(404).json({ msg: 'Comprobante no encontrado' });
      return;
    }

    // Eliminar físicamente
    await comprobante.destroy();

    res.json({ 
      msg: 'Comprobante eliminado con éxito',
      data: { id }
    });
  } catch (error) {
    console.error('Error en deleteComprobante:', error);
    res.status(500).json({ msg: 'Error al eliminar el comprobante' });
  }
};
/// METOD COMPLETO DE LA VENTA POR LA ADMINISTRACION
export const crearVentaCompletaConComprobanteAdministracion = async (req: Request, res: Response): Promise<void> => {
  const { cliente, metodoPago, productos, total, idusuario, fechaventa } = req.body;

  // Validaciones básicas de entrada
  if (!cliente?.id || !metodoPago?.id || !Array.isArray(productos) || productos.length === 0) {
    res.status(400).json({ msg: 'cliente.id, metodoPago.id y productos[] son obligatorios' });
    return;
  }
  if (!idusuario && !((req as any).user?.id)) {
    res.status(400).json({ msg: 'idusuario es obligatorio (o debe venir en req.user)' });
    return;
  }

  const transaction = await db.transaction();

  try {
    // 1) CREAR PEDIDO (cabecera)
    const pedido = await Pedido.create({
      idpersona: cliente.id,
      idmetodopago: metodoPago.id,
      fechaoperacion: new Date(),
      totalimporte: Number(total) || 0,
      idestado: PedidoEstado.EN_ESPERA
    }, { transaction });

    // 2) CREAR DETALLES DE PEDIDO + DESCONTAR STOCK
    const pedidoDetalles: PedidoDetalle[] = [];
    for (const p of productos) {
      const { loteTalla, cantidad, precio, subtotal } = p;

      // Validaciones mínimas por ítem
      if (!loteTalla?.id || cantidad == null || precio == null) {
        throw new Error('Cada producto debe incluir loteTalla.id, cantidad y precio');
      }

      // Verificar stock
      const lt = await LoteTalla.findByPk(loteTalla.id, { transaction });
      if (!lt) throw new Error(`LoteTalla ${loteTalla.id} no existe`);
      if (Number(lt.stock) < Number(cantidad)) {
        throw new Error(`Stock insuficiente para LoteTalla ${loteTalla.id}`);
      }

      // Crear detalle de pedido
      const det = await PedidoDetalle.create({
        idpedido: pedido.id,
        idlote_talla: loteTalla.id,
        cantidad: Number(cantidad),
        precio: Number(precio),
        subtotal: subtotal != null ? Number(subtotal) : Number(cantidad) * Number(precio)
      }, { transaction });

      pedidoDetalles.push(det);

      // Descontar stock
      await lt.update({ stock: Number(lt.stock) - Number(cantidad) }, { transaction });
    }

    // 3) CREAR VENTA
    const nuevaVenta = await Venta.create({
      fechaventa: moment().tz("America/Lima").toDate(),
      idusuario: idusuario || (req as any).user?.id,
      idpedido: pedido.id,
      idestado: VentaEstado.REGISTRADO
    }, { transaction });

    // 4) CREAR DETALLES DE VENTA (a partir de PedidoDetalle)
    const detallesVentaCreados: DetalleVenta[] = [];
    for (const det of pedidoDetalles) {
      const dv = await DetalleVenta.create({
        idpedidodetalle: det.id,
        idventa: nuevaVenta.id,
        precio_venta_real: Number(det.precio),
        subtotal_real: Number(det.subtotal),
        idestado: EstadoGeneral.REGISTRADO
      }, { transaction });
      detallesVentaCreados.push(dv);
    }

    // 5) DETERMINAR COMPROBANTE (Boleta/Factura) según Persona
    const persona = await Persona.findByPk(cliente.id, { transaction });
    const idTipoComprobante = (persona?.idtipopersona === 2) ? 2 : 1; // 2: FACTURA, 1: BOLETA

    const tipoComprobante = await TipoComprobante.findByPk(idTipoComprobante, { transaction });
    if (!tipoComprobante) throw new Error('Tipo de comprobante no encontrado');

    const totalNum = Number(total) || 0;
    const igv = Number((totalNum * 0.18).toFixed(2));

    const comprobante = await Comprobante.create({
      idventa: nuevaVenta.id,
      igv,
      descuento: 0,
      total: totalNum,
      idtipocomprobante: tipoComprobante.id,
      numserie: await generarNumeroSerieUnico(tipoComprobante.id, transaction),
      idestado: ComprobanteEstado.REGISTRADO
    }, { transaction });

    // 6) ACTUALIZAR ESTADOS Y CONFIRMAR TRANSACCIÓN
    await pedido.update({ idestado: PedidoEstado.PAGADO }, { transaction });

    await transaction.commit();

    // 7) RECUPERAR DATOS ENRIQUECIDOS PARA PDF/WS (fuera de la tx)
    const ventaCompleta = await Venta.findByPk(nuevaVenta.id, {
      include: [
        { model: Usuario, as: 'Usuario' },
        { model: Pedido, as: 'Pedido', include: [{ model: Persona, as: 'Persona' }, { model: MetodoPago, as: 'MetodoPago' }] }
      ]
    });

    const comprobanteCompleto = await Comprobante.findByPk(comprobante.id, {
      include: [
        { model: TipoComprobante, as: 'TipoComprobante' },
        { model: Venta, as: 'Venta' }
      ]
    });

    const detallesVentaCompletos = await DetalleVenta.findAll({
      where: { idventa: nuevaVenta.id },
      include: [
        {
          model: PedidoDetalle,
          as: 'PedidoDetalle',
          include: [
            {
              model: LoteTalla,
              as: 'LoteTalla',
              include: [
                {
                  model: Lote,
                  as: 'Lote',
                  include: [{ model: Producto, as: 'Producto' }]
                },
                { model: Talla, as: 'Talla' }
              ]
            }
          ]
        }
      ]
    });

    // 8) GENERAR PDF Y ENVIAR POR WHATSAPP (si hay teléfono válido)
    const telefonoRaw = cliente?.telefono ?? ventaCompleta?.Pedido?.Persona?.telefono ?? '';
    const telefono = String(telefonoRaw).replace(/\D/g, ''); // solo dígitos
    const phoneRegex = /^\d{9,15}$/;

    if (telefono && phoneRegex.test(telefono)) {
      try {
        const nombreArchivo = await generarPDFComprobante(
          comprobanteCompleto,
          ventaCompleta,
          ventaCompleta?.Pedido,           // incluye Persona y MetodoPago
          detallesVentaCompletos
        );

        await enviarArchivoWSP(
          telefono,
          nombreArchivo,
          `📄 ${comprobanteCompleto?.TipoComprobante?.nombre || 'Comprobante'} ${comprobanteCompleto?.numserie}`
        );

        res.status(201).json({
          msg: 'Venta, detalles y comprobante creados y enviados exitosamente por WhatsApp',
          data: {
            pedido,
            venta: ventaCompleta,
            comprobante: comprobanteCompleto,
            detallesVenta: detallesVentaCompletos
          }
        });
        return;
      } catch (err) {
        console.error('Error al generar/enviar comprobante por WhatsApp:', err);
        // sigue sin cortar la respuesta exitosa
      }
    }

    // Si no hay teléfono válido o falló el envío:
    res.status(201).json({
      msg: 'Venta, detalles y comprobante creados exitosamente (sin envío por WhatsApp)',
      data: {
        pedido,
        venta: ventaCompleta,
        comprobante: comprobanteCompleto,
        detallesVenta: detallesVentaCompletos
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en crearVentaCompletaConComprobante:', error);
    res.status(500).json({
      msg: 'Ocurrió un error al crear la venta completa',
      error: (error as Error).message
    });
  }
};

export const crearVentaCompletaConComprobante = async (req: Request, res: Response): Promise<void> => {
  const { fechaventa, idusuario, idpedido, detallesVenta } = req.body;

  try {
    // Validaciones básicas
    if (!idusuario || !idpedido || !detallesVenta || !Array.isArray(detallesVenta) || detallesVenta.length === 0) {
      res.status(400).json({ 
        msg: 'Los campos idusuario, idpedido y detallesVenta (array) son obligatorios' 
      });
      return;
    }

    // Verificar si existe el usuario
    const usuario = await Usuario.findByPk(idusuario);
    if (!usuario) {
      res.status(400).json({ msg: 'El usuario no existe' });
      return;
    }

    // Verificar si existe el pedido con la persona
    const pedido = await Pedido.findByPk(idpedido, {
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

    // Verificar si el pedido ya tiene una venta asociada
    const ventaExistente = await Venta.findOne({ where: { idpedido } });
    if (ventaExistente) {
      res.status(400).json({ msg: 'El pedido ya tiene una venta asociada' });
      return;
    }

    // Iniciar transacción
    const transaction = await db.transaction();

    try {
      // 1. CREAR LA VENTA
      const nuevaVenta = await Venta.create({
        fechaventa: moment().tz("America/Lima").toDate(),
        idusuario,
        idpedido,
        idestado: VentaEstado.REGISTRADO
      }, { transaction });

      // 2. CREAR DETALLES DE VENTA
      const detallesVentaCreados = [];
      for (const detalle of detallesVenta) {
        // Validar detalle de pedido
        const pedidoDetalle = await PedidoDetalle.findByPk(detalle.idpedidodetalle, { transaction });
        if (!pedidoDetalle) {
          throw new Error(`Detalle de pedido con ID ${detalle.idpedidodetalle} no existe`);
        }

        // Calcular subtotal si no se proporciona
        const subtotal = detalle.subtotal_real !== undefined 
          ? detalle.subtotal_real 
          : Number(pedidoDetalle.cantidad) * Number(detalle.precio_venta_real);

        // Crear detalle de venta
        const nuevoDetalleVenta = await DetalleVenta.create({
          idpedidodetalle: detalle.idpedidodetalle,
          idventa: nuevaVenta.id,
          precio_venta_real: detalle.precio_venta_real,
          subtotal_real: subtotal,
          idestado: EstadoGeneral.REGISTRADO
        }, { transaction });

        detallesVentaCreados.push(nuevoDetalleVenta);

        // Actualizar stock si corresponde
        if (pedidoDetalle.idlote_talla && pedidoDetalle.cantidad) {
          const loteTalla = await LoteTalla.findByPk(pedidoDetalle.idlote_talla, { transaction });
          if (loteTalla && loteTalla.stock !== null) {
            const nuevoStock = Number(loteTalla.stock) - Number(pedidoDetalle.cantidad);
            await loteTalla.update({ stock: nuevoStock }, { transaction });
          }
        }
      }

      // 3. DETERMINAR TIPO DE COMPROBANTE
      let idTipoComprobante: number;
      if (pedido.Persona && pedido.Persona.idtipopersona === 2) {
        idTipoComprobante = 2; // FACTURA
      } else {
        idTipoComprobante = 1; // BOLETA
      }

      // 4. CREAR COMPROBANTE
      const tipoComprobante = await TipoComprobante.findByPk(idTipoComprobante, { transaction });
      if (!tipoComprobante) {
        throw new Error('Tipo de comprobante no encontrado');
      }

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

      // CONFIRMAR TRANSACCIÓN
      await transaction.commit();

      // OBTENER DATOS COMPLETOS
      const ventaCompleta = await Venta.findByPk(nuevaVenta.id, {
        include: [
          { model: Usuario, as: 'Usuario' },
          { 
            model: Pedido, 
            as: 'Pedido',
            include: [{ model: Persona, as: 'Persona' }]
          }
        ]
      });

      const comprobanteCompleto = await Comprobante.findByPk(nuevoComprobante.id, {
        include: [
          { model: TipoComprobante, as: 'TipoComprobante' },
          { model: Venta, as: 'Venta' }
        ]
      });

      const detallesVentaCompletos = await DetalleVenta.findAll({
        where: { idventa: nuevaVenta.id },
        include: [
          {
            model: PedidoDetalle,
            as: 'PedidoDetalle',
            include: [
              {
                model: LoteTalla,
                as: 'LoteTalla',
                include: [
                  {
                    model: Lote,
                    as: 'Lote',
                    include: [{ model: Producto, as: 'Producto' }]
                  }
                ]
              }
            ]
          }
        ]
      });

      // 5. GENERAR Y ENVIAR COMPROBANTE POR WHATSAPP
      const telefono = pedido?.Persona?.telefono ?? '';
      const phoneRegex = /^\d{9,15}$/;

      if (telefono && phoneRegex.test(telefono)) {
        try {
          const nombreArchivo = await generarPDFComprobante(
            comprobanteCompleto, 
            ventaCompleta, 
            pedido, 
            detallesVentaCompletos
          );

          await enviarArchivoWSP(
            telefono, 
            nombreArchivo,
            `📄 ${comprobanteCompleto?.TipoComprobante?.nombre || 'Comprobante'} ${comprobanteCompleto?.numserie}`
          );

          res.status(201).json({
            msg: 'Venta, detalles, comprobante creados y enviados exitosamente',
            data: {
              venta: ventaCompleta,
              comprobante: comprobanteCompleto,
              detallesVenta: detallesVentaCompletos
            }
          });
          return;

        } catch (error) {
          console.error('Error al enviar comprobante:', error);
          // Continuar aunque falle el envío
        }
      }

      res.status(201).json({
        msg: 'Venta, detalles y comprobante creados exitosamente (sin envío por WhatsApp)',
        data: {
          venta: ventaCompleta,
          comprobante: comprobanteCompleto,
          detallesVenta: detallesVentaCompletos
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error en crearVentaCompletaConComprobante:', error);
    res.status(500).json({ 
      msg: 'Ocurrió un error al crear la venta completa', 
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
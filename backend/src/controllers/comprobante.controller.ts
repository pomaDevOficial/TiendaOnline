import { Request, Response } from 'express';
import Comprobante from '../models/comprobante.model';
import Venta from '../models/venta.model';
import TipoComprobante from '../models/tipo_comprobante.model';
import Estado from '../models/estado.model';
import { ComprobanteEstado } from '../estadosTablas/estados.constans';
import { Op } from 'sequelize';

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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
        msg: 'Los parámetros fechaInicio y fechaFin son obligatorios' 
      });
      return;
    }

    const comprobantes = await Comprobante.findAll({
      include: [
        { 
          model: Venta, 
          as: 'Venta',
          attributes: ['id', 'fechaventa'],
          where: {
            fechaventa: {
              [Op.between]: [new Date(fechaInicio as string), new Date(fechaFin as string)]
            }
          },
          include: [
            {
              model: Venta.associations.Usuario.target,
              as: 'Usuario',
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [[{ model: Venta, as: 'Venta' }, 'fechaventa', 'DESC']]
    });

    res.json({
      msg: 'Comprobantes por fecha obtenidos exitosamente',
      data: comprobantes
    });
  } catch (error) {
    console.error('Error en getComprobantesByFecha:', error);
    res.status(500).json({ msg: 'Error al obtener comprobantes por fecha' });
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
              attributes: ['id', 'nombre', 'email']
            },
            {
              model: Venta.associations.Pedido.target,
              as: 'Pedido',
              attributes: ['id', 'fechaoperacion', 'totalimporte'],
              include: [
                {
                  model: Venta.associations.Pedido.target.associations.Persona.target,
                  as: 'Persona',
                  attributes: ['id', 'nombres', 'apellidos', 'dni']
                }
              ]
            }
          ]
        },
        { 
          model: TipoComprobante, 
          as: 'TipoComprobante',
          attributes: ['id', 'nombre', 'codigo']
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
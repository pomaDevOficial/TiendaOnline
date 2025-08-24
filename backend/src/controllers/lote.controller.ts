import { Request, Response } from 'express';
import Lote from '../models/lote.model';
import Producto from '../models/producto.model';
import Estado from '../models/estado.model';
import Categoria from '../models/categoria.model';
import Marca from '../models/marca.model';
import { EstadoGeneral, LoteEstado } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo lote
export const createLote = async (req: Request, res: Response): Promise<void> => {
  const { idproducto, proveedor, fechaingreso } = req.body;

  try {
    // Validaciones
    if (!idproducto || !proveedor) {
      res.status(400).json({ 
        msg: 'Los campos idproducto y proveedor son obligatorios' 
      });
      return;
    }

    // Verificar si existe el producto
    const producto = await Producto.findByPk(idproducto);
    if (!producto) {
      res.status(400).json({ msg: 'El producto no existe' });
      return;
    }

    // Crear nuevo lote
    const nuevoLote: any = await Lote.create({
      idproducto,
      proveedor,
      fechaingreso: fechaingreso || new Date(),
      idestado: LoteEstado.DISPONIBLE
    });

    // Obtener el lote creado con sus relaciones
    const loteCreado = await Lote.findByPk(nuevoLote.id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.status(201).json({
      msg: 'Lote creado exitosamente',
      data: loteCreado
    });
  } catch (error) {
    console.error('Error en createLote:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar lote
export const updateLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { idproducto, proveedor, fechaingreso } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del lote es obligatorio" });
      return;
    }

    const lote: any = await Lote.findByPk(id);
    if (!lote) {
      res.status(404).json({ msg: `No existe un lote con el id ${id}` });
      return;
    }

    // Verificar si existe el producto (si se está actualizando)
    if (idproducto) {
      const producto = await Producto.findByPk(idproducto);
      if (!producto) {
        res.status(400).json({ msg: 'El producto no existe' });
        return;
      }
    }

    // Actualizar campos
    if (idproducto) lote.idproducto = idproducto;
    if (proveedor) lote.proveedor = proveedor;
    if (fechaingreso) lote.fechaingreso = fechaingreso;
    
    // Cambiar estado a ACTUALIZADO si no está eliminado
    if (lote.idestado !== LoteEstado.ELIMINADO) {
      lote.idestado = LoteEstado.DISPONIBLE;
    }

    await lote.save();

    // Obtener el lote actualizado con relaciones
    const loteActualizado = await Lote.findByPk(id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    res.json({
      msg: "Lote actualizado con éxito",
      data: loteActualizado
    });

  } catch (error) {
    console.error("Error en updateLote:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Listar todos los lotes
export const getLotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      msg: 'Lista de lotes obtenida exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotes:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de lotes' });
  }
};

// READ - Listar lotes disponibles (no eliminados)
export const getLotesDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      where: { 
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes disponibles obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesDisponibles:', error);
    res.status(500).json({ msg: 'Error al obtener lotes disponibles' });
  }
};

// READ - Obtener lote por ID
export const getLoteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote = await Lote.findByPk(id, {
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    res.json({
      msg: 'Lote obtenido exitosamente',
      data: lote
    });
  } catch (error) {
    console.error('Error en getLoteById:', error);
    res.status(500).json({ msg: 'Error al obtener el lote' });
  }
};

// READ - Obtener lotes por producto
export const getLotesByProducto = async (req: Request, res: Response): Promise<void> => {
  const { idproducto } = req.params;

  try {
    const lotes = await Lote.findAll({
      where: { 
        idproducto,
        idestado: [LoteEstado.DISPONIBLE, LoteEstado.AGOTADO] 
      },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes del producto obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesByProducto:', error);
    res.status(500).json({ msg: 'Error al obtener lotes del producto' });
  }
};

// UPDATE - Cambiar estado del lote (disponible/agotado)
export const cambiarEstadoLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body; // LoteEstado.DISPONIBLE o LoteEstado.AGOTADO

  try {
    if (!estado || ![LoteEstado.DISPONIBLE, LoteEstado.AGOTADO].includes(estado)) {
      res.status(400).json({ 
        msg: 'Estado inválido. Debe ser DISPONIBLE (1) o AGOTADO (2)' 
      });
      return;
    }

    const lote: any = await Lote.findByPk(id);
    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    lote.idestado = estado;
    await lote.save();

    res.json({ 
      msg: 'Estado del lote actualizado con éxito',
      data: { id: lote.id, estado }
    });
  } catch (error) {
    console.error('Error en cambiarEstadoLote:', error);
    res.status(500).json({ msg: 'Error al cambiar el estado del lote' });
  }
};

// DELETE - Eliminar lote (cambiar estado a eliminado)
export const deleteLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote: any = await Lote.findByPk(id);

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    lote.idestado = LoteEstado.ELIMINADO;
    await lote.save();

    res.json({ 
      msg: 'Lote eliminado con éxito',
      data: { id: lote.id, estado: LoteEstado.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteLote:', error);
    res.status(500).json({ msg: 'Error al eliminar el lote' });
  }
};

// READ - Listar lotes eliminados
export const getLotesEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.findAll({
      where: { idestado: LoteEstado.ELIMINADO },
      include: [
        { 
          model: Producto, 
          as: 'Producto',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Categoria,
              as: 'Categoria',
              attributes: ['id', 'nombre']
            },
            {
              model: Marca,
              as: 'Marca',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fechaingreso', 'DESC']]
    });

    res.json({
      msg: 'Lotes eliminados obtenidos exitosamente',
      data: lotes
    });
  } catch (error) {
    console.error('Error en getLotesEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener lotes eliminados' });
  }
};

// UPDATE - Restaurar lote eliminado
export const restaurarLote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const lote: any = await Lote.findByPk(id);

    if (!lote) {
      res.status(404).json({ msg: 'Lote no encontrado' });
      return;
    }

    // Cambiar estado a DISPONIBLE
    lote.idestado = LoteEstado.DISPONIBLE;
    await lote.save();

    res.json({ 
      msg: 'Lote restaurado con éxito',
      data: { id: lote.id, estado: LoteEstado.DISPONIBLE }
    });
  } catch (error) {
    console.error('Error en restaurarLote:', error);
    res.status(500).json({ msg: 'Error al restaurar el lote' });
  }
};
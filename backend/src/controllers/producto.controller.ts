import { Request, Response } from 'express';
import Producto from '../models/producto.model';
import Categoria from '../models/categoria.model';
import Marca from '../models/marca.model';
import Talla from '../models/talla.model';
import Estado from '../models/estado.model';
import { EstadoGeneral } from '../estadosTablas/estados.constans';

// CREATE - Insertar nuevo producto
export const createProducto = async (req: Request, res: Response): Promise<void> => {
  const { nombre, idcategoria, idmarca, idtalla } = req.body;

  try {
    // Validaciones
    if (!nombre || !idcategoria || !idmarca || !idtalla) {
      res.status(400).json({ 
        msg: 'Los campos nombre, idcategoria, idmarca e idtalla son obligatorios' 
      });
      return;
    }

    // Verificar si el producto ya existe con la misma combinación
    const existingProducto = await Producto.findOne({ 
      where: { 
        nombre,
        idcategoria,
        idmarca,
        idtalla
      } 
    });
    if (existingProducto) {
      res.status(400).json({ 
        msg: 'Ya existe un producto con el mismo nombre, categoría, marca y talla' 
      });
      return;
    }

    // Verificar si existen las referencias
    const categoria = await Categoria.findByPk(idcategoria);
    if (!categoria) {
      res.status(400).json({ msg: 'La categoría no existe' });
      return;
    }

    const marca = await Marca.findByPk(idmarca);
    if (!marca) {
      res.status(400).json({ msg: 'La marca no existe' });
      return;
    }

    const talla = await Talla.findByPk(idtalla);
    if (!talla) {
      res.status(400).json({ msg: 'La talla no existe' });
      return;
    }

    // Crear nuevo producto
    const nuevoProducto: any = await Producto.create({
      nombre,
      idcategoria,
      idmarca,
      idtalla,
      idestado: EstadoGeneral.REGISTRADO
    });

    // Obtener el producto creado con sus relaciones
    const productoCreado = await Producto.findByPk(nuevoProducto.id, {
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
        },
        { 
          model: Talla, 
          as: 'Talla',
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
      msg: 'Producto creado exitosamente',
      data: productoCreado
    });
  } catch (error) {
    console.error('Error en createProducto:', error);
    res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
  }
};

// UPDATE - Actualizar producto (CORREGIDO)
export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, idcategoria, idmarca, idtalla } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: "El ID del producto es obligatorio" });
      return;
    }

    const producto: any = await Producto.findByPk(id);
    if (!producto) {
      res.status(404).json({ msg: `No existe un producto con el id ${id}` });
      return;
    }

    // Validar si ya existe otro producto con la misma combinación
    if (nombre || idcategoria || idmarca || idtalla) {
      const nombreToCheck = nombre || producto.nombre;
      const categoriaToCheck = idcategoria || producto.idcategoria;
      const marcaToCheck = idmarca || producto.idmarca;
      const tallaToCheck = idtalla || producto.idtalla;

      const existingProducto = await Producto.findOne({ 
        where: { 
          nombre: nombreToCheck,
          idcategoria: categoriaToCheck,
          idmarca: marcaToCheck,
          idtalla: tallaToCheck
        } 
      });

      // Si existe otro producto con la misma combinación y no es el mismo que estamos editando
      if (existingProducto && existingProducto.id !== parseInt(id)) {
        res.status(400).json({ 
          msg: 'Ya existe otro producto con la misma combinación de nombre, categoría, marca y talla' 
        });
        return;
      }
    }

    // Verificar si existen las referencias
    if (idcategoria) {
      const categoria = await Categoria.findByPk(idcategoria);
      if (!categoria) {
        res.status(400).json({ msg: 'La categoría no existe' });
        return;
      }
    }

    if (idmarca) {
      const marca = await Marca.findByPk(idmarca);
      if (!marca) {
        res.status(400).json({ msg: 'La marca no existe' });
        return;
      }
    }

    if (idtalla) {
      const talla = await Talla.findByPk(idtalla);
      if (!talla) {
        res.status(400).json({ msg: 'La talla no existe' });
        return;
      }
    }

    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (idcategoria) producto.idcategoria = idcategoria;
    if (idmarca) producto.idmarca = idmarca;
    if (idtalla) producto.idtalla = idtalla;
    
    // Cambiar estado a ACTUALIZADO
    producto.idestado = EstadoGeneral.ACTUALIZADO;

    await producto.save();

    // Obtener el producto actualizado con relaciones
    const productoActualizado = await Producto.findByPk(id, {
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
        },
        { 
          model: Talla, 
          as: 'Talla',
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
      msg: "Producto actualizado con éxito",
      data: productoActualizado
    });

  } catch (error) {
    console.error("Error en updateProducto:", error);
    res.status(500).json({ msg: "Ocurrió un error, comuníquese con soporte" });
  }
};

// READ - Verificar si existe un producto con la misma combinación
export const verificarProductoCompleto = async (req: Request, res: Response): Promise<void> => {
  const { nombre, idcategoria, idmarca, idtalla } = req.params;

  try {
    if (!nombre || !idcategoria || !idmarca || !idtalla) {
      res.status(400).json({ 
        msg: 'Todos los parámetros (nombre, idcategoria, idmarca, idtalla) son requeridos' 
      });
      return;
    }

    const producto = await Producto.findOne({ 
      where: { 
        nombre,
        idcategoria: parseInt(idcategoria),
        idmarca: parseInt(idmarca),
        idtalla: parseInt(idtalla)
      },
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
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (producto) {
      res.json({
        msg: 'Ya existe un producto con esta combinación',
        existe: true,
        data: producto
      });
    } else {
      res.json({
        msg: 'No existe un producto con esta combinación',
        existe: false
      });
    }
  } catch (error) {
    console.error('Error en verificarProductoCompleto:', error);
    res.status(500).json({ msg: 'Error al verificar la combinación del producto' });
  }
};

// El resto de las funciones permanecen igual (getProductos, getProductoById, deleteProducto, etc.)

// READ - Listar todos los productos
export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.findAll({
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
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
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
      msg: 'Lista de productos obtenida exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de productos' });
  }
};

// READ - Listar productos registrados (no eliminados)
export const getProductosRegistrados = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.findAll({
      where: { 
        idestado: [EstadoGeneral.REGISTRADO, EstadoGeneral.ACTUALIZADO] 
      },
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
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Productos registrados obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error en getProductosRegistrados:', error);
    res.status(500).json({ msg: 'Error al obtener productos registrados' });
  }
};

// READ - Obtener producto por ID
export const getProductoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id, {
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
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Estado, 
          as: 'Estado',
          attributes: ['id', 'nombre'] 
        }
      ]
    });

    if (!producto) {
      res.status(404).json({ msg: 'Producto no encontrado' });
      return;
    }

    res.json({
      msg: 'Producto obtenido exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error en getProductoById:', error);
    res.status(500).json({ msg: 'Error al obtener el producto' });
  }
};

// DELETE - Eliminar producto (cambiar estado a eliminado)
export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const producto: any = await Producto.findByPk(id);

    if (!producto) {
      res.status(404).json({ msg: 'Producto no encontrado' });
      return;
    }

    // Cambiar estado a ELIMINADO en lugar de eliminar físicamente
    producto.idestado = EstadoGeneral.ELIMINADO;
    await producto.save();

    res.json({ 
      msg: 'Producto eliminado con éxito',
      data: { id: producto.id, estado: EstadoGeneral.ELIMINADO }
    });
  } catch (error) {
    console.error('Error en deleteProducto:', error);
    res.status(500).json({ msg: 'Error al eliminar el producto' });
  }
};

// READ - Listar productos eliminados
export const getProductosEliminados = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.findAll({
      where: { idestado: EstadoGeneral.ELIMINADO },
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
        },
        { 
          model: Talla, 
          as: 'Talla',
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      msg: 'Productos eliminados obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error in getProductosEliminados:', error);
    res.status(500).json({ msg: 'Error al obtener productos eliminados' });
  }
};

// UPDATE - Restaurar producto eliminado
export const restaurarProducto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const producto: any = await Producto.findByPk(id);

    if (!producto) {
      res.status(404).json({ msg: 'Producto no encontrado' });
      return;
    }

    // Cambiar estado a REGISTRADO
    producto.idestado = EstadoGeneral.REGISTRADO;
    await producto.save();

    res.json({ 
      msg: 'Producto restaurado con éxito',
      data: { id: producto.id, estado: EstadoGeneral.REGISTRADO }
    });
  } catch (error) {
    console.error('Error en restaurarProducto:', error);
    res.status(500).json({ msg: 'Error al restaurar el producto' });
  }
};
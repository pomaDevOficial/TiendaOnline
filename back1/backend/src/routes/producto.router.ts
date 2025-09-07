import { Router } from "express";
import {
    createProducto,
    getProductos,
    getProductoById,
    updateProducto,
    deleteProducto,
    getProductosRegistrados,
    getProductosEliminados,
    restaurarProducto,
    verificarProductoCompleto,
    crearProductoConImagen,
    actualizarProductoConImagen
} from '../controllers/producto.controller';
import { uploadProducto } from "../middlewares/uploadProducto";

const ProductoRouter = Router();

ProductoRouter.post('/', createProducto); // Crear un nuevo producto
// CREATE
ProductoRouter.post("/con-imagen",uploadProducto.single("imagen"),crearProductoConImagen);
// UPDATE
ProductoRouter.put("/:id/con-imagen",uploadProducto.single("imagen"),actualizarProductoConImagen);

ProductoRouter.get('/', getProductos); // Obtener la lista de todos los productos
ProductoRouter.get('/registrados', getProductosRegistrados); // Obtener solo productos registrados/actualizados
ProductoRouter.get('/eliminados', getProductosEliminados); // Obtener solo productos eliminados
ProductoRouter.get('/verificar-combinacion/:nombre/:idcategoria/:idmarca/:idtalla', verificarProductoCompleto); // Verificar combinación completa
ProductoRouter.get('/:id', getProductoById); // Obtener un producto por ID
ProductoRouter.put('/:id', updateProducto); // Actualizar un producto por ID
ProductoRouter.patch('/:id/eliminar', deleteProducto); // Eliminar lógicamente un producto
ProductoRouter.patch('/:id/restaurar', restaurarProducto); // Restaurar un producto eliminado

export default ProductoRouter;
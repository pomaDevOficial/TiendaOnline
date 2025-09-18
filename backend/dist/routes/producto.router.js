"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const producto_controller_1 = require("../controllers/producto.controller");
const uploadProducto_1 = require("../middlewares/uploadProducto");
const ProductoRouter = (0, express_1.Router)();
ProductoRouter.post('/', producto_controller_1.createProducto); // Crear un nuevo producto
// CREATE
ProductoRouter.post("/con-imagen", uploadProducto_1.uploadProducto.single("imagen"), producto_controller_1.crearProductoConImagen);
// UPDATE
ProductoRouter.put("/:id/con-imagen", uploadProducto_1.uploadProducto.single("imagen"), producto_controller_1.actualizarProductoConImagen);
ProductoRouter.get('/', producto_controller_1.getProductos); // Obtener la lista de todos los productos
ProductoRouter.get('/registrados', producto_controller_1.getProductosRegistrados); // Obtener solo productos registrados/actualizados
ProductoRouter.get('/eliminados', producto_controller_1.getProductosEliminados); // Obtener solo productos eliminados
ProductoRouter.get("/buscarproductos", producto_controller_1.buscarProductos);
ProductoRouter.get('/verificar-combinacion/:nombre/:idcategoria/:idmarca/:idtalla', producto_controller_1.verificarProductoCompleto); // Verificar combinación completa
ProductoRouter.get('/:id', producto_controller_1.getProductoById); // Obtener un producto por ID
ProductoRouter.put('/:id', producto_controller_1.updateProducto); // Actualizar un producto por ID
ProductoRouter.patch('/:id/eliminar', producto_controller_1.deleteProducto); // Eliminar lógicamente un producto
ProductoRouter.patch('/:id/restaurar', producto_controller_1.restaurarProducto); // Restaurar un producto eliminado
exports.default = ProductoRouter;

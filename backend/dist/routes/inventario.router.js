"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventario_controller_1 = require("../controllers/inventario.controller");
const InventarioRouter = (0, express_1.Router)();
InventarioRouter.post('/', inventario_controller_1.createInventario); // Crear un nuevo inventario
InventarioRouter.get('/', inventario_controller_1.getInventarios); // Obtener la lista de inventarios
InventarioRouter.get('/productosxvencer', inventario_controller_1.getProductosConBajoStock); // Obtener la lista de inventarios
InventarioRouter.get('/:idInventario', inventario_controller_1.getInventarioById); // Obtener un inventario por ID
InventarioRouter.put('/:idInventario', inventario_controller_1.updateInventario); // Actualizar un inventario por ID
InventarioRouter.delete('/:idInventario', inventario_controller_1.deleteInventario); // Eliminar un inventario por ID
InventarioRouter.get('/existe/:idProducto', inventario_controller_1.verificarProductoEnInventario);
//InventarioRouter.get('/search/:searchTerm', searchInventarios); // Buscar inventarios por término
exports.default = InventarioRouter;

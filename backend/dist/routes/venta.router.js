"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venta_controller_1 = require("../controllers/venta.controller");
const VentasRouter = (0, express_1.Router)();
// CREATE
VentasRouter.post('/', venta_controller_1.crearVenta); // Crear una nueva venta
// READ
VentasRouter.get('/', venta_controller_1.obtenerVentas); // Obtener todas las ventas (excluye eliminadas)
VentasRouter.get('/eliminadas', venta_controller_1.obtenerVentasEliminadas); // Obtener ventas eliminadas
VentasRouter.get('/estado/:idestado', venta_controller_1.obtenerVentasPorEstado); // Obtener ventas por estado
VentasRouter.get('/usuario/:idusuario', venta_controller_1.obtenerVentasPorUsuario); // Obtener ventas por usuario
VentasRouter.get('/:id', venta_controller_1.obtenerVentaPorId); // Obtener una venta por ID
// UPDATE
VentasRouter.put('/:id', venta_controller_1.actualizarVenta); // Actualizar una venta completa por ID
VentasRouter.patch('/:id/estado', venta_controller_1.cambiarEstadoVenta); // Cambiar solo el estado de una venta
// DELETE
VentasRouter.delete('/:id', venta_controller_1.eliminarVenta); // Eliminar (marcar como eliminada) una venta por ID
exports.default = VentasRouter;

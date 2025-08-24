import { Router } from "express";
import {
    crearVenta,
    obtenerVentas,
    obtenerVentasPorEstado,
    obtenerVentaPorId,
    actualizarVenta,
    cambiarEstadoVenta,
    eliminarVenta,
    obtenerVentasPorUsuario,
    obtenerVentasEliminadas
} from '../controllers/venta.controller';

const VentasRouter = Router();

// CREATE
VentasRouter.post('/', crearVenta); // Crear una nueva venta

// READ
VentasRouter.get('/', obtenerVentas); // Obtener todas las ventas (excluye eliminadas)
VentasRouter.get('/eliminadas', obtenerVentasEliminadas); // Obtener ventas eliminadas
VentasRouter.get('/estado/:idestado', obtenerVentasPorEstado); // Obtener ventas por estado
VentasRouter.get('/usuario/:idusuario', obtenerVentasPorUsuario); // Obtener ventas por usuario
VentasRouter.get('/:id', obtenerVentaPorId); // Obtener una venta por ID

// UPDATE
VentasRouter.put('/:id', actualizarVenta); // Actualizar una venta completa por ID
VentasRouter.patch('/:id/estado', cambiarEstadoVenta); // Cambiar solo el estado de una venta

// DELETE
VentasRouter.delete('/:id', eliminarVenta); // Eliminar (marcar como eliminada) una venta por ID

export default VentasRouter;
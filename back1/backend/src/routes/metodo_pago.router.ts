import { Router } from "express";
import {
    createMetodoPago,
    getMetodosPago,
    getMetodoPagoById,
    updateMetodoPago,
    deleteMetodoPago,
    getMetodosPagoRegistrados,
    getMetodosPagoEliminados,
    restaurarMetodoPago,
    verificarNombreMetodoPago
} from '../controllers/metodo_pago.controller';

const MetodoPagoRouter = Router();

MetodoPagoRouter.post('/', createMetodoPago); // Crear un nuevo método de pago
MetodoPagoRouter.get('/', getMetodosPago); // Obtener todos los métodos de pago
MetodoPagoRouter.get('/registrados', getMetodosPagoRegistrados); // Obtener métodos de pago registrados/actualizados
MetodoPagoRouter.get('/eliminados', getMetodosPagoEliminados); // Obtener métodos de pago eliminados
MetodoPagoRouter.get('/verificar-nombre/:nombre', verificarNombreMetodoPago); // Verificar si existe un método de pago con el nombre
MetodoPagoRouter.get('/:id', getMetodoPagoById); // Obtener un método de pago por ID
MetodoPagoRouter.put('/:id', updateMetodoPago); // Actualizar un método de pago por ID
MetodoPagoRouter.patch('/:id/eliminar', deleteMetodoPago); // Eliminar lógicamente un método de pago (cambiar estado a eliminado)
MetodoPagoRouter.patch('/:id/restaurar', restaurarMetodoPago); // Restaurar un método de pago eliminado

export default MetodoPagoRouter;
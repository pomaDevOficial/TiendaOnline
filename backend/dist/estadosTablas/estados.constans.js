"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneroProducto = exports.TipoMovimientoLote = exports.EstadoGeneral = void 0;
exports.EstadoGeneral = {
    // Estados generales (activo/inactivo)
    REGISTRADO: 2,
    ACTUALIZADO: 3,
    ELIMINADO: 4,
    ACTIVO: 6,
    INACTIVO: 7,
    // Estados específicos de pedidos
    PEDIDO_PENDIENTE: 3,
    PEDIDO_CONFIRMADO: 4,
    PEDIDO_ENTREGADO: 5,
    PEDIDO_CANCELADO: 6,
    // Estados específicos de ventas
    VENTA_PENDIENTE: 7,
    VENTA_CONFIRMADA: 8,
    VENTA_ANULADA: 9,
    // Estados de movimiento de lotes
    MOVIMIENTO_ENTRADA: 10,
    MOVIMIENTO_SALIDA: 11,
    // Tipos de persona
    PERSONA_NATURAL: 12,
    PERSONA_JURIDICA: 13,
    // Estados de comprobantes
    COMPROBANTE_EMITIDO: 14,
    COMPROBANTE_ANULADO: 15
};
exports.TipoMovimientoLote = {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA',
    AJUSTE: 'AJUSTE'
};
exports.GeneroProducto = {
    MASCULINO: 1,
    FEMENINO: 2,
    UNISEX: 3,
    INFANTIL: 4
};

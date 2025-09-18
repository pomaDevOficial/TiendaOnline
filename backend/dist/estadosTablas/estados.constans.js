"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneroLote = exports.TipoMovimientoLote = exports.ComprobanteEstado = exports.VentaEstado = exports.PedidoEstado = exports.LoteEstado = exports.EstadoGeneral = void 0;
exports.EstadoGeneral = {
    // Estados generales (activo/inactivo)
    REGISTRADO: 2,
    ACTUALIZADO: 3,
    ELIMINADO: 4,
    ACTIVO: 6,
    INACTIVO: 7,
};
exports.LoteEstado = {
    DISPONIBLE: 9,
    AGOTADO: 10,
    ELIMINADO: 11
};
exports.PedidoEstado = {
    EN_ESPERA: 13,
    PAGADO: 14,
    CANCELADO: 15
};
exports.VentaEstado = {
    REGISTRADO: 17,
    ANULADO: 18,
};
exports.ComprobanteEstado = {
    REGISTRADO: 17,
    ANULADO: 18,
};
exports.TipoMovimientoLote = {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA'
};
exports.GeneroLote = {
    MASCULINO: 1,
    FEMENINO: 2,
    UNISEX: 3,
    INFANTIL: 4
};

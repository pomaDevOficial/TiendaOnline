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
    DISPONIBLE: 1,
    AGOTADO: 2,
    ELIMINADO: 3
};
exports.PedidoEstado = {
    EN_ESPERA: 1,
    PAGADO: 2,
    CANCELADO: 3
};
exports.VentaEstado = {
    REGISTRADO: 1,
    ANULADO: 2,
};
exports.ComprobanteEstado = {
    REGISTRADO: 1,
    ANULADO: 2,
};
exports.TipoMovimientoLote = {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA',
    AJUSTE: 'AJUSTE'
};
exports.GeneroLote = {
    MASCULINO: 1,
    FEMENINO: 2,
    UNISEX: 3,
    INFANTIL: 4
};

export const EstadoGeneral = {
    // Estados generales (activo/inactivo)
    REGISTRADO: 2,
    ACTUALIZADO: 3,
    ELIMINADO: 4 ,

    ACTIVO: 6,
    INACTIVO: 7,
    
  } as const;
   export const LoteEstado = {
    DISPONIBLE: 9,
    AGOTADO: 10,
    ELIMINADO: 11
  } 
  export const PedidoEstado = {
    EN_ESPERA: 13,
    PAGADO: 14,
    CANCELADO: 15
  }
   export const VentaEstado = {
    REGISTRADO: 17,
    ANULADO: 18,
  }  
  export const ComprobanteEstado = {
    REGISTRADO: 17,
    ANULADO: 18,
  }
  export const TipoMovimientoLote = {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA',
    AJUSTE: 'AJUSTE'
  } as const;
  
  export const GeneroLote = {
    MASCULINO: 1,
    FEMENINO: 2,
    UNISEX: 3,
    INFANTIL: 4
  } as const;
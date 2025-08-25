export const EstadoGeneral = {
    // Estados generales (activo/inactivo)
    REGISTRADO: 2,
    ACTUALIZADO: 3,
    ELIMINADO: 4 ,

    ACTIVO: 6,
    INACTIVO: 7,
    
  } as const;
   export const LoteEstado = {
    DISPONIBLE: 1,
    AGOTADO: 2,
    ELIMINADO: 3
  } 
  export const PedidoEstado = {
    EN_ESPERA: 1,
    PAGADO: 2,
    CANCELADO: 3
  }
   export const VentaEstado = {
    REGISTRADO: 1,
    ANULADO: 2,
  }  
  export const ComprobanteEstado = {
    REGISTRADO: 1,
    ANULADO: 2,
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
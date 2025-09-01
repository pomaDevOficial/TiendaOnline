
  export interface Estado {
  id: number;
  nombre: string;
}
export interface MetodoPago {
  id: number;
  nombre: string;
  idestado: number;

  Estado?: Estado;
}
  export interface Rol {
  id: number;
  nombre?: string | null;
  Estado?: Estado; // Relación 
}
export interface Marca {
    id?: number;
    nombre?: string;
    estado?: string;
    Estado?: Estado; // Relación 

}
export interface Talla {
    id?: number;
    nombre?: string;
    estado?: string;
    Estado?: Estado; // Relación

  }
  export interface Categoria {
    id?: number;
    nombre?: string;
    estado?: string;
    Estado?: Estado; // Relación 
  }

export interface Persona {
  id: number;
  idtipopersona?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
  idtipoidentidad?: number | null;
  nroidentidad?: string | null;
  correo?: string | null;
  telefono?: string | null;
  idestado?: number | null;
  Estado?: Estado; // Relación 
}
export interface Usuario {
  id: number;
  idrol?: number | null;
  idpersona?: number | null;
  usuario?: string | null;
  contrasenia?: string | null;
  idestado?: number | null;
  
  Rol?: Rol;          // Relación
  Persona?: Persona;  // Relación
  Estado?: Estado;    // Relación
}
export interface Producto{
  id: number;
  nombre: string | null;
  imagen: string | null;
  idcategoria?: number | null;
  idmarca?: number | null;
  idestado?: number | null;

  Categoria?: Categoria;
  Marca?: Marca;
  Estado?: Estado;
}
export interface Lote{
   id: number;
   idproducto?: number | null;
   proveedor?: string | null;
   fechaingreso?: Date | null;
   idestado?: number | null;

   Producto?: Producto;
   Estado?: Estado;

}
export interface LoteTalla {
  id: number;
  idlote?: number | null;
  idtalla?: number | null;
  stock?: number | null;
  esGenero?: number | null;
  preciocosto?: number | null;
  precioventa?: number | null;
  idestado?: number | null;

  Lote?: Lote;
  Talla?: Talla;
  Estado?: Estado;
}
export interface Pedido {
  id: number;
  idpersona?: number | null;
  idmetodopago?: number | null;
  fechaoperacion?: Date | null;
  idestado?: number | null;
  totalimporte?: number | null;
  adjunto?: string | null;

  Persona?: Persona;
  MetodoPago?: MetodoPago;
  Estado?: Estado;
  Detalles?: PedidoDetalle[]; // Añade esta línea
}

export interface PedidoDetalle {
  id: number;
  idpedido?: number | null;
  idlote_talla?: number | null;
  cantidad?: number | null;
  precio?: number | null;
  subtotal?: number | null;

  Pedido?: Pedido;        // relación con Pedido
  LoteTalla?: LoteTalla;  // relación con LoteTalla
}

export interface Venta {
  id: number;
  fechaventa?: Date | null;
  idusuario?: number | null;
  idpedido?: number | null;
  idestado?: number | null;

  // Relaciones
  Usuario?: Usuario;
  Pedido?: Pedido;
  Estado?: Estado;
}
export interface DetalleVenta {
  id: number;
  idpedidodetalle?: number | null;
  idventa?: number | null;
  precio_venta_real?: number | null;
  subtotal_real?: number | null;
  idestado?: number | null;

  // Relaciones
  PedidoDetalle?: PedidoDetalle;
  Venta?: Venta;
  Estado?: Estado;
}
export interface TipoSerie {
  id: number;
  nombre?: string | null;
  idestado?: number | null;
  Estado?: Estado;
}

export interface TipoComprobante {
  id: number;
  idtiposerie?: number | null;
  nombre?: string | null;
  idestado?: number | null;
  // Relaciones
  TipoSerie?: TipoSerie;
  Estado?: Estado;
}
export interface Comprobante {
  id: number;
  idventa?: number | null;
  igv?: number | null;
  descuento?: number | null;
  total?: number | null;
  idtipocomprobante?: number | null;
  numserie?: string | null;
  idestado?: number | null;

  // Relaciones opcionales
  Venta?: Venta; // Si quieres lo definimos con su interfaz de Venta
  TipoComprobante?: TipoComprobante; // Igual para TipoComprobante
  Estado?: Estado; // Igual para Estado
}
export interface MovimientoLote {
  id: number;
  idlote_talla?: number | null;
  tipomovimiento?: string | null;
  cantidad?: number | null;
  fechamovimiento?: Date | null;
  idestado?: number | null;
  // Relaciones
  LoteTalla?: LoteTalla;
  Estado?: Estado;
}


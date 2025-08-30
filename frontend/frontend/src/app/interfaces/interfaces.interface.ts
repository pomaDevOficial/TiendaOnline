
  export interface Estado {
  id: number;
  nombre: string;
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
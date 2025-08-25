  export interface Estado {
  id: number;
  nombre: string;
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

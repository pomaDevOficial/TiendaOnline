import { Router } from "express";
// import { createUsuario, getUsuarios, getUsuarioById } from '../controllers/usuario.controller';
import{
    createUsuario,
    getUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    activarUsuario,
    desactivarUsuario,
} from '../controllers/usuario.controller';

const UsuariosRouter = Router();

UsuariosRouter.post('/', createUsuario); // Crear un nuevo usuario
UsuariosRouter.get('/', getUsuarios); // Obtener la lista de usuarios
UsuariosRouter.get('/:id', getUsuarioById); // Obtener un usuario por ID
UsuariosRouter.put('/:id', updateUsuario); // Actualizar un usuario por ID
UsuariosRouter.patch('/:id/estado', deleteUsuario); // Cambia el estado del usuario
UsuariosRouter.patch('/:id/activar', activarUsuario); // Cambia el estado del usuario
UsuariosRouter.patch('/:id/desactivar', desactivarUsuario); // Cambia el estado del usuario


export default UsuariosRouter;
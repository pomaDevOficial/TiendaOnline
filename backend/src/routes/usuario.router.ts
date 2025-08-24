import { Router } from "express";
// import { createUsuario, getUsuarios, getUsuarioById } from '../controllers/usuario.controller';
import{
    createUsuario,
    getUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    activarUsuario,
} from '../controllers/usuario.controller';

const UsuariosRouter = Router();

UsuariosRouter.post('/', createUsuario); // Crear un nuevo usuario
UsuariosRouter.get('/', getUsuarios); // Obtener la lista de usuarios
UsuariosRouter.get('/:id', getUsuarioById); // Obtener un usuario por ID
UsuariosRouter.put('/:id', updateUsuario); // Actualizar un usuario por ID
UsuariosRouter.patch('/:idUsuario/estado', deleteUsuario); // Cambia el estado del usuario
UsuariosRouter.patch('/:idUsuario/activar', activarUsuario); // Cambia el estado del usuario

export default UsuariosRouter;
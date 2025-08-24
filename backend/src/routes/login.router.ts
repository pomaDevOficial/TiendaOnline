import { Router } from 'express';
import { login, verifyToken } from '../controllers/login.controller';

const authRouter = Router();

authRouter.post('/', login);
authRouter.get('/verify', verifyToken);

export default authRouter;
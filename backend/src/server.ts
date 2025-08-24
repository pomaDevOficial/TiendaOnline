import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http'; // Importa el módulo http de Node.js
import { Server as SocketIOServer, Socket } from 'socket.io'; // Importa Server y Socket de socket.io

import Loginrouter from './routes/login.router';
import Usuariorouter from './routes/usuario.router';
import db from './db/connection.db';
import authRouter from './routes/login.router';
import ProductoRouter from './routes/producto.router';
import CategoriaRouter from './routes/categoria.router';
import Marca from './models/marca.model';
import MarcaRouter from './routes/marca.router';
import TallaRouter from './routes/talla.router';
import RolesRouter from './routes/rol.router';
import PersonaRouter from './routes/persona.router';

class Server {
    private app: Application;
    private port: string;
    private httpServer: http.Server; // Crea una instancia de http.Server
    private io: SocketIOServer; // Crea una instancia de SocketIOServer
    private isRequesting: boolean = false;
    private isUpdatingPrestamos: boolean = false;
  
    
    constructor() {
      this.app = express();
      this.port = process.env.PORT || '3001';
      this.httpServer = new http.Server(this.app); // Crea un servidor http usando express
      this.io = new SocketIOServer(this.httpServer); // Crea una instancia de SocketIOServer asociada al servidor http
      
      this.listen();
      this.middlewares();
      this.routes();
      this.dbConnect();
    //  this.setupWebSockets();
    }
  
    private listen() {
      this.httpServer.listen(this.port, () => {
        console.log(`Aplicacion corriendo en el puerto ${this.port}`);
      });
    }
  
    private middlewares() {
      this.app.use(express.json());
      this.app.use(cors({
        // origin: 'http://161.132.49.58:5200',
        origin: 'http://localhost:4200',
        
        credentials: true // Habilita el intercambio de cookies o encabezados de autenticación
      }));
    }
  
    private routes() {
      this.app.get('/', (req: Request, res: Response) => {
        res.json({
          msg: 'API Working'
        });
      });
  
      
       this.app.use('/api/v1/login', authRouter);
       this.app.use('/api/v1/usuarios', Usuariorouter);
       this.app.use('/api/v1/productos', ProductoRouter);
       this.app.use('/api/v1/categorias', CategoriaRouter);
       this.app.use('/api/v1/marcas', MarcaRouter);
       this.app.use('/api/v1/tallas', TallaRouter);
       this.app.use('/api/v1/roles', RolesRouter);
       this.app.use('/api/v1/personas', PersonaRouter);

  
    }
  
    private async dbConnect() {
      try {
          await db.authenticate();
          console.log('Base de datos conectada')
      } catch (error) {
        console.log('Error al conectarse a la base de datos:', error);
      }
    }
  

    
   }

   const serverInstance = new Server();
   export default serverInstance;
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http'; // Importa el módulo http de Node.js
import { Server as SocketIOServer, Socket } from 'socket.io'; // Importa Server y Socket de socket.io
import path from "path";

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
import RouterDni from './routes/apidni.router';
import routerRUC from './routes/apiruc.router';
import LoteRouter from './routes/lote.router';
import LoteTallaRouter from './routes/lote_talla.router';
import PedidoRouter from './routes/pedido.router';
import PedidoDetalleRouter from './routes/pedido_detalle.router';
import VentaRouter from './routes/venta.router';
import DetalleVentaRouter from './routes/detalleventa.router';
import ComprobanteRouter from './routes/comprobante.router';
import routerWsp from './routes/wsp.router';
import sharp from "sharp";
import morgan from "morgan";
import TipoComprobante from './models/tipo_comprobante.model';
import TipoSerie from './models/tiposerie.model';
import TipoComprobanteRouter from './routes/tipo_comprobante.router';
import TipoSerieRouter from './routes/tiposerie.router';
import MetodoPago from './models/metodo_pago.model';
import MetodoPagoRouter from './routes/metodo_pago.router';

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
      this.app.use(morgan('dev'));
      //  const imagesFolder = path.join(__dirname, "../../dist/uploads/productos");
      //  console.log(imagesFolder)
      //  // 👀 Rutas públicas para servir imágenes del catálogo
      // //  this.app.use("/uploads/productos", express.static(path.join(__dirname, "../uploads/productos")));
      // this.app.use("/uploads/productos", (req, res, next) => {
      //     const rutaImagen = path.join(imagesFolder, req.url); // ej: /ejemplo.png → uploads/productos/ejemplo.png
      //     console.log(rutaImagen)
      //     sharp(rutaImagen)
      //       .resize(800) // redimensiona a 800px de ancho
      //       .toBuffer((err, buffer) => {
      //         if (err) {
      //           console.error("❌ Error procesando imagen:", err);
      //           return next(); // si falla, pasa al siguiente middleware
      //         }
      //         res.setHeader("Content-Type", "image/jpeg");
      //         res.send(buffer);
      //       });
      //   });
      this.app.use(cors({
        // origin: 'http://161.132.49.58:5200',
        origin: [
    'http://localhost:4200',   // frontend cliente
    'http://localhost:4300'    // frontend admin
      ],
        credentials: true // Habilita el intercambio de cookies o encabezados de autenticación
      }));
    }
  
    private routes() {
      this.app.get('/', (req: Request, res: Response) => {
        res.json({
          msg: 'API Working'
        });
      });
     
      const imagesFolder = path.resolve(__dirname, "..", "..", "backend/dist/uploads");

    this.app.use("/uploads", (req: Request, res: Response, next) => {
      const rutaImagen = path.join(imagesFolder, req.url);
      console.log("📂 Buscando imagen en:", rutaImagen);

      sharp(rutaImagen)
        .resize(800)
        .toBuffer((err, buffer) => {
          if (err) {
            console.error("❌ Error procesando imagen:", err.message);
            return res.status(404).send("Imagen no encontrada");
          }
          res.setHeader("Content-Type", "image/jpeg");
          res.send(buffer);
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
       this.app.use('/api/v1/dni', RouterDni);
       this.app.use('/api/v1/ruc', routerRUC);
       this.app.use('/api/v1/lotes', LoteRouter);
       this.app.use('/api/v1/lotetallas', LoteTallaRouter);
       this.app.use('/api/v1/pedidos', PedidoRouter);
       this.app.use('/api/v1/pedidodetalle', PedidoDetalleRouter);
       this.app.use('/api/v1/ventas', VentaRouter);
       this.app.use('/api/v1/detalleventa', DetalleVentaRouter);
       this.app.use('/api/v1/comprobantes', ComprobanteRouter);
       this.app.use('/api/v1/wsp', routerWsp); //  Esto está bien
       this.app.use('/api/v1/tipocomprobante', TipoComprobanteRouter); //  Esto está bien
       this.app.use('/api/v1/tiposerie', TipoSerieRouter); //  Esto está bien
       this.app.use('/api/v1/metodopagos', MetodoPagoRouter); //  Esto está bien

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
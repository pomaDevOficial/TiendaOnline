import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import http from 'http'; // Importa el módulo http de Node.js
import { Server as SocketIOServer, Socket } from 'socket.io'; // Importa Server y Socket de socket.io
import path from "path";
import { Client, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
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
import RouterSunat from './routes/apiSunat.router';
import LoteRouter from './routes/lote.router';
import LoteTallaRouter from './routes/lote_talla.router';
import PedidoRouter from './routes/pedido.router';
import PedidoDetalleRouter from './routes/pedido_detalle.router';
import VentaRouter from './routes/venta.router';
import DetalleVentaRouter from './routes/detalleventa.router';
import ComprobanteRouter from './routes/comprobante.router';
import routerWsp from './routes/wsp.router';
import morgan from "morgan";
import TipoComprobante from './models/tipo_comprobante.model';
import TipoSerie from './models/tiposerie.model';
import TipoComprobanteRouter from './routes/tipo_comprobante.router';
import TipoSerieRouter from './routes/tiposerie.router';
import MetodoPago from './models/metodo_pago.model';
import MetodoPagoRouter from './routes/metodo_pago.router';
import MovimientoLote from './models/movimiento_lote.model';
import MovimientoLoteRouter from './routes/movimiento_lote.router';

class Server {
    private app: any;
    private port: string;
    private httpServer: http.Server; // Crea una instancia de http.Server
    private io: SocketIOServer; // Crea una instancia de SocketIOServer
    private isRequesting: boolean = false;
    private isUpdatingPrestamos: boolean = false;
    // private client: Client;
    // private qrCodeData: string | null = null;
    // private isWhatsAppConnected: boolean = false;
    // private ADMIN_NUMBER = '51916901549';
    // private NOTIFICATION_NUMBER = '51916901549';
    // private lastConnectionStatus = null;
    // private sessionRestored = false;
    // private welcomeNotificationSent = false;
    // private autoResponses = {
    //     greetings: [
    //         'hola', 'buenos días', 'buenas tardes', 'buenas noches',
    //         'buen día', 'saludos', 'hey', 'hi', 'hello', 'qué tal'
    //     ],
    //     faq: {
    //         'qué eres': 'Soy un bot de WhatsApp desarrollado para enviar notificaciones y gestionar comunicaciones.',
    //         'qué puedes hacer': 'Puedo enviar mensajes, archivos, notificaciones automáticas y responder comandos.',
    //         'cómo funciona': 'Estoy conectado a WhatsApp Web y respondo automáticamente a tus comandos.',
    //         'quién te creó': 'Fui desarrollado con Node.js y WhatsApp Web para facilitar las comunicaciones.',
    //         'ayuda': 'Usa !help para ver todos los comandos disponibles.',
    //         'comandos': 'Usa !help para ver la lista completa de comandos.'
    //     },
    //     fun: [
    //         '¡Claro! ¿En qué puedo ayudarte?',
    //         '¡Hola! ¿Qué necesitas?',
    //         '¡Hey! ¿Cómo estás?',
    //         '¡Saludos! ¿Qué tal tu día?'
    //     ]
    // };

    
    constructor() {
  

      this.app = express();
      this.port = process.env.PORT || '3001';
      this.httpServer = new http.Server(this.app); // Crea un servidor http usando express
      this.io = new SocketIOServer(this.httpServer); // Crea una instancia de SocketIOServer asociada al servidor http
      // this.client = new Client({
      //   puppeteer: {
      //     headless: true,
      //     args: [
      //       '--no-sandbox',
      //       '--disable-setuid-sandbox',
      //       '--disable-dev-shm-usage',
      //       '--disable-accelerated-2d-canvas',
      //       '--no-first-run',
      //       '--no-zygote',
      //       '--disable-gpu',
      //       '--disable-web-security',
      //       '--disable-features=VizDisplayCompositor',
      //       '--disable-extensions',
      //       '--disable-plugins',
      //       '--disable-default-apps',
      //       '--disable-background-timer-throttling',
      //       '--disable-backgrounding-occluded-windows',
      //       '--disable-renderer-backgrounding',
      //       '--memory-pressure-off',
      //       '--disable-blink-features=AutomationControlled',
      //       '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      //     ]
      //   },
      //   webVersionCache: {
      //     type: 'remote',
      //     remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      //   },
      //   // Configuración para mantener sesión persistente
      //   authStrategy: undefined, // Permitir restauración automática de sesión
      //   restartOnAuthFail: false, // No reiniciar automáticamente para mantener QR
      //   takeoverOnConflict: false, // Evitar conflictos que cierren la sesión
      //   takeoverTimeoutMs: 0 // Deshabilitar takeover
      // });

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
      const clientOrigins = process.env.CORS_ORIGINS_CLIENT?.split(',') || [];
      const adminOrigins = process.env.CORS_ORIGINS_ADMIN?.split(',') || [];
      const allowedOrigins = [...clientOrigins, ...adminOrigins];
      this.app.use(cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`❌ No permitido por CORS: ${origin}`));
          }
        },
        credentials: true
      }));


      // this.app.use(cors({
      //   // origin: 'http://161.132.49.58:5200',
      //   origin: [
      // 'http://localhost:4200',   // frontend cliente
      // 'http://localhost:58362',    // frontend admin
      // 'http://localhost:60877',    // frontend admin 59609
      // 'http://localhost:54297'    // frontend admin 59609
      // ],
      //   credentials: true // Habilita el intercambio de cookies o encabezados de autenticación
      // }));  
    } 
  
    private routes() { 
      this.app.get('/', (req: Request, res: Response) => {
        res.json({
          msg: 'API Working'
        });
      });
     
      const imagesFolder = path.resolve(__dirname, "..", "..", "backend/dist/uploads");
    this.app.use("/uploads", express.static(imagesFolder));
    // this.app.use("/uploads", (req: Request, res: Response, next: NextFunction) => {
    //   const rutaImagen = path.join(imagesFolder, req.url);
    //   console.log("📂 Buscando imagen en:", rutaImagen);

    //   sharp(rutaImagen)
    //     .resize(800)
    //     .toBuffer((err, buffer) => {
    //       if (err) {
    //         console.error("❌ Error procesando imagen:", err.message);
    //         return res.status(404).send("Imagen no encontrada");
    //       }
    //       res.setHeader("Content-Type", "image/jpeg");
    //       res.send(buffer);
    //     });
    // });
       this.app.use('/api/v1/login', authRouter);
       this.app.use('/api/v1/usuarios', Usuariorouter);
       this.app.use('/api/v1/productos', ProductoRouter);
       this.app.use('/api/v1/categorias', CategoriaRouter);
       this.app.use('/api/v1/marcas', MarcaRouter);
       this.app.use('/api/v1/tallas', TallaRouter);
       this.app.use('/api/v1/roles', RolesRouter);
       this.app.use('/api/v1/personas', PersonaRouter);
       this.app.use('/api/v1/sunat', RouterSunat);
       this.app.use('/api/v1/lotes', LoteRouter);
       this.app.use('/api/v1/lotetallas', LoteTallaRouter);
       this.app.use('/api/v1/pedidos', PedidoRouter);
       this.app.use('/api/v1/pedidodetalle', PedidoDetalleRouter);
       this.app.use('/api/v1/ventas', VentaRouter);
       this.app.use('/api/v1/detallesventa', DetalleVentaRouter);
       this.app.use('/api/v1/comprobantes', ComprobanteRouter);
       this.app.use('/api/v1/wsp', routerWsp); //  Esto está bien
       this.app.use('/api/v1/tipocomprobante', TipoComprobanteRouter); //  Esto está bien
       this.app.use('/api/v1/tiposerie', TipoSerieRouter); //  Esto está bien
       this.app.use('/api/v1/metodopagos', MetodoPagoRouter); //  Esto está bien
       this.app.use('/api/v1/movimientoslote', MovimientoLoteRouter); //  Esto está bien


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
   export { serverInstance as server };
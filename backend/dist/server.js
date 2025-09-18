"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http")); // Importa el módulo http de Node.js
const socket_io_1 = require("socket.io"); // Importa Server y Socket de socket.io
const path_1 = __importDefault(require("path"));
const usuario_router_1 = __importDefault(require("./routes/usuario.router"));
const connection_db_1 = __importDefault(require("./db/connection.db"));
const login_router_1 = __importDefault(require("./routes/login.router"));
const producto_router_1 = __importDefault(require("./routes/producto.router"));
const categoria_router_1 = __importDefault(require("./routes/categoria.router"));
const marca_router_1 = __importDefault(require("./routes/marca.router"));
const talla_router_1 = __importDefault(require("./routes/talla.router"));
const rol_router_1 = __importDefault(require("./routes/rol.router"));
const persona_router_1 = __importDefault(require("./routes/persona.router"));
const apiSunat_router_1 = __importDefault(require("./routes/apiSunat.router"));
const lote_router_1 = __importDefault(require("./routes/lote.router"));
const lote_talla_router_1 = __importDefault(require("./routes/lote_talla.router"));
const pedido_router_1 = __importDefault(require("./routes/pedido.router"));
const pedido_detalle_router_1 = __importDefault(require("./routes/pedido_detalle.router"));
const venta_router_1 = __importDefault(require("./routes/venta.router"));
const detalleventa_router_1 = __importDefault(require("./routes/detalleventa.router"));
const comprobante_router_1 = __importDefault(require("./routes/comprobante.router"));
const wsp_router_1 = __importDefault(require("./routes/wsp.router"));
const sharp_1 = __importDefault(require("sharp"));
const morgan_1 = __importDefault(require("morgan"));
const tipo_comprobante_router_1 = __importDefault(require("./routes/tipo_comprobante.router"));
const tiposerie_router_1 = __importDefault(require("./routes/tiposerie.router"));
const metodo_pago_router_1 = __importDefault(require("./routes/metodo_pago.router"));
const movimiento_lote_router_1 = __importDefault(require("./routes/movimiento_lote.router"));
class Server {
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
        this.isRequesting = false;
        this.isUpdatingPrestamos = false;
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3001';
        this.httpServer = new http_1.default.Server(this.app); // Crea un servidor http usando express
        this.io = new socket_io_1.Server(this.httpServer); // Crea una instancia de SocketIOServer asociada al servidor http
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
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`Aplicacion corriendo en el puerto ${this.port}`);
        });
    }
    middlewares() {
        var _a, _b;
        this.app.use(express_1.default.json());
        this.app.use((0, morgan_1.default)('dev'));
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
        const clientOrigins = ((_a = process.env.CORS_ORIGINS_CLIENT) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
        const adminOrigins = ((_b = process.env.CORS_ORIGINS_ADMIN) === null || _b === void 0 ? void 0 : _b.split(',')) || [];
        const allowedOrigins = [...clientOrigins, ...adminOrigins];
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
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
    routes() {
        this.app.get('/', (req, res) => {
            res.json({
                msg: 'API Working'
            });
        });
        const imagesFolder = path_1.default.resolve(__dirname, "..", "..", "backend/dist/uploads");
        this.app.use("/uploads", (req, res, next) => {
            const rutaImagen = path_1.default.join(imagesFolder, req.url);
            console.log("📂 Buscando imagen en:", rutaImagen);
            (0, sharp_1.default)(rutaImagen)
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
        this.app.use('/api/v1/login', login_router_1.default);
        this.app.use('/api/v1/usuarios', usuario_router_1.default);
        this.app.use('/api/v1/productos', producto_router_1.default);
        this.app.use('/api/v1/categorias', categoria_router_1.default);
        this.app.use('/api/v1/marcas', marca_router_1.default);
        this.app.use('/api/v1/tallas', talla_router_1.default);
        this.app.use('/api/v1/roles', rol_router_1.default);
        this.app.use('/api/v1/personas', persona_router_1.default);
        this.app.use('/api/v1/sunat', apiSunat_router_1.default);
        this.app.use('/api/v1/lotes', lote_router_1.default);
        this.app.use('/api/v1/lotetallas', lote_talla_router_1.default);
        this.app.use('/api/v1/pedidos', pedido_router_1.default);
        this.app.use('/api/v1/pedidodetalle', pedido_detalle_router_1.default);
        this.app.use('/api/v1/ventas', venta_router_1.default);
        this.app.use('/api/v1/detallesventa', detalleventa_router_1.default);
        this.app.use('/api/v1/comprobantes', comprobante_router_1.default);
        this.app.use('/api/v1/wsp', wsp_router_1.default); //  Esto está bien
        this.app.use('/api/v1/tipocomprobante', tipo_comprobante_router_1.default); //  Esto está bien
        this.app.use('/api/v1/tiposerie', tiposerie_router_1.default); //  Esto está bien
        this.app.use('/api/v1/metodopagos', metodo_pago_router_1.default); //  Esto está bien
        this.app.use('/api/v1/movimientoslote', movimiento_lote_router_1.default); //  Esto está bien
    }
    async dbConnect() {
        try {
            await connection_db_1.default.authenticate();
            console.log('Base de datos conectada');
        }
        catch (error) {
            console.log('Error al conectarse a la base de datos:', error);
        }
    }
}
const serverInstance = new Server();
exports.server = serverInstance;
exports.default = serverInstance;

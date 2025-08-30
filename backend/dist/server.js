"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const apidni_router_1 = __importDefault(require("./routes/apidni.router"));
const apiruc_router_1 = __importDefault(require("./routes/apiruc.router"));
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
class Server {
    constructor() {
        this.isRequesting = false;
        this.isUpdatingPrestamos = false;
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3001';
        this.httpServer = new http_1.default.Server(this.app); // Crea un servidor http usando express
        this.io = new socket_io_1.Server(this.httpServer); // Crea una instancia de SocketIOServer asociada al servidor http
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
        this.app.use((0, cors_1.default)({
            // origin: 'http://161.132.49.58:5200',
            origin: [
                'http://localhost:4200', // frontend cliente
                'http://localhost:4300' // frontend admin
            ],
            credentials: true // Habilita el intercambio de cookies o encabezados de autenticación
        }));
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
        this.app.use('/api/v1/dni', apidni_router_1.default);
        this.app.use('/api/v1/ruc', apiruc_router_1.default);
        this.app.use('/api/v1/lotes', lote_router_1.default);
        this.app.use('/api/v1/lotetallas', lote_talla_router_1.default);
        this.app.use('/api/v1/pedidos', pedido_router_1.default);
        this.app.use('/api/v1/pedidodetalle', pedido_detalle_router_1.default);
        this.app.use('/api/v1/ventas', venta_router_1.default);
        this.app.use('/api/v1/detalleventa', detalleventa_router_1.default);
        this.app.use('/api/v1/comprobantes', comprobante_router_1.default);
        this.app.use('/api/v1/wsp', wsp_router_1.default); //  Esto está bien
        this.app.use('/api/v1/tipocomprobante', tipo_comprobante_router_1.default); //  Esto está bien
        this.app.use('/api/v1/tiposerie', tiposerie_router_1.default); //  Esto está bien
        this.app.use('/api/v1/metodopagos', metodo_pago_router_1.default); //  Esto está bien
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_db_1.default.authenticate();
                console.log('Base de datos conectada');
            }
            catch (error) {
                console.log('Error al conectarse a la base de datos:', error);
            }
        });
    }
}
const serverInstance = new Server();
exports.default = serverInstance;

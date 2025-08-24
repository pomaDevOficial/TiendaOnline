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
const connection_db_1 = __importDefault(require("./db/connection.db"));
const login_router_1 = __importDefault(require("./routes/login.router"));
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
        this.app.use((0, cors_1.default)({
            // origin: 'http://161.132.49.58:5200',
            origin: 'http://localhost:4200',
            credentials: true // Habilita el intercambio de cookies o encabezados de autenticación
        }));
    }
    routes() {
        this.app.get('/', (req, res) => {
            res.json({
                msg: 'API Working'
            });
        });
        this.app.use('/api/v1/login', login_router_1.default);
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

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http")); // Importa el módulo http de Node.js
const socket_io_1 = require("socket.io"); // Importa Server y Socket de socket.io
const path_1 = __importDefault(require("path"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const QRCode = __importStar(require("qrcode"));
const fs = __importStar(require("fs"));
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
    constructor() {
        this.isRequesting = false;
        this.isUpdatingPrestamos = false;
        this.qrCodeData = null;
        this.isWhatsAppConnected = false;
        this.ADMIN_NUMBER = '51916901549';
        this.NOTIFICATION_NUMBER = null;
        this.lastConnectionStatus = null;
        this.autoResponses = {
            greetings: [
                'hola', 'buenos días', 'buenas tardes', 'buenas noches',
                'buen día', 'saludos', 'hey', 'hi', 'hello', 'qué tal'
            ],
            faq: {
                'qué eres': 'Soy un bot de WhatsApp desarrollado para enviar notificaciones y gestionar comunicaciones.',
                'qué puedes hacer': 'Puedo enviar mensajes, archivos, notificaciones automáticas y responder comandos.',
                'cómo funciona': 'Estoy conectado a WhatsApp Web y respondo automáticamente a tus comandos.',
                'quién te creó': 'Fui desarrollado con Node.js y WhatsApp Web para facilitar las comunicaciones.',
                'ayuda': 'Usa !help para ver todos los comandos disponibles.',
                'comandos': 'Usa !help para ver la lista completa de comandos.'
            },
            fun: [
                '¡Claro! ¿En qué puedo ayudarte?',
                '¡Hola! ¿Qué necesitas?',
                '¡Hey! ¿Cómo estás?',
                '¡Saludos! ¿Qué tal tu día?'
            ]
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3001';
        this.httpServer = new http_1.default.Server(this.app); // Crea un servidor http usando express
        this.io = new socket_io_1.Server(this.httpServer); // Crea una instancia de SocketIOServer asociada al servidor http
        this.client = new whatsapp_web_js_1.Client({
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        this.listen();
        this.middlewares();
        this.routes();
        this.dbConnect();
        //  this.setupWebSockets();
        setTimeout(() => this.initializeWhatsApp(), 2000);
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
                'http://localhost:4300', // frontend admin
                'http://localhost:50913', // frontend admin 59609
                'http://localhost:59609' // frontend admin 59609
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
        // WhatsApp endpoints
        this.app.post('/send', (req, res, next) => this.sendMessage(req, res, next));
        this.app.post('/sendFile', (req, res, next) => this.sendFile(req, res, next));
        this.app.get('/chats', (req, res, next) => this.getChats(req, res, next));
        this.app.post('/sendToGroup', (req, res, next) => this.sendToGroup(req, res, next));
        this.app.post('/sendFileToGroup', (req, res, next) => this.sendFileToGroup(req, res, next));
        this.app.get('/status', (req, res, next) => this.getStatus(req, res, next));
        this.app.get('/bot-status', (req, res, next) => this.getBotStatus(req, res, next));
        this.app.get('/qr', (req, res, next) => this.getQR(req, res, next));
        this.app.get('/whatsapp-frontend-status', (req, res, next) => this.getWhatsAppFrontendStatus(req, res, next));
        this.app.post('/notify', (req, res, next) => this.notify(req, res, next));
        this.app.get('/bot-config', (req, res, next) => this.getBotConfig(req, res, next));
        this.app.post('/bot-config', (req, res, next) => this.updateBotConfig(req, res, next));
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
    initializeWhatsApp() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setupWhatsAppEvents();
                // Inicializar WhatsApp de forma completamente asíncrona para no bloquear
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        console.log('Iniciando conexión a WhatsApp en segundo plano...');
                        yield this.client.initialize();
                        console.log('WhatsApp inicializado exitosamente');
                    }
                    catch (error) {
                        console.error('Error inicializando WhatsApp:', error);
                    }
                }), 3000); // Delay mayor para asegurar que el servidor esté completamente listo
            }
            catch (error) {
                console.error('Error en setup de WhatsApp:', error);
            }
        });
    }
    setupWhatsAppEvents() {
        this.client.on('qr', (qr) => __awaiter(this, void 0, void 0, function* () {
            // Solo almacenar QR sin logs que interfieran con peticiones HTTP
            this.qrCodeData = qr;
        }));
        this.client.on('ready', () => {
            console.log('Cliente de WhatsApp listo y conectado!');
            this.isWhatsAppConnected = true;
            this.sendAdminNotification('✅ WhatsApp conectado exitosamente');
        });
        this.client.on('authenticated', () => {
            console.log('Autenticación exitosa! Sesión guardada.');
            this.isWhatsAppConnected = true;
        });
        this.client.on('auth_failure', (msg) => {
            console.error('Fallo en la autenticación:', msg);
            this.sendAdminNotification('❌ Error de autenticación: ' + msg);
        });
        this.client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            // Limpiar el estado del cliente inmediatamente
            this.isWhatsAppConnected = false;
            this.qrCodeData = null;
            this.sendAdminNotification('⚠️ WhatsApp desconectado: ' + reason);
            // Reiniciar automáticamente
            setTimeout(() => {
                this.reinitializeClient();
            }, 5000);
        });
        // Message event
        this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const chat = yield message.getChat();
                const contact = yield message.getContact();
                const senderName = contact.pushname || contact.number || 'Usuario';
                if (!chat.isGroup && message.from !== this.ADMIN_NUMBER + '@c.us') {
                    return;
                }
                const messageBody = message.body.toLowerCase().trim();
                const originalMessage = message.body.trim();
                if (messageBody.startsWith('!')) {
                    const command = messageBody.substring(1);
                    yield this.handleCommand(command, message, chat);
                }
                else {
                    const autoResponse = this.getAutoResponse(originalMessage);
                    if (autoResponse) {
                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield message.reply(autoResponse);
                            }
                            catch (error) {
                                console.error('Error enviando respuesta automática:', error);
                            }
                        }), 1000 + Math.random() * 2000);
                    }
                }
                if (message.mentionedIds && message.mentionedIds.includes((_b = (_a = this.client.info) === null || _a === void 0 ? void 0 : _a.wid) === null || _b === void 0 ? void 0 : _b._serialized)) {
                    yield message.reply(`👋 ¡Hola ${senderName}! Soy el bot de notificaciones. Usa !help para ver mis comandos.`);
                }
            }
            catch (error) {
                console.error('Error procesando mensaje:', error);
                try {
                    yield message.reply('❌ Ocurrió un error procesando tu mensaje.');
                }
                catch (replyError) {
                    console.error('Error enviando respuesta de error:', replyError);
                }
            }
        }));
        // Group events
        this.client.on('group_join', (notification) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield notification.getChat();
                const newMember = yield notification.getContact();
                const welcomeMessage = `👋 ¡Bienvenido/a ${newMember.pushname || 'Nuevo miembro'} al grupo *${chat.name}*!\n\n📋 *Reglas importantes:*\n• Lee las reglas con !reglas\n• Sé respetuoso con todos\n• Disfruta tu estadía en el grupo\n\n🤖 Soy el bot del grupo. Usa !help para ver mis comandos.`;
                yield notification.reply(welcomeMessage);
                // Notify admins
                const admins = chat.participants.filter((p) => p.isAdmin);
                for (const admin of admins) {
                    try {
                        yield this.client.sendMessage(admin.id._serialized, `👤 *Nuevo miembro en ${chat.name}*\n${newMember.pushname || 'Usuario'} se unió al grupo.`);
                    }
                    catch (error) {
                        console.error('Error notificando a admin:', error);
                    }
                }
            }
            catch (error) {
                console.error('Error procesando nuevo miembro:', error);
            }
        }));
        this.client.on('group_leave', (notification) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield notification.getChat();
                const leftMember = yield notification.getContact();
                const admins = chat.participants.filter((p) => p.isAdmin);
                for (const admin of admins) {
                    try {
                        yield this.client.sendMessage(admin.id._serialized, `👋 *Miembro salió de ${chat.name}*\n${leftMember.pushname || 'Usuario'} abandonó el grupo.`);
                    }
                    catch (error) {
                        console.error('Error notificando salida:', error);
                    }
                }
            }
            catch (error) {
                console.error('Error procesando salida de miembro:', error);
            }
        }));
        // Moderation
        this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield message.getChat();
                if (!chat.isGroup)
                    return;
                const messageBody = message.body.toLowerCase();
                const linkRegex = /(https?:\/\/[^\s]+)/g;
                if (linkRegex.test(message.body)) {
                    const links = message.body.match(linkRegex);
                    if (links) {
                        for (const link of links) {
                            const suspiciousLinks = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
                            if (suspiciousLinks.some(domain => link.includes(domain))) {
                                yield message.reply('⚠️ *Enlace sospechoso detectado*\n\nPor favor, verifica el enlace antes de hacer clic.\nLos administradores han sido notificados.');
                                const admins = chat.participants.filter((p) => p.isAdmin);
                                for (const admin of admins) {
                                    try {
                                        yield this.client.sendMessage(admin.id._serialized, `⚠️ *Enlace sospechoso en ${chat.name}*\nUsuario: ${(yield message.getContact()).pushname || 'Desconocido'}\nEnlace: ${link}`);
                                    }
                                    catch (error) {
                                        console.error('Error notificando enlace sospechoso:', error);
                                    }
                                }
                                break;
                            }
                        }
                    }
                    const forbiddenWords = ['spam', 'scam', 'hack', 'virus', 'malware', 'estafa'];
                    if (forbiddenWords.some(word => messageBody.includes(word))) {
                        const participant = chat.participants.find((p) => p.id._serialized === message.author);
                        if (participant && !participant.isAdmin) {
                            yield message.reply('⚠️ *Contenido sospechoso detectado*\n\nTu mensaje contiene palabras que podrían indicar contenido no apropiado.\nPor favor, mantén conversaciones positivas.');
                            const admins = chat.participants.filter((p) => p.isAdmin);
                            for (const admin of admins) {
                                try {
                                    yield this.client.sendMessage(admin.id._serialized, `🚨 *Mensaje sospechoso en ${chat.name}*\nUsuario: ${(yield message.getContact()).pushname || 'Desconocido'}\nMensaje: ${message.body.substring(0, 100)}...`);
                                }
                                catch (error) {
                                    console.error('Error notificando mensaje sospechoso:', error);
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error en moderación automática:', error);
            }
        }));
    }
    reinitializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Limpiando sesión anterior...');
                this.isWhatsAppConnected = false;
                this.qrCodeData = null;
                const sessionPath = './whatsapp-session';
                if (fs.existsSync(sessionPath)) {
                    const files = fs.readdirSync(sessionPath);
                    for (const file of files) {
                        const filePath = path_1.default.join(sessionPath, file);
                        try {
                            fs.unlinkSync(filePath);
                            console.log('Archivo de sesión eliminado:', file);
                        }
                        catch (err) {
                            console.error('Error eliminando archivo de sesión:', file, err);
                        }
                    }
                }
                const cachePath = './.wwebjs_cache';
                if (fs.existsSync(cachePath)) {
                    try {
                        fs.rmSync(cachePath, { recursive: true, force: true });
                        console.log('Cache de puppeteer limpiado');
                    }
                    catch (err) {
                        console.error('Error limpiando cache:', err);
                    }
                }
                console.log('Sesión limpiada. Reinicializando cliente...');
                try {
                    yield this.client.destroy();
                    console.log('Cliente anterior destruido');
                }
                catch (err) {
                    console.error('Error destruyendo cliente anterior:', err);
                }
                yield new Promise(resolve => setTimeout(resolve, 2000));
                yield this.client.initialize();
                console.log('Cliente reinicializado exitosamente');
            }
            catch (error) {
                console.error('Error en reinicialización:', error);
                setTimeout(() => {
                    console.log('Reintentando reinicialización...');
                    this.reinitializeClient();
                }, 10000);
            }
        });
    }
    getAutoResponse(messageBody) {
        const lowerMessage = messageBody.toLowerCase();
        for (const greeting of this.autoResponses.greetings) {
            if (lowerMessage.includes(greeting)) {
                return this.autoResponses.fun[Math.floor(Math.random() * this.autoResponses.fun.length)];
            }
        }
        for (const [question, answer] of Object.entries(this.autoResponses.faq)) {
            if (lowerMessage.includes(question)) {
                return answer;
            }
        }
        if (lowerMessage.includes('?') || lowerMessage.includes('¿')) {
            if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
                return `🕐 *Hora actual:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Lima' })}`;
            }
            if (lowerMessage.includes('fecha') || lowerMessage.includes('día')) {
                return `📅 *Fecha actual:* ${new Date().toLocaleDateString('es-ES')}`;
            }
            if (lowerMessage.includes('estado') || lowerMessage.includes('funcionando')) {
                return '✅ *Estado:* El bot está funcionando correctamente y conectado a WhatsApp.';
            }
        }
        return null;
    }
    sendAdminNotification(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetNumber = this.NOTIFICATION_NUMBER || this.ADMIN_NUMBER;
            if (!targetNumber) {
                console.log('Número de administrador no configurado');
                return;
            }
            try {
                yield this.client.sendMessage(targetNumber + '@c.us', message);
                console.log('Notificación enviada al administrador:', message);
            }
            catch (error) {
                console.error('Error enviando notificación al administrador:', error);
            }
        });
    }
    handleCommand(command, message, chat) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            switch (command) {
                case 'help':
                    const helpMessage = `*🤖 Comandos del Bot de WhatsApp*\n\n*Comandos disponibles:*\n• !help - Mostrar esta ayuda\n• !status - Estado del bot\n• !ping - Verificar conectividad\n• !info - Información del grupo\n• !uptime - Tiempo activo del bot\n• !reglas - Ver reglas del grupo\n• !admin - Mencionar administradores\n• !miembros - Contar miembros del grupo\n• !bienvenida - Configurar mensaje de bienvenida\n• !moderacion - Estado de moderación\n\n*Funcionalidades:*\n• ✅ Envío de mensajes\n• ✅ Envío de archivos\n• ✅ Notificaciones automáticas\n• ✅ Gestión de grupos\n• ✅ Respuestas automáticas\n• ✅ Moderación automática\n• ✅ Bienvenidas automáticas\n\n_Bot desarrollado con Node.js y WhatsApp Web_`;
                    yield message.reply(helpMessage);
                    break;
                case 'status':
                    const statusMessage = `*📊 Estado del Bot*\n\n✅ *Conectado:* ${this.client.info ? 'Sí' : 'No'}\n📱 *Número:* ${((_b = (_a = this.client.info) === null || _a === void 0 ? void 0 : _a.wid) === null || _b === void 0 ? void 0 : _b.user) || 'N/A'}\n⏰ *Uptime:* ${Math.floor(process.uptime() / 60)} minutos\n👥 *Grupos:* ${chat.isGroup ? 'Mensaje en grupo' : 'Mensaje privado'}`;
                    yield message.reply(statusMessage);
                    break;
                case 'ping':
                    const pingTime = Date.now() - message.timestamp * 1000;
                    yield message.reply(`🏓 *Pong!* (${pingTime}ms)`);
                    break;
                case 'info':
                    if (chat.isGroup) {
                        const groupInfo = `*📋 Información del Grupo*\n\n👥 *Nombre:* ${chat.name}\n👤 *Descripción:* ${chat.description || 'Sin descripción'}\n👥 *Participantes:* ${((_c = chat.participants) === null || _c === void 0 ? void 0 : _c.length) || 'N/A'}\n🔒 *Tipo:* ${chat.isGroup ? 'Grupo' : 'Chat privado'}`;
                        yield message.reply(groupInfo);
                    }
                    else {
                        yield message.reply('ℹ️ Este comando solo funciona en grupos');
                    }
                    break;
                case 'uptime':
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);
                    yield message.reply(`⏰ *Tiempo activo:* ${hours}h ${minutes}m ${seconds}s`);
                    break;
                case 'reglas':
                    const reglasMessage = `*📋 Reglas del Grupo*\n\n1️⃣ *Respeto:* Trata a todos los miembros con respeto\n2️⃣ *Contenido apropiado:* No enviar contenido ofensivo o inapropiado\n3️⃣ *Spam:* Evita enviar mensajes repetidos o innecesarios\n4️⃣ *Enlaces:* Verifica enlaces antes de compartirlos\n5️⃣ *Privacidad:* No compartas información personal de otros\n6️⃣ *Comandos:* Usa los comandos del bot correctamente\n\n⚠️ *Incumplimiento de reglas:*\n• Advertencia verbal\n• Silencio temporal (si es necesario)\n• Expulsión (casos graves)\n\n¡Mantengamos un ambiente positivo! 😊`;
                    yield message.reply(reglasMessage);
                    break;
                case 'admin':
                    if (chat.isGroup) {
                        const admins = chat.participants.filter((p) => p.isAdmin);
                        if (admins.length > 0) {
                            let adminList = '*👑 Administradores del Grupo:*\n\n';
                            for (const admin of admins) {
                                const contact = yield this.client.getContactById(admin.id._serialized);
                                adminList += `• @${admin.id.user} (${contact.pushname || 'Sin nombre'})\n`;
                            }
                            yield message.reply(adminList);
                        }
                        else {
                            yield message.reply('👑 No hay administradores configurados en este grupo');
                        }
                    }
                    else {
                        yield message.reply('❌ Este comando solo funciona en grupos');
                    }
                    break;
                case 'miembros':
                    if (chat.isGroup) {
                        const totalMembers = chat.participants.length;
                        const admins = chat.participants.filter((p) => p.isAdmin).length;
                        const members = totalMembers - admins;
                        const memberMessage = `*👥 Información de Miembros*\n\n• *Total:* ${totalMembers}\n• *Administradores:* ${admins}\n• *Miembros:* ${members}\n\n📊 *Estadísticas del Grupo*`;
                        yield message.reply(memberMessage);
                    }
                    else {
                        yield message.reply('❌ Este comando solo funciona en grupos');
                    }
                    break;
                case 'bienvenida':
                    if (chat.isGroup) {
                        const participant = chat.participants.find((p) => p.id._serialized === message.author);
                        if (participant && participant.isAdmin) {
                            yield message.reply('✅ *Sistema de Bienvenida Activado*\n\nAhora daré la bienvenida automáticamente a nuevos miembros que se unan al grupo.');
                        }
                        else {
                            yield message.reply('❌ Solo administradores pueden usar este comando');
                        }
                    }
                    else {
                        yield message.reply('❌ Este comando solo funciona en grupos');
                    }
                    break;
                case 'moderacion':
                    const moderationMessage = `*🛡️ Sistema de Moderación*\n\n✅ *Funciones activas:*\n• Detección de enlaces sospechosos\n• Filtro de palabras prohibidas\n• Monitoreo de mensajes\n• Alertas automáticas\n• Bienvenidas automáticas\n\n⚙️ *Configuración:*\n• Enlaces acortados: ⚠️ Advertencia\n• Palabras sospechosas: 🚫 Bloqueo\n• Spam: 📊 Monitoreo continuo\n\nEl bot mantiene el orden en el grupo automáticamente.`;
                    yield message.reply(moderationMessage);
                    break;
                case 'test':
                    yield message.reply('🧪 *Bot funcionando correctamente!* Comando de prueba exitoso.');
                    break;
                default:
                    yield message.reply('❓ Comando no reconocido. Usa !help para ver los comandos disponibles.');
                    break;
            }
        });
    }
    sendMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { number, message, targetNumber } = req.body;
            const recipient = targetNumber || this.ADMIN_NUMBER;
            if (!recipient || !message) {
                return res.status(400).json({ success: false, error: 'Mensaje es requerido' });
            }
            try {
                const messageToSend = (recipient === this.ADMIN_NUMBER) ? `🤖 Sistema de Notificaciones\n\n${message}` : message;
                yield this.client.sendMessage(recipient + '@c.us', messageToSend);
                res.json({ success: true, message: 'Mensaje enviado exitosamente al número principal' });
            }
            catch (err) {
                console.error('Error al enviar mensaje:', err);
                res.status(500).json({ success: false, error: 'Error al enviar mensaje: ' + err.message });
            }
        });
    }
    sendFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { number, fileName, caption, targetNumber } = req.body;
            const recipient = targetNumber || this.ADMIN_NUMBER;
            if (!recipient || !fileName) {
                return res.status(400).json({ success: false, error: 'Nombre del archivo es requerido' });
            }
            const filePath = path_1.default.join(__dirname, 'files', fileName);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, error: 'Archivo no encontrado en la carpeta files' });
            }
            try {
                const media = whatsapp_web_js_1.MessageMedia.fromFilePath(filePath);
                const finalCaption = (recipient === this.ADMIN_NUMBER) ? `🤖 Sistema de Notificaciones\n\n${caption || ''}` : (caption || '');
                yield this.client.sendMessage(recipient + '@c.us', media, { caption: finalCaption });
                res.json({ success: true, message: 'Archivo enviado exitosamente al número principal' });
            }
            catch (err) {
                console.error('Error al enviar archivo:', err);
                res.status(500).json({ success: false, error: 'Error al enviar archivo: ' + err.message });
            }
        });
    }
    getChats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chats = yield this.client.getChats();
                const chatList = chats.map(chat => ({
                    id: chat.id._serialized,
                    name: chat.name || chat.pushname || 'Sin nombre',
                    isGroup: chat.isGroup,
                    unreadCount: chat.unreadCount
                }));
                res.json({ success: true, chats: chatList });
            }
            catch (err) {
                console.error('Error al obtener chats:', err);
                res.status(500).json({ success: false, error: 'Error al obtener chats: ' + err.message });
            }
        });
    }
    sendToGroup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { groupId, message } = req.body;
            if (!groupId || !message) {
                return res.status(400).json({ success: false, error: 'ID del grupo y mensaje son requeridos' });
            }
            try {
                yield this.client.sendMessage(groupId, message);
                res.json({ success: true, message: 'Mensaje enviado al grupo exitosamente' });
            }
            catch (err) {
                console.error('Error al enviar mensaje al grupo:', err);
                res.status(500).json({ success: false, error: 'Error al enviar mensaje al grupo: ' + err.message });
            }
        });
    }
    sendFileToGroup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { groupId, fileName, caption } = req.body;
            if (!groupId || !fileName) {
                return res.status(400).json({ success: false, error: 'ID del grupo y nombre del archivo son requeridos' });
            }
            const filePath = path_1.default.join(__dirname, 'files', fileName);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, error: 'Archivo no encontrado en la carpeta files' });
            }
            try {
                const media = whatsapp_web_js_1.MessageMedia.fromFilePath(filePath);
                yield this.client.sendMessage(groupId, media, { caption: caption || '' });
                res.json({ success: true, message: 'Archivo enviado al grupo exitosamente' });
            }
            catch (err) {
                console.error('Error al enviar archivo al grupo:', err);
                res.status(500).json({ success: false, error: 'Error al enviar archivo al grupo: ' + err.message });
            }
        });
    }
    getStatus(req, res, next) {
        const isConnected = this.isWhatsAppConnected && this.client.info ? true : false;
        const state = isConnected ? 'conectado' : 'desconectado';
        const hasQR = this.qrCodeData !== null;
        res.json({
            status: state,
            connected: isConnected,
            info: this.client.info || null,
            qrAvailable: hasQR && !isConnected,
            qrData: hasQR ? this.qrCodeData : null,
            timestamp: new Date().toISOString(),
            message: isConnected
                ? 'WhatsApp está conectado y listo para usar'
                : hasQR
                    ? 'QR disponible para escanear'
                    : 'Esperando inicialización de WhatsApp'
        });
    }
    getBotStatus(req, res, next) {
        var _a, _b;
        const isConnected = this.isWhatsAppConnected && this.client.info ? true : false;
        const hasQR = this.qrCodeData !== null;
        const status = {
            connected: isConnected,
            authenticated: isConnected,
            ready: isConnected,
            number: ((_b = (_a = this.client.info) === null || _a === void 0 ? void 0 : _a.wid) === null || _b === void 0 ? void 0 : _b.user) || null,
            uptime: process.uptime(),
            qrAvailable: hasQR && !isConnected,
            qrData: hasQR && !isConnected ? this.qrCodeData : null,
            timestamp: new Date().toISOString(),
            statusText: isConnected
                ? 'Conectado y listo'
                : hasQR
                    ? 'Esperando escaneo del QR'
                    : 'Inicializando WhatsApp'
        };
        res.json(status);
    }
    getQR(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const isConnected = this.isWhatsAppConnected && this.client.info ? true : false;
            if (isConnected) {
                return res.status(200).json({
                    error: 'Ya conectado',
                    message: 'WhatsApp ya está conectado. No se necesita QR.',
                    status: 'connected',
                    connected: true
                });
            }
            if (!this.qrCodeData) {
                return res.status(404).json({
                    error: 'QR no disponible',
                    message: 'El QR aún no se ha generado. Espera a que WhatsApp se inicialice.',
                    status: 'waiting'
                });
            }
            try {
                const qrImage = yield QRCode.toDataURL(this.qrCodeData);
                res.json({
                    qrImage,
                    qrText: this.qrCodeData,
                    status: 'ready',
                    message: 'Escanea este código QR con WhatsApp Web'
                });
            }
            catch (error) {
                res.status(500).json({
                    error: 'Error generando QR',
                    details: error.message
                });
            }
        });
    }
    notify(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message, targetNumber } = req.body;
            if (!message) {
                return res.status(400).json({ success: false, error: 'Mensaje de notificación requerido' });
            }
            const recipient = targetNumber || this.NOTIFICATION_NUMBER || this.ADMIN_NUMBER;
            try {
                yield this.client.sendMessage(recipient + '@c.us', '📢 Notificación: ' + message);
                res.json({ success: true, message: 'Notificación enviada exitosamente' });
            }
            catch (err) {
                console.error('Error enviando notificación:', err);
                res.status(500).json({ success: false, error: 'Error al enviar notificación: ' + err.message });
            }
        });
    }
    getBotConfig(req, res, next) {
        const config = {
            adminNumber: this.ADMIN_NUMBER,
            notificationNumber: this.NOTIFICATION_NUMBER,
            autoResponses: this.autoResponses,
            moderationEnabled: true,
            welcomeEnabled: true,
            commands: [
                'help', 'status', 'ping', 'info', 'uptime', 'reglas',
                'admin', 'miembros', 'bienvenida', 'moderacion', 'test'
            ]
        };
        res.json(config);
    }
    updateBotConfig(req, res, next) {
        const { adminNumber, notificationNumber, autoResponses: newAutoResponses } = req.body;
        if (adminNumber) {
            // This would update, but for now, just log
            console.log('Updating admin number to:', adminNumber);
        }
        if (notificationNumber) {
            console.log('Updating notification number to:', notificationNumber);
        }
        if (newAutoResponses) {
            Object.assign(this.autoResponses, newAutoResponses);
        }
        res.json({ success: true, message: 'Configuración actualizada' });
    }
    // Función para enviar comprobante por WhatsApp usando el cliente del servidor
    sendComprobanteWhatsApp(telefono, comprobanteCompleto, ventaCompleta, pedido, detallesVentaCompletos) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Verificar que WhatsApp esté conectado
                if (!this.isWhatsAppConnected || !this.client.info) {
                    throw new Error('WhatsApp no está conectado');
                }
                console.log(`📱 Enviando comprobante por WhatsApp al número: ${telefono}`);
                // Crear PDF usando la función existente
                const { generarPDFComprobante } = yield Promise.resolve().then(() => __importStar(require('./controllers/wsp.controller')));
                const nombreArchivo = yield generarPDFComprobante(comprobanteCompleto, ventaCompleta, pedido, detallesVentaCompletos);
                console.log(nombreArchivo);
                // Leer el archivo PDF
                // const filePath = path.join(__dirname, '..', 'uploads', nombreArchivo);
                const filePath = path_1.default.join(__dirname, "../../backend/dist/uploads", nombreArchivo);
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Archivo PDF no encontrado: ${filePath}`);
                }
                // Crear media desde el archivo
                const media = whatsapp_web_js_1.MessageMedia.fromFilePath(filePath);
                // Preparar mensaje
                const mensaje = `📄 ${((_a = comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.TipoComprobante) === null || _a === void 0 ? void 0 : _a.nombre) || 'Comprobante'} ${comprobanteCompleto === null || comprobanteCompleto === void 0 ? void 0 : comprobanteCompleto.numserie}\n\n✅ Venta procesada exitosamente`;
                // Enviar archivo por WhatsApp
                yield this.client.sendMessage(`51${telefono}@c.us`, media, { caption: mensaje });
                console.log(`✅ Comprobante enviado exitosamente por WhatsApp al ${telefono}`);
                return { success: true };
            }
            catch (error) {
                console.error('❌ Error enviando comprobante por WhatsApp:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });
    }
    getWhatsAppFrontendStatus(req, res, next) {
        var _a, _b;
        const isConnected = this.isWhatsAppConnected && this.client.info ? true : false;
        const hasQR = this.qrCodeData !== null;
        let status = 'disconnected';
        let message = 'WhatsApp no está conectado';
        let qrImage = null;
        if (isConnected) {
            status = 'connected';
            message = 'WhatsApp está conectado y listo para usar';
        }
        else if (hasQR) {
            status = 'waiting_qr';
            message = 'Escanea el código QR para conectar WhatsApp';
            // Generar QR si está disponible
            if (this.qrCodeData) {
                try {
                    qrImage = QRCode.toDataURL(this.qrCodeData);
                }
                catch (error) {
                    console.error('Error generando QR para frontend:', error);
                }
            }
        }
        else {
            status = 'initializing';
            message = 'Inicializando WhatsApp...';
        }
        res.json({
            status,
            connected: isConnected,
            message,
            qrAvailable: hasQR && !isConnected,
            qrImage: qrImage ? qrImage : null,
            qrText: hasQR && !isConnected ? this.qrCodeData : null,
            number: ((_b = (_a = this.client.info) === null || _a === void 0 ? void 0 : _a.wid) === null || _b === void 0 ? void 0 : _b.user) || null,
            timestamp: new Date().toISOString(),
            serverUptime: process.uptime()
        });
    }
}
const serverInstance = new Server();
exports.server = serverInstance;
exports.default = serverInstance;

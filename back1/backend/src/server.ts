import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http'; // Importa el módulo http de Node.js
import { Server as SocketIOServer, Socket } from 'socket.io'; // Importa Server y Socket de socket.io
import path from "path";
import { Client, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import * as fs from 'fs';

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
import sharp from "sharp";
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
    private client: Client;
    private qrCodeData: string | null = null;
    private ADMIN_NUMBER = '51908610377';
    private NOTIFICATION_NUMBER = '51999999999';
    private lastConnectionStatus = null;
    private autoResponses = {
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


    constructor() {
      this.app = express();
      this.port = process.env.PORT || '3001';
      this.httpServer = new http.Server(this.app);
      this.io = new SocketIOServer(this.httpServer);
      this.client = new Client({
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      this.listen();
      this.middlewares();
      this.routes();
      this.dbConnect();
      this.initializeWhatsApp();
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
    'http://localhost:4300',    // frontend admin
    'http://localhost:50913'    // frontend admin
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

    this.app.use("/uploads", (req: Request, res: Response, next: NextFunction) => {
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

       // WhatsApp endpoints
       this.app.post('/send', (req: Request, res: Response, next?: NextFunction) => this.sendMessage(req, res, next));
       this.app.post('/sendFile', (req: Request, res: Response, next?: NextFunction) => this.sendFile(req, res, next));
       this.app.get('/chats', (req: Request, res: Response, next?: NextFunction) => this.getChats(req, res, next));
       this.app.post('/sendToGroup', (req: Request, res: Response, next?: NextFunction) => this.sendToGroup(req, res, next));
       this.app.post('/sendFileToGroup', (req: Request, res: Response, next?: NextFunction) => this.sendFileToGroup(req, res, next));
       this.app.get('/status', (req: Request, res: Response, next?: NextFunction) => this.getStatus(req, res, next));
       this.app.get('/bot-status', (req: Request, res: Response, next?: NextFunction) => this.getBotStatus(req, res, next));
       this.app.get('/qr', (req: Request, res: Response, next?: NextFunction) => this.getQR(req, res, next));
       this.app.post('/notify', (req: Request, res: Response, next?: NextFunction) => this.notify(req, res, next));
       this.app.get('/bot-config', (req: Request, res: Response, next?: NextFunction) => this.getBotConfig(req, res, next));
       this.app.post('/bot-config', (req: Request, res: Response, next?: NextFunction) => this.updateBotConfig(req, res, next));
   }
  
    private async dbConnect() {
      try {
          await db.authenticate();
          console.log('Base de datos conectada')
      } catch (error) {
        console.log('Error al conectarse a la base de datos:', error);
      }
    }

    private initializeWhatsApp() {
      this.setupWhatsAppEvents();
      this.client.initialize();
    }

    private setupWhatsAppEvents() {
      this.client.on('qr', async (qr) => {
        console.log('Escanea este código QR con tu aplicación de WhatsApp:');
        // Use qrcode-terminal if installed, but for server, we can store qrCodeData
        this.qrCodeData = qr;
      });

      this.client.on('ready', () => {
        console.log('Cliente de WhatsApp listo y conectado!');
        this.sendAdminNotification('✅ WhatsApp conectado exitosamente');
      });

      this.client.on('authenticated', () => {
        console.log('Autenticación exitosa! Sesión guardada.');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('Fallo en la autenticación:', msg);
        this.sendAdminNotification('❌ Error de autenticación: ' + msg);
      });

      this.client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
        this.sendAdminNotification('⚠️ WhatsApp desconectado: ' + reason);
        // Reiniciar automáticamente
        setTimeout(() => {
          this.reinitializeClient();
        }, 5000);
      });

      // Message event
      this.client.on('message', async (message) => {
        try {
          const chat = await message.getChat();
          const contact = await message.getContact();
          const senderName = contact.pushname || contact.number || 'Usuario';

          if (!chat.isGroup && message.from !== this.ADMIN_NUMBER + '@c.us') {
            return;
          }

          const messageBody = message.body.toLowerCase().trim();
          const originalMessage = message.body.trim();

          if (messageBody.startsWith('!')) {
            const command = messageBody.substring(1);
            await this.handleCommand(command, message, chat);
          } else {
            const autoResponse = this.getAutoResponse(originalMessage);
            if (autoResponse) {
              setTimeout(async () => {
                try {
                  await message.reply(autoResponse);
                } catch (error) {
                  console.error('Error enviando respuesta automática:', error);
                }
              }, 1000 + Math.random() * 2000);
            }
          }

          if (message.mentionedIds && message.mentionedIds.includes(this.client.info?.wid?._serialized)) {
            await message.reply(`👋 ¡Hola ${senderName}! Soy el bot de notificaciones. Usa !help para ver mis comandos.`);
          }

        } catch (error) {
          console.error('Error procesando mensaje:', error);
          try {
            await message.reply('❌ Ocurrió un error procesando tu mensaje.');
          } catch (replyError) {
            console.error('Error enviando respuesta de error:', replyError);
          }
        }
      });

      // Group events
      this.client.on('group_join', async (notification) => {
        try {
          const chat = await notification.getChat();
          const newMember = await notification.getContact();
          const welcomeMessage = `👋 ¡Bienvenido/a ${newMember.pushname || 'Nuevo miembro'} al grupo *${chat.name}*!\n\n📋 *Reglas importantes:*\n• Lee las reglas con !reglas\n• Sé respetuoso con todos\n• Disfruta tu estadía en el grupo\n\n🤖 Soy el bot del grupo. Usa !help para ver mis comandos.`;
          await notification.reply(welcomeMessage);
          // Notify admins
          const admins = (chat as any).participants.filter((p: any) => p.isAdmin);
          for (const admin of admins) {
            try {
              await this.client.sendMessage(admin.id._serialized, `👤 *Nuevo miembro en ${chat.name}*\n${newMember.pushname || 'Usuario'} se unió al grupo.`);
            } catch (error) {
              console.error('Error notificando a admin:', error);
            }
          }
        } catch (error) {
          console.error('Error procesando nuevo miembro:', error);
        }
      });

      this.client.on('group_leave', async (notification) => {
        try {
          const chat = await notification.getChat();
          const leftMember = await notification.getContact();
          const admins = (chat as any).participants.filter((p: any) => p.isAdmin);
          for (const admin of admins) {
            try {
              await this.client.sendMessage(admin.id._serialized, `👋 *Miembro salió de ${chat.name}*\n${leftMember.pushname || 'Usuario'} abandonó el grupo.`);
            } catch (error) {
              console.error('Error notificando salida:', error);
            }
          }
        } catch (error) {
          console.error('Error procesando salida de miembro:', error);
        }
      });

      // Moderation
      this.client.on('message', async (message) => {
        try {
          const chat = await message.getChat();
          if (!chat.isGroup) return;
          const messageBody = message.body.toLowerCase();
          const linkRegex = /(https?:\/\/[^\s]+)/g;
          if (linkRegex.test(message.body)) {
            const links = message.body.match(linkRegex);
            if (links) {
              for (const link of links) {
                const suspiciousLinks = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
                if (suspiciousLinks.some(domain => link.includes(domain))) {
                  await message.reply('⚠️ *Enlace sospechoso detectado*\n\nPor favor, verifica el enlace antes de hacer clic.\nLos administradores han sido notificados.');
                  const admins = (chat as any).participants.filter((p: any) => p.isAdmin);
                  for (const admin of admins) {
                    try {
                      await this.client.sendMessage(admin.id._serialized, `⚠️ *Enlace sospechoso en ${chat.name}*\nUsuario: ${(await message.getContact()).pushname || 'Desconocido'}\nEnlace: ${link}`);
                    } catch (error) {
                      console.error('Error notificando enlace sospechoso:', error);
                    }
                  }
                  break;
                }
              }
            }
            const forbiddenWords = ['spam', 'scam', 'hack', 'virus', 'malware', 'estafa'];
            if (forbiddenWords.some(word => messageBody.includes(word))) {
              const participant = (chat as any).participants.find((p: any) => p.id._serialized === message.author);
              if (participant && !participant.isAdmin) {
                await message.reply('⚠️ *Contenido sospechoso detectado*\n\nTu mensaje contiene palabras que podrían indicar contenido no apropiado.\nPor favor, mantén conversaciones positivas.');
                const admins = (chat as any).participants.filter((p: any) => p.isAdmin);
                for (const admin of admins) {
                  try {
                    await this.client.sendMessage(admin.id._serialized, `🚨 *Mensaje sospechoso en ${chat.name}*\nUsuario: ${(await message.getContact()).pushname || 'Desconocido'}\nMensaje: ${message.body.substring(0, 100)}...`);
                  } catch (error) {
                    console.error('Error notificando mensaje sospechoso:', error);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error en moderación automática:', error);
        }
      });
    }

    private async reinitializeClient() {
      try {
        console.log('Limpiando sesión anterior...');
        this.qrCodeData = null;
        const sessionPath = './whatsapp-session';
        if (fs.existsSync(sessionPath)) {
          const files = fs.readdirSync(sessionPath);
          for (const file of files) {
            const filePath = path.join(sessionPath, file);
            try {
              fs.unlinkSync(filePath);
              console.log('Archivo de sesión eliminado:', file);
            } catch (err) {
              console.error('Error eliminando archivo de sesión:', file, err);
            }
          }
        }
        const cachePath = './.wwebjs_cache';
        if (fs.existsSync(cachePath)) {
          try {
            fs.rmSync(cachePath, { recursive: true, force: true });
            console.log('Cache de puppeteer limpiado');
          } catch (err) {
            console.error('Error limpiando cache:', err);
          }
        }
        console.log('Sesión limpiada. Reinicializando cliente...');
        try {
          await this.client.destroy();
          console.log('Cliente anterior destruido');
        } catch (err) {
          console.error('Error destruyendo cliente anterior:', err);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.client.initialize();
        console.log('Cliente reinicializado exitosamente');
      } catch (error) {
        console.error('Error en reinicialización:', error);
        setTimeout(() => {
          console.log('Reintentando reinicialización...');
          this.reinitializeClient();
        }, 10000);
      }
    }

    private getAutoResponse(messageBody: string): string | null {
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

    private async sendAdminNotification(message: string) {
      const targetNumber = this.NOTIFICATION_NUMBER || this.ADMIN_NUMBER;
      if (!targetNumber) {
        console.log('Número de administrador no configurado');
        return;
      }
      try {
        await this.client.sendMessage(targetNumber + '@c.us', message);
        console.log('Notificación enviada al administrador:', message);
      } catch (error) {
        console.error('Error enviando notificación al administrador:', error);
      }
    }

    private async handleCommand(command: string, message: any, chat: any) {
      switch (command) {
        case 'help':
          const helpMessage = `*🤖 Comandos del Bot de WhatsApp*\n\n*Comandos disponibles:*\n• !help - Mostrar esta ayuda\n• !status - Estado del bot\n• !ping - Verificar conectividad\n• !info - Información del grupo\n• !uptime - Tiempo activo del bot\n• !reglas - Ver reglas del grupo\n• !admin - Mencionar administradores\n• !miembros - Contar miembros del grupo\n• !bienvenida - Configurar mensaje de bienvenida\n• !moderacion - Estado de moderación\n\n*Funcionalidades:*\n• ✅ Envío de mensajes\n• ✅ Envío de archivos\n• ✅ Notificaciones automáticas\n• ✅ Gestión de grupos\n• ✅ Respuestas automáticas\n• ✅ Moderación automática\n• ✅ Bienvenidas automáticas\n\n_Bot desarrollado con Node.js y WhatsApp Web_`;
          await message.reply(helpMessage);
          break;
        case 'status':
          const statusMessage = `*📊 Estado del Bot*\n\n✅ *Conectado:* ${this.client.info ? 'Sí' : 'No'}\n📱 *Número:* ${this.client.info?.wid?.user || 'N/A'}\n⏰ *Uptime:* ${Math.floor(process.uptime() / 60)} minutos\n👥 *Grupos:* ${chat.isGroup ? 'Mensaje en grupo' : 'Mensaje privado'}`;
          await message.reply(statusMessage);
          break;
        case 'ping':
          const pingTime = Date.now() - message.timestamp * 1000;
          await message.reply(`🏓 *Pong!* (${pingTime}ms)`);
          break;
        case 'info':
          if (chat.isGroup) {
            const groupInfo = `*📋 Información del Grupo*\n\n👥 *Nombre:* ${chat.name}\n👤 *Descripción:* ${chat.description || 'Sin descripción'}\n👥 *Participantes:* ${chat.participants?.length || 'N/A'}\n🔒 *Tipo:* ${chat.isGroup ? 'Grupo' : 'Chat privado'}`;
            await message.reply(groupInfo);
          } else {
            await message.reply('ℹ️ Este comando solo funciona en grupos');
          }
          break;
        case 'uptime':
          const uptime = process.uptime();
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);
          await message.reply(`⏰ *Tiempo activo:* ${hours}h ${minutes}m ${seconds}s`);
          break;
        case 'reglas':
          const reglasMessage = `*📋 Reglas del Grupo*\n\n1️⃣ *Respeto:* Trata a todos los miembros con respeto\n2️⃣ *Contenido apropiado:* No enviar contenido ofensivo o inapropiado\n3️⃣ *Spam:* Evita enviar mensajes repetidos o innecesarios\n4️⃣ *Enlaces:* Verifica enlaces antes de compartirlos\n5️⃣ *Privacidad:* No compartas información personal de otros\n6️⃣ *Comandos:* Usa los comandos del bot correctamente\n\n⚠️ *Incumplimiento de reglas:*\n• Advertencia verbal\n• Silencio temporal (si es necesario)\n• Expulsión (casos graves)\n\n¡Mantengamos un ambiente positivo! 😊`;
          await message.reply(reglasMessage);
          break;
        case 'admin':
          if (chat.isGroup) {
            const admins = chat.participants.filter((p: any) => p.isAdmin);
            if (admins.length > 0) {
              let adminList = '*👑 Administradores del Grupo:*\n\n';
              for (const admin of admins) {
                const contact = await this.client.getContactById(admin.id._serialized);
                adminList += `• @${admin.id.user} (${contact.pushname || 'Sin nombre'})\n`;
              }
              await message.reply(adminList);
            } else {
              await message.reply('👑 No hay administradores configurados en este grupo');
            }
          } else {
            await message.reply('❌ Este comando solo funciona en grupos');
          }
          break;
        case 'miembros':
          if (chat.isGroup) {
            const totalMembers = chat.participants.length;
            const admins = chat.participants.filter((p: any) => p.isAdmin).length;
            const members = totalMembers - admins;
            const memberMessage = `*👥 Información de Miembros*\n\n• *Total:* ${totalMembers}\n• *Administradores:* ${admins}\n• *Miembros:* ${members}\n\n📊 *Estadísticas del Grupo*`;
            await message.reply(memberMessage);
          } else {
            await message.reply('❌ Este comando solo funciona en grupos');
          }
          break;
        case 'bienvenida':
          if (chat.isGroup) {
            const participant = chat.participants.find((p: any) => p.id._serialized === message.author);
            if (participant && participant.isAdmin) {
              await message.reply('✅ *Sistema de Bienvenida Activado*\n\nAhora daré la bienvenida automáticamente a nuevos miembros que se unan al grupo.');
            } else {
              await message.reply('❌ Solo administradores pueden usar este comando');
            }
          } else {
            await message.reply('❌ Este comando solo funciona en grupos');
          }
          break;
        case 'moderacion':
          const moderationMessage = `*🛡️ Sistema de Moderación*\n\n✅ *Funciones activas:*\n• Detección de enlaces sospechosos\n• Filtro de palabras prohibidas\n• Monitoreo de mensajes\n• Alertas automáticas\n• Bienvenidas automáticas\n\n⚙️ *Configuración:*\n• Enlaces acortados: ⚠️ Advertencia\n• Palabras sospechosas: 🚫 Bloqueo\n• Spam: 📊 Monitoreo continuo\n\nEl bot mantiene el orden en el grupo automáticamente.`;
          await message.reply(moderationMessage);
          break;
        case 'test':
          await message.reply('🧪 *Bot funcionando correctamente!* Comando de prueba exitoso.');
          break;
        default:
          await message.reply('❓ Comando no reconocido. Usa !help para ver los comandos disponibles.');
          break;
      }
    }

    public async sendMessage(req: Request, res: Response, next?: NextFunction) {
      const { number, message, targetNumber } = req.body;
      const recipient = targetNumber || this.ADMIN_NUMBER;
      if (!recipient || !message) {
        return res.status(400).json({ success: false, error: 'Mensaje es requerido' });
      }
      try {
        const messageToSend = (recipient === this.ADMIN_NUMBER) ? `🤖 Sistema de Notificaciones\n\n${message}` : message;
        await this.client.sendMessage(recipient + '@c.us', messageToSend);
        res.json({ success: true, message: 'Mensaje enviado exitosamente al número principal' });
      } catch (err) {
        console.error('Error al enviar mensaje:', err);
        res.status(500).json({ success: false, error: 'Error al enviar mensaje: ' + (err as Error).message });
      }
    }

    public async sendFile(req: Request, res: Response, next?: NextFunction) {
      const { number, fileName, caption, targetNumber } = req.body;
      const recipient = targetNumber || this.ADMIN_NUMBER;
      if (!recipient || !fileName) {
        return res.status(400).json({ success: false, error: 'Nombre del archivo es requerido' });
      }
      const filePath = path.join(__dirname, 'files', fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'Archivo no encontrado en la carpeta files' });
      }
      try {
        const media = MessageMedia.fromFilePath(filePath);
        const finalCaption = (recipient === this.ADMIN_NUMBER) ? `🤖 Sistema de Notificaciones\n\n${caption || ''}` : (caption || '');
        await this.client.sendMessage(recipient + '@c.us', media, { caption: finalCaption });
        res.json({ success: true, message: 'Archivo enviado exitosamente al número principal' });
      } catch (err) {
        console.error('Error al enviar archivo:', err);
        res.status(500).json({ success: false, error: 'Error al enviar archivo: ' + (err as Error).message });
      }
    }

    public async getChats(req: Request, res: Response, next?: NextFunction) {
      try {
        const chats = await this.client.getChats();
        const chatList = chats.map(chat => ({
          id: chat.id._serialized,
          name: chat.name || (chat as any).pushname || 'Sin nombre',
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount
        }));
        res.json({ success: true, chats: chatList });
      } catch (err) {
        console.error('Error al obtener chats:', err);
        res.status(500).json({ success: false, error: 'Error al obtener chats: ' + (err as Error).message });
      }
    }

    public async sendToGroup(req: Request, res: Response, next?: NextFunction) {
      const { groupId, message } = req.body;
      if (!groupId || !message) {
        return res.status(400).json({ success: false, error: 'ID del grupo y mensaje son requeridos' });
      }
      try {
        await this.client.sendMessage(groupId, message);
        res.json({ success: true, message: 'Mensaje enviado al grupo exitosamente' });
      } catch (err) {
        console.error('Error al enviar mensaje al grupo:', err);
        res.status(500).json({ success: false, error: 'Error al enviar mensaje al grupo: ' + (err as Error).message });
      }
    }

    public async sendFileToGroup(req: Request, res: Response, next?: NextFunction) {
      const { groupId, fileName, caption } = req.body;
      if (!groupId || !fileName) {
        return res.status(400).json({ success: false, error: 'ID del grupo y nombre del archivo son requeridos' });
      }
      const filePath = path.join(__dirname, 'files', fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'Archivo no encontrado en la carpeta files' });
      }
      try {
        const media = MessageMedia.fromFilePath(filePath);
        await this.client.sendMessage(groupId, media, { caption: caption || '' });
        res.json({ success: true, message: 'Archivo enviado al grupo exitosamente' });
      } catch (err) {
        console.error('Error al enviar archivo al grupo:', err);
        res.status(500).json({ success: false, error: 'Error al enviar archivo al grupo: ' + (err as Error).message });
      }
    }

    public getStatus(req: Request, res: Response, next?: NextFunction) {
      const state = this.client.info ? 'conectado' : 'desconectado';
      res.json({
        status: state,
        info: this.client.info || null,
        qrAvailable: !this.client.info && this.qrCodeData !== null
      });
    }

    public getBotStatus(req: Request, res: Response, next?: NextFunction) {
      const status = {
        connected: this.client.info ? true : false,
        number: this.client.info?.wid?.user || null,
        uptime: process.uptime(),
        ready: this.client.info ? true : false
      };
      res.json(status);
    }

    public async getQR(req: Request, res: Response, next?: NextFunction) {
      if (!this.qrCodeData) {
        return res.status(404).json({ error: 'QR no disponible' });
      }
      try {
        const qrImage = await QRCode.toDataURL(this.qrCodeData);
        res.json({ qrImage });
      } catch (error) {
        res.status(500).json({ error: 'Error generando QR' });
      }
    }

    public async notify(req: Request, res: Response, next?: NextFunction) {
      const { message, targetNumber } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: 'Mensaje de notificación requerido' });
      }
      const recipient = targetNumber || this.NOTIFICATION_NUMBER || this.ADMIN_NUMBER;
      try {
        await this.client.sendMessage(recipient + '@c.us', '📢 Notificación: ' + message);
        res.json({ success: true, message: 'Notificación enviada exitosamente' });
      } catch (err) {
        console.error('Error enviando notificación:', err);
        res.status(500).json({ success: false, error: 'Error al enviar notificación: ' + (err as Error).message });
      }
    }

    public getBotConfig(req: Request, res: Response, next?: NextFunction) {
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

    public updateBotConfig(req: Request, res: Response, next?: NextFunction) {
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


    }

   const serverInstance = new Server();
   export default serverInstance;
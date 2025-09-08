# Tienda Online Backend

Backend para la aplicación de tienda online desarrollado con Node.js, Express, TypeScript y Sequelize.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
El archivo `.env` ya está configurado con la base de datos remota.

### 3. Limpiar puertos (si es necesario)
Si encuentras errores de puertos ocupados:
```bash
npm run clean-ports
```

### 4. Ejecutar el servidor
```bash
npm run dev
```

El servidor se ejecutará automáticamente en el puerto 4000 (o el siguiente disponible si está ocupado).

## 📋 Comandos Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con nodemon
- `npm run start` - Ejecutar en modo producción
- `npm run clean-ports` - Limpiar procesos que usan puertos comunes (3000, 4000, 5000)

## 🔧 Características

### ✅ Puerto Automático
- El servidor intenta automáticamente puertos alternativos si el puerto principal está ocupado
- Secuencia: 4000 → 4001 → 4002

### ✅ Base de Datos
- Conexión automática a MySQL
- Sincronización automática de modelos
- Creación de tablas si no existen

### ✅ WhatsApp en Segundo Plano
- Inicialización asíncrona sin bloquear el servidor
- Funciona independientemente de las consultas API
- Escaneo QR cuando esté listo

### ✅ API REST
- Todas las rutas disponibles inmediatamente
- Endpoints para productos, ventas, usuarios, etc.
- Documentación automática con rutas descriptivas

## 🌐 Endpoints Principales

- `GET /` - Verificar estado del servidor
- `POST /api/v1/login` - Autenticación de usuarios
- `GET /api/v1/productos` - Listar productos
- `POST /api/v1/ventas` - Crear ventas
- `GET /api/v1/usuarios` - Gestionar usuarios

## 📄 API de Comprobantes

### Crear Venta Completa con Comprobante

- `POST /api/v1/comprobantes/venta-completa` - Crear venta completa (básica)
- `POST /api/v1/comprobantes/venta-completa/admin` - Crear venta completa desde administración
- `POST /api/v1/comprobantes/venta-completa/mensajes` - **Crear venta completa con envío garantizado de mensajes por WhatsApp**

##  WhatsApp Bot

### Estado del QR
- `GET /qr` - Obtener código QR para escanear
- `GET /status` - Estado de conexión de WhatsApp
- `GET /bot-status` - Información detallada del bot
- `GET /whatsapp-frontend-status` - **Endpoint específico para frontend** (recomendado)

### Cómo conectar WhatsApp:
1. El servidor inicia automáticamente WhatsApp después de 2 segundos
2. Aparece el mensaje "Escanea este código QR con tu aplicación de WhatsApp:" en la consola
3. **Para el frontend:** Usa `GET /whatsapp-frontend-status` para obtener estado completo
4. **Para obtener QR:** El endpoint incluye la imagen QR cuando está disponible
5. Escanea el código QR con WhatsApp Web
6. El bot estará listo para recibir comandos

### Estados posibles:
- `connected` - WhatsApp está conectado y listo
- `waiting_qr` - QR disponible para escanear
- `initializing` - Inicializando WhatsApp
- `disconnected` - WhatsApp desconectado

### Sincronización en tiempo real:
- ✅ El backend actualiza inmediatamente el estado cuando WhatsApp se conecta/desconecta
- ✅ Los endpoints devuelven información precisa sobre el estado actual
- ✅ No hay información desactualizada o cacheada
- ✅ El frontend recibe notificaciones en tiempo real sobre cambios de estado

## 📱 WhatsApp Bot

El bot de WhatsApp se inicializa automáticamente en segundo plano:
- Envío de mensajes
- Recepción de comandos
- Gestión de grupos
- Notificaciones automáticas

## 🛠️ Solución de Problemas

### Puerto Ocupado
```bash
# Limpiar puertos automáticamente
npm run clean-ports

# O verificar manualmente
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Base de Datos
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el servidor MySQL esté ejecutándose
- Las tablas se crean automáticamente al iniciar

### WhatsApp
- El QR aparecerá en la consola cuando esté listo
- Escanea el código QR con WhatsApp Web
- El bot funcionará independientemente del servidor API

## 📊 Estado del Sistema

El servidor muestra información detallada al iniciar:
- ✅ Puerto utilizado
- ✅ Conexión a base de datos
- ✅ Sincronización de modelos
- ✅ Estado de WhatsApp

¡El backend está listo para usar! 🎉
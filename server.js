import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import functions from 'firebase-functions'; // Para acceder a las variables configuradas
import cors from 'cors';
import { randomUUID } from 'crypto'; // Para generar idempotencyKey
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de variables de entorno local
dotenv.config();

// Carga de las variables de entorno desde Firebase Functions
const config = functions.config();
const PORT = config.app.port || 3000; // Puerto de la app, usa 3000 como predeterminado
const JWT_SECRET = config.jwt.secret; // Secreto para JWT
const MP_PUBLIC_KEY = config.mercadopago.public_key; // Clave pública de MercadoPago
const MP_CLIENT_ID = config.mercadopago.client_id; // Client ID de MercadoPago
const MP_CLIENT_SECRET = config.mercadopago.client_secret; // Client Secret de MercadoPago
const MP_ACCESS_TOKEN = config.mercadopago.token; // Token de acceso de MercadoPago

// Crear instancia de Express
const app = express();
const port = process.env.PORT || 8080;

// Resolver __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar token de Mercado Pago
if (!process.env.MERCADOPAGO_TOKEN) {
  console.error('❌ Error: El token de Mercado Pago no está configurado (MERCADOPAGO_TOKEN).');
  process.exit(1);
}

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
  options: { timeout: 5000 }, // Opciones generales del cliente
});

// Middleware global
app.use(cors({
  origin: [
    // Agrega los orígenes que necesitas permitir
    'https://jinete-ar.web.app',
    'http://localhost:5173',
  ],
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
}));

// Para parsear JSON en el body de las requests
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta opcional para la raíz (GET /)
// Te permitirá ver algo al acceder a la URL base
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend de JineteAr! Si ves este mensaje, el servidor está corriendo correctamente.');
});

// Función para crear una preferencia de pago
const createPreference = async (email, title, quantity, unitPrice) => {
  const idempotencyKey = randomUUID(); // Generar un idempotencyKey único
  const preference = new Preference(client);

  try {
    console.log('Creando preferencia con los siguientes datos:', {
      email,
      title,
      quantity,
      unitPrice,
      idempotencyKey,
    });

    const response = await preference.create({
      body: {
        payer: { email },
        items: [
          {
            title,
            quantity,
            unit_price: unitPrice,
          },
        ],
        back_urls: {
          success: 'https://jinete-ar.web.app/success',
          failure: 'https://jinete-ar.web.app/failure',
          pending: 'https://jinete-ar.web.app/pending',
        },
        auto_return: 'approved',
      },
      requestOptions: {
        idempotencyKey, // Usar el idempotencyKey dinámico
      },
    });

    console.log('Respuesta completa de Mercado Pago:', response);

    if (!response || !response.init_point) {
      throw new Error('La respuesta de Mercado Pago no contiene init_point.');
    }

    console.log('Preferencia creada exitosamente:', response);
    return response;
  } catch (error) {
    if (error.response) {
      console.error('❌ Error en la respuesta de Mercado Pago:', error.response.data || error.response);
    } else {
      console.error('❌ Error no relacionado con la respuesta de Mercado Pago:', error.message);
    }
    throw new Error('No se pudo crear la preferencia de pago.');
  }
};

// Ruta para crear un pago en Mercado Pago
app.post('/api/mercadopago/create_payment', async (req, res) => {
  console.log('Solicitud para /api/mercadopago/create_payment, body:', req.body);

  const { userEmail, title, quantity, unitPrice } = req.body;

  if (!userEmail || !title || !quantity || !unitPrice) {
    console.error('❌ Error: Parámetros inválidos recibidos:', { userEmail, title, quantity, unitPrice });
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  try {
    const preference = await createPreference(userEmail, title, quantity, unitPrice);
    // Enviar al cliente el link de pago
    return res.json({ init_point: preference.init_point });
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error.message);
    return res.status(500).json({ message: 'Error al crear la preferencia de pago.' });
  }
});

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error en middleware global:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error inesperado.' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { randomUUID } from 'crypto'; // Para generar idempotencyKey
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar token de Mercado Pago
if (!process.env.MERCADOPAGO_TOKEN) {
  console.error('❌ Error: El token de Mercado Pago no está configurado.');
  process.exit(1);
}

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
  options: { timeout: 5000 }, // Opciones generales del cliente
});

// Middleware global
app.use(cors({
  origin: ['https://jinete-ar.web.app', 'http://localhost:5173'],
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
}));
app.use(express.json()); // Configuración para procesar JSON
app.use(express.static(path.join(__dirname, 'public')));

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
        payer: {
          email: email,
        },
        items: [
          {
            title: title,
            quantity: quantity,
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
        idempotencyKey: idempotencyKey, // Usar el idempotencyKey dinámico
      },
    });

    console.log('Respuesta completa de Mercado Pago:', response);

    // Acceder directamente a response.init_point
    if (!response || !response.init_point) {
      throw new Error('La respuesta de Mercado Pago no contiene init_point.');
    }

    console.log('Preferencia creada exitosamente:', response);
    return response; // Devolver la respuesta completa
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
  console.log('Cuerpo de la solicitud recibido:', req.body);

  const { userEmail, title, quantity, unitPrice } = req.body;

  if (!userEmail || !title || !quantity || !unitPrice) {
    console.error('❌ Error: Parámetros inválidos recibidos:', { userEmail, title, quantity, unitPrice });
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  try {
    const preference = await createPreference(userEmail, title, quantity, unitPrice);
    res.json({ init_point: preference.init_point }); // Usar init_point directamente desde la respuesta
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error.message);
    res.status(500).json({ message: 'Error al crear la preferencia de pago.' });
  }
});

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error inesperado.' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
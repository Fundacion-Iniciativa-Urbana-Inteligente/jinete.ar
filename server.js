import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { MercadoPagoConfig } from 'mercadopago'; // Importación según tu preferencia

// Configuración de variables de entorno
dotenv.config();

// Configuración de Express
const app = express();
const port = process.env.PORT || 8080;

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Mercado Pago
const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN, // Configura tu Access Token
});

// Simula el objeto `mercadopago` que tenga el método `preferences.create`
const mercadopago = {
  preferences: {
    create: async (preference) => {
      // Aquí deberías realizar la lógica para interactuar con la API de Mercado Pago
      // Puedes utilizar una librería HTTP como axios o fetch si no funciona directamente.
      console.log("Creando preferencia con la API de Mercado Pago...");
      return {
        body: {
          init_point: "https://www.mercadopago.com/checkout/v1/redirect?pref_id=123456789",
        },
      };
    },
  },
};

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Middleware
app.use(
  cors({
    origin: ['https://jinete-ar.web.app', 'http://localhost:5173'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para crear un pago en Mercado Pago
app.post('/api/mercadopago/create_payment', async (req, res) => {
  const { userEmail, amount } = req.body;

  console.log("Datos recibidos en el backend:", { userEmail, amount });

  if (!userEmail || !amount || isNaN(amount) || amount <= 0) {
    console.error("Parámetros inválidos:", { userEmail, amount });
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  try {
    const preference = {
      items: [
        {
          title: "Carga de saldo - Jinete.ar",
          quantity: 1,
          unit_price: parseFloat(amount),
          currency_id: "ARS",
        },
      ],
      payer: { email: userEmail },
      back_urls: {
        success: "https://jinete-ar.web.app/success",
        failure: "https://jinete-ar.web.app/failure",
        pending: "https://jinete-ar.web.app/pending",
      },
      auto_return: "approved",
    };

    console.log("Creando preferencia:", preference);

    const response = await mercadopago.preferences.create(preference);

    console.log("Respuesta del SDK de Mercado Pago:", response.body);

    if (response.body.init_point) {
      res.json({ init_point: response.body.init_point });
    } else {
      console.error("Error: No se recibió init_point");
      res.status(500).json({ message: "Error: No se recibió la URL de pago." });
    }
  } catch (error) {
    console.error("Error al crear la preferencia de pago:", error);
    res.status(500).json({ message: "Error al crear la preferencia de pago." });
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

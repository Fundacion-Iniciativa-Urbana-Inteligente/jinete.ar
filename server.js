import dotenv from 'dotenv';
import express from 'express';
import mercadopago from 'mercadopago';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';


// Configuración de variables de entorno
dotenv.config();

// Configura Express
const app = express();
const port = process.env.PORT || 8080;

// Configuración de MercadoPago
const mercadopagoClient = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
});

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));
  
// Middleware
app.use(cors({
  origin: ['https://jinete-ar.web.app', 'http://localhost:5173'],
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Modelo de Usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// Ruta para crear un pago en MercadoPago
app.post('/api/mercadopago/create_payment', async (req, res) => {
  const { userId, amount } = req.body;

  try {
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Parámetros inválidos" });
    }

    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: "Carga de saldo - Jinete.ar",
          quantity: 1,
          unit_price: parseFloat(amount),
        },
      ],
      back_urls: {
        success: "https://jinete-ar.web.app/success",
        failure: "https://jinete-ar.web.app/failure",
        pending: "https://jinete-ar.web.app/pending",
      },
      auto_return: "approved",
      metadata: { userId },
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.initPoint });
  } catch (error) {
    console.error("❌ Error al crear pago:", error.message);
    res.status(500).json({ message: "Error interno al crear pago" });
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

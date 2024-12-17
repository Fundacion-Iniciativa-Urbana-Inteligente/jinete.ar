import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from 'cors';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from './models/user.js';

// Configuración de variables de entorno
dotenv.config();

// Configura Express
const app = express();
const port = process.env.PORT || 8080;

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

mongoose.connection.on('disconnected', () => {
  console.error('⚠️ MongoDB desconectado. Intentando reconectar...');
});

// Middleware
app.use(cors({
  origin: ['https://jinete-ar.web.app', 'http://localhost:5173'], // Orígenes permitidos
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true, // Permitir envío de cookies o cabeceras personalizadas
}));
app.use(express.json()); // Parsear JSON
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error inesperado.' });
});

// Validaciones con Joi
const validateUserInput = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

// Rutas públicas
app.get('/', (req, res) => {
  res.send('🌐 Bienvenido a la API de Jinete.ar');
});

// Registro de usuario
app.post('/signup', async (req, res) => {
  const { error } = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'El número de teléfono ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({ message: 'Error al registrar usuario.' });
  }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso.', name: user.name, token });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
});

// Solicitar OTP
app.post('/forgot-password', async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    await client.messages.create({
      body: `Tu código de recuperación es: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.status(200).json({ message: 'OTP enviado. Revisa tu teléfono.' });
  } catch (err) {
    console.error('Error al enviar OTP:', err);
    res.status(500).json({ message: 'Error al enviar OTP.' });
  }
});

// Validar OTP
app.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone, otp, otpExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Código OTP inválido o expirado.' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'OTP validado correctamente.' });
  } catch (err) {
    console.error('Error al validar OTP:', err);
    res.status(500).json({ message: 'Error al validar OTP.' });
  }
});

// Restablecer contraseña
app.post('/reset-password', async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ message: 'Error al restablecer contraseña.' });
  }
});

// Consultar usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
});

// Eliminar usuario
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

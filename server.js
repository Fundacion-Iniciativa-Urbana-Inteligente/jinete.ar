import admin from 'firebase-admin'; //Importa Base de datos
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { randomUUID } from 'crypto'; // Para generar idempotencyKey
import { MercadoPagoConfig, Preference } from 'mercadopago';
import crypto from 'crypto'; // Para hashear la contraseña a MD5
import axios from 'axios'; // Añadido para las consultas a Jimi IoT

let currentAccessToken = null;
let currentRefreshToken = null;


// Configuración de variables de entorno locales (dotenv solo para entorno local)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Resolver __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Express
const app = express();
const port = process.env.PORT || 8080;

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

// Configuración de JIMI IoT
const JIMI_APP_KEY = process.env.JIMI_APP_KEY;
const JIMI_USER_ID = process.env.JIMI_USER_ID;
const JIMI_USER_PWD = process.env.JIMI_USER_PWD;
const JIMI_URL = process.env.JIMI_URL;

// Inicializar Firebase Admin SDK
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://jinete-ar.firebaseio.com', // Reemplaza con tu URL de Firebase
});

const db = admin.firestore(); // Instancia de Firestore

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

// Función para generar la firma (sign)
function signTopRequest(params, seccode, signMethod) {
  const keys = Object.keys(params).sort(); // Ordenar las claves alfabéticamente

  let query = '';
  if (signMethod === 'md5') {
    query += seccode;
  }

  keys.forEach((key) => {
    const value = params[key];
    if (key && value) {
      query += `${key}${value}`;
    }
  });

  if (signMethod === 'HMAC') {
    query += seccode; // Agregar `seccode` al final
    return crypto.createHmac('md5', seccode).update(query, 'utf8').digest('hex').toUpperCase();
  } else {
    query += seccode; // Agregar `seccode` al final
    return crypto.createHash('md5').update(query, 'utf8').digest('hex').toUpperCase();
  }
}

// Función para generar los parámetros comunes
function generateCommonParameters(method) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const params = {
    method,
    timestamp,
    app_key: JIMI_APP_KEY,
    sign_method: 'md5',
    v: '0.9',
    format: 'json',
  };

  // Crear firma MD5
  const seccode = process.env.JIMI_APP_SECRET; // Se debe agregar esta clave secreta en el .env
  params.sign = signTopRequest(params, seccode, 'md5'); // Generar la firma con MD5

  return params; // Retorna los parámetros con la firma incluida
}

// Función para obtener el token automáticamente al arrancar
async function fetchAndStoreToken() {
  console.log('⏳ Intentando obtener el token automáticamente...');
  try {
    // Generar los parámetros comunes
    const commonParams = generateCommonParameters('jimi.oauth.token.get');

    // Agregar parámetros privados
    const privateParams = {
      user_id: process.env.JIMI_USER_ID,
      user_pwd_md5: crypto.createHash('md5').update(process.env.JIMI_USER_PWD).digest('hex'),
      expires_in: 7200, // Tiempo de expiración del token en segundos
    };

    // Crear el cuerpo de la solicitud combinando parámetros comunes y privados
    const requestData = { ...commonParams, ...privateParams };

    // Enviar la solicitud POST
    const response = await axios.post(process.env.JIMI_URL, requestData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { data } = response;

    // Verificar la respuesta del servidor
    if (data.code === 0 && data.result) {
      const tokenData = {
        appKey: data.result.appKey,
        account: data.result.account,
        accessToken: data.result.accessToken,
        refreshToken: data.result.refreshToken,
        expiresIn: data.result.expiresIn,
        time: data.result.time,
      };

      // Guardar el token en Firestore
      await db.collection('tokens').doc('jimi-token').set(tokenData);
      console.log('✅ Token obtenido automáticamente y guardado en Firestore:', tokenData);
      return tokenData;
    } else {
      console.error('❌ Error en la respuesta del servidor al obtener el token:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error al intentar obtener el token automáticamente:', error.message);
    return null;
  }
}

// Función para refrescar el token
async function refreshAccessToken(refreshToken) {
  console.log('⏳ Intentando actualizar el token con refreshToken:', refreshToken);
  try {
    // Generar los parámetros comunes
    const commonParams = generateCommonParameters('jimi.oauth.token.refresh');

    // Parámetros privados requeridos por la API
    const privateParams = {
      access_token: currentAccessToken, // Token de acceso actual
      refresh_token: refreshToken,     // Token de actualización
      expires_in: 7200,                // Duración del nuevo token en segundos (máximo permitido)
    };

    // Combinar los parámetros comunes y privados
    const requestData = { ...commonParams, ...privateParams };

    console.log('🔍 Parámetros de la solicitud para refresh:', requestData);

    // Enviar la solicitud POST
    const response = await axios.post(process.env.JIMI_URL, requestData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { data } = response;

    if (data.code === 0 && data.result) {
      console.log('✅ Respuesta del servidor al actualizar el token:', data);

      const tokenData = {
        appKey: data.result.appKey,
        account: data.result.account,
        accessToken: data.result.accessToken,
        refreshToken: data.result.refreshToken,
        expiresIn: data.result.expiresIn,
        time: data.result.time,
      };

      // Guardar el token actualizado en Firestore
      await db.collection('tokens').doc('jimi-token').set(tokenData);
      console.log('✅ Token actualizado correctamente:', tokenData);
      return tokenData;
    } else {
      console.error('❌ Error en la respuesta del servidor al actualizar el token:', data);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Error al intentar actualizar el token:', error.response.status);
      console.error('❌ Detalles de la respuesta:', error.response.data);
    } else {
      console.error('❌ Error al intentar actualizar el token:', error.message);
    }
    return null;
  }
}



// Función para obtener ubicaciones de dispositivos
async function fetchDeviceLocations(accessToken) {
  console.log('⏳ Intentando obtener ubicaciones de dispositivos...');
  try {
    const commonParams = generateCommonParameters('jimi.user.device.location.list');
    const privateParams = {
      access_token: accessToken,
      target: JIMI_USER_ID, // Cuenta objetivo
    };

    const requestData = { ...commonParams, ...privateParams };

    const response = await axios.post(process.env.JIMI_URL, requestData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { data } = response;

    if (data.code === 0) {
      const locations = data.result;
      console.log(`✅ Ubicaciones obtenidas: ${locations.length} dispositivos`);

      const batch = db.batch();
      locations.forEach((location) => {
        const docRef = db.collection('deviceLocations').doc(location.imei);
        batch.set(docRef, location);
      });

      await batch.commit();
      console.log('✅ Ubicaciones guardadas en Firestore');
    } else {
      console.error('❌ Error al obtener ubicaciones:', data);
    }
  } catch (error) {
    console.error('❌ Error en la obtención de ubicaciones:', error.message);
  }
}

// Evitar duplicados
let integrationInitialized = false;

// Inicializar el proceso de actualización y consultas
async function initializeIntegration() {
  console.log('⏳ Inicializando integración...');

  try {
    // Leer el token actual desde Firestore
    const tokenDoc = await db.collection('tokens').doc('jimi-token').get();
    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      currentAccessToken = tokenData.accessToken;
      currentRefreshToken = tokenData.refreshToken;

      console.log('✅ Tokens cargados desde Firestore:', {
        currentAccessToken,
        currentRefreshToken,
      });
    } else {
      console.error('❌ No se encontraron tokens en Firestore.');
      return; // Detener la inicialización si no hay tokens
    }

    // Iniciar el intervalo de 40 segundos
    setInterval(async () => {
      console.log('⏳ Intervalo iniciado: Intentando refrescar el token...');
      try {
        const updatedToken = await refreshAccessToken(currentRefreshToken);

        if (updatedToken) {
          currentAccessToken = updatedToken.accessToken;
          currentRefreshToken = updatedToken.refreshToken;

          console.log('✅ Intervalo: Token actualizado correctamente.');

          // Obtener ubicaciones de dispositivos
          await fetchDeviceLocations(currentAccessToken);
        } else {
          console.error('❌ Intervalo: Error al actualizar el token.');
        }
      } catch (error) {
        console.error('❌ Intervalo: Error en la actualización automática:', error.message);
      }
    }, 40 * 1000); // Cada 40 segundos
  } catch (error) {
    console.error('❌ Error al inicializar la integración:', error.message);
  }
}

//Ruta tempportal para consultar token
app.get('/current-token', async (req, res) => {
  try {
    const tokenDoc = await db.collection('tokens').doc('jimi-token').get();
    if (!tokenDoc.exists) {
      return res.status(404).json({ message: 'Token no encontrado' });
    }
    return res.status(200).json(tokenDoc.data());
  } catch (error) {
    console.error('❌ Error al obtener el token actual:', error.message);
    return res.status(500).json({ error: 'Error al obtener el token actual.' });
  }
});


// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error en middleware global:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error inesperado.' });
});

//// Iniciar el servidor y realizar acciones iniciales
app.listen(port, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);

  console.log('⏳ Obteniendo token automáticamente al arrancar...');
  const tokenData = await fetchAndStoreToken(); // Llamar a la función para obtener el token automáticamente

  if (tokenData) {
    // Actualizar variables globales para el intervalo
    currentAccessToken = tokenData.accessToken;
    currentRefreshToken = tokenData.refreshToken;

    console.log('✅ Token inicial obtenido y configurado.');

    // Llamar a una función adicional (opcional)
    await fetchDeviceLocations(currentAccessToken); // Obtener ubicaciones al arrancar

    // Llamar a initializeIntegration para configurar el intervalo
    await initializeIntegration();
  } else {
    console.error('❌ Error al obtener el token automáticamente al arrancar.');
  }
});

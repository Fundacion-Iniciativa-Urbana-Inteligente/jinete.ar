import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "../Context/LocationContext"; // Importar el contexto

const UnlockDevice = () => {
  const { accessToken, deviceLocation } = useLocation(); // Obtener accessToken y deviceLocation desde el contexto
  const [imei, setImei] = useState(""); // Estado para almacenar el IMEI ingresado
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para indicar si se está procesando
  const [success, setSuccess] = useState(false); // Indica si la acción fue exitosa

  const handleUnlock = async () => {
    setError(null); // Reiniciar errores
    setSuccess(false); // Reiniciar el estado de éxito

    if (!imei) {
      setError("Por favor, ingresa un IMEI válido.");
      return;
    }

    if (!accessToken) {
      setError("El token de acceso no está disponible. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      // Mostrar estado de procesamiento
      setIsProcessing(true);

      // Configuración del payload
      const endpoint = "https://us-open.tracksolidpro.com/route/rest";
      const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const signature = "123456"; // Implementar lógica de firma si es necesario

      // Actualización del inst_param_json
      const instParamJson = {
        inst_id: "416", // ID para el comando OPEN
        inst_template: "OPEN#",
        params: [], // No se requieren parámetros adicionales
        is_cover: "true",
      };

      const payload = {
        method: "jimi.open.instruction.send",
        timestamp,
        app_key: appKey,
        sign: signature,
        sign_method: "md5",
        v: "0.9",
        format: "json",
        access_token: accessToken,
        imei,
        inst_param_json: JSON.stringify(instParamJson), // Se usa el JSON actualizado
      };

      // Enviar la solicitud POST
      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Manejo de respuesta
      if (response.data && response.data.code === 0) {
        const result = response.data.result;

        if (result.includes("OPEN set OK")) {
          setSuccess(true); // Acción exitosa
          setResponseMessage("Candado abierto correctamente.");
        } else if (result.includes("OPEN command is not executed")) {
          setSuccess(true); // No hay error pero el candado ya estaba abierto
          setResponseMessage("El candado ya está abierto.");
        } else {
          throw new Error("Respuesta desconocida del servidor.");
        }
      } else {
        throw new Error(response.data.message || "Error desconocido al desbloquear.");
      }
    } catch (err) {
      setError(err.message || "Error al enviar la instrucción UNLOCK.");
      console.error("Error al desbloquear el dispositivo:", err);
    } finally {
      setIsProcessing(false); // Finalizar el estado de procesamiento
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Desbloquear Bicicleta</h2>
      <input
        type="text"
        placeholder="Ingresa el IMEI"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        style={{
          marginBottom: "10px",
          padding: "10px",
          width: "80%",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <br />
      <button
        onClick={handleUnlock}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 20px",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "Procesando..." : "Abrir Candado"}
      </button>

      {/* Mensaje de respuesta */}
      {responseMessage && success && (
        <p style={{ color: "green", marginTop: "20px" }}>{responseMessage}</p>
      )}

      {/* Mensaje de error */}
      {error && <p style={{ color: "red", marginTop: "20px" }}>Error: {error}</p>}
    </div>
  );
};

export default UnlockDevice;

import React, { useState } from "react";
import axios from "axios";

const UnlockDevice = ({ accessToken }) => {
  const [imei, setImei] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUnlock = async () => {
    setError(null);
    setSuccess(false);

    if (!imei) {
      setError("Por favor, ingresa un IMEI válido.");
      return;
    }

    if (!accessToken) {
      setError("El token de acceso no está disponible. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      setIsProcessing(true);

      const endpoint = "https://us-open.tracksolidpro.com/route/rest";
      const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const signature = "123456";

      const instParamJson = {
        inst_id: "416",
        inst_template: "OPEN#",
        params: [],
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
        inst_param_json: JSON.stringify(instParamJson),
      };

      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data && response.data.code === 0) {
        const result = response.data.result;

        if (result.includes("OPEN set OK")) {
          setSuccess(true);
          setResponseMessage("¡Bicicleta desbloqueada correctamente!");
        } else if (result.includes("OPEN command is not executed")) {
          setSuccess(true);
          setResponseMessage("La bicicleta ya está desbloqueada.");
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
      setIsProcessing(false);
    }
  };

  return (
    <div className="unlock-form">
      <div className="input-group">
        <i className="bi bi-upc-scan"></i>
        <input
          type="text"
          placeholder="Ingresa el código IMEI"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      <button
        onClick={handleUnlock}
        disabled={isProcessing}
        className={`unlock-submit-button ${isProcessing ? 'processing' : ''}`}
      >
        {isProcessing ? (
          <>
            <i className="bi bi-arrow-repeat spinning"></i>
            Procesando...
          </>
        ) : (
          <>
            <i className="bi bi-unlock"></i>
            Desbloquear
          </>
        )}
      </button>

      {responseMessage && success && (
        <div className="success-message">
          <i className="bi bi-check-circle-fill"></i>
          {responseMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle-fill"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default UnlockDevice;

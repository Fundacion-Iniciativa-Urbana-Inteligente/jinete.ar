import React, { useState } from "react";
import axios from "axios";
import QrScanner from "react-qr-scanner";

const UnlockDevice = ({ accessToken }) => {
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para indicar si se está procesando

  const handleScan = async (data) => {
    if (data) {
      const imei = data.text; // IMEI leído del QR
      setIsScanning(false); // Detener la cámara

      try {
        // Mostrar estado de procesamiento
        setIsProcessing(true);

        // Ejecutar la lógica del POST
        const endpoint = "https://us-open.tracksolidpro.com/route/rest";
        const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
        const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
        const signature = "123456"; // Implementar lógica de firma si es necesario

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
          inst_param_json: JSON.stringify({
            inst_id: "99",
            inst_template: "{0}",
            params: ["OPEN#"],
            is_cover: "true",
          }),
        };

        const response = await axios.post(endpoint, payload, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        setResponseMessage(response.data);
        setError(null); // Limpiar errores previos
        console.log("Unlock Response:", response.data);
      } catch (err) {
        setError(err.message || "Error al enviar la instrucción UNLOCK.");
        console.error("Error al desbloquear el dispositivo:", err);
      } finally {
        setIsProcessing(false); // Finalizar el estado de procesamiento
      }
    }
  };

  const handleError = (err) => {
    console.error("Error al escanear el código QR:", err);
    setError("Error al escanear el código QR. Intenta nuevamente.");
    setIsScanning(false);
  };

  const handleOpenLock = () => {
    setIsScanning(true); // Abrir la cámara para escanear
  };

  return (
    <div>
      <h2>Desbloquear Dispositivo</h2>
      {isScanning ? (
        <div>
          <QrScanner
            delay={300}
            style={{ width: "100%" }}
            onScan={handleScan}
            onError={handleError}
          />
          <button onClick={() => setIsScanning(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={handleOpenLock} disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "Abrir Candado"}
        </button>
      )}
      {responseMessage && (
        <pre>
          <strong>Respuesta:</strong> {JSON.stringify(responseMessage, null, 2)}
        </pre>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default UnlockDevice;

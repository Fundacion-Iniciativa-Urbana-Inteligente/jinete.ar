import React, { useState } from "react";
import axios from "axios";
import QrScanner from "react-qr-scanner";
import { useQR } from "../Context/QRContext";

const UnlockDevice = ({ accessToken }) => {
  const { setIsUnlocking } = useQR(); // Para volver al estado inicial
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false); // Control del escaneo
  const [isProcessing, setIsProcessing] = useState(false); // Indicador de procesamiento

  // Logs para depuración
  console.log("Estado de isScanning:", isScanning);
  console.log("Estado de isProcessing:", isProcessing);

  const handleScan = async (data) => {
    if (!data) return;

    const imei = data.text.trim();
    console.log("IMEI escaneado:", imei);

    setIsScanning(false);

    if (!imei) {
      setError("El código QR no contiene un IMEI válido.");
      return;
    }

    try {
      setIsProcessing(true);
      const endpoint = "https://us-open.tracksolidpro.com/route/rest";
      const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

      const instParamJson = {
        inst_id: "416",
        inst_template: "OPEN#",
        params: [],
        is_cover: "true",
      };

      console.log("inst_param_json generado:", JSON.stringify(instParamJson));

      const payload = {
        method: "jimi.open.instruction.send",
        timestamp,
        app_key: appKey,
        sign: "123456",
        sign_method: "md5",
        v: "0.9",
        format: "json",
        access_token: accessToken,
        imei,
        inst_param_json: JSON.stringify(instParamJson),
      };

      console.log("Payload enviado a la API:", payload);

      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      console.log("Respuesta de la API:", response.data);

      const { code, result } = response.data;

      if (code === 0) {
        if (result.includes("OPEN set OK")) {
          setResponseMessage("El candado se ha abierto correctamente.");
        } else if (result.includes("already in open status")) {
          setResponseMessage("El candado ya está abierto.");
        } else {
          setResponseMessage("Orden enviada con éxito, revisa el estado del candado.");
        }
        setError(null);
      } else {
        setError("Error al enviar la orden de desbloqueo.");
      }
    } catch (err) {
      console.error("Error al desbloquear el dispositivo:", err);
      setError("Error al enviar la instrucción UNLOCK.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (err) => {
    console.error("Error al escanear el código QR:", err);
    setError("Error al escanear el código QR. Intenta nuevamente.");
    setIsScanning(false);
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
        <div>
          <button
            onClick={() => {
              console.log("Abrir cámara"); // Log para confirmar el clic
              setIsScanning(true);
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "Procesando..." : "Escanear QR"}
          </button>
          <button onClick={() => setIsUnlocking(false)} disabled={isProcessing}>
            Volver
          </button>
        </div>
      )}
      {responseMessage && <p style={{ color: "green" }}>{responseMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UnlockDevice;

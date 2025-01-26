import React, { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import axios from "axios";
import "./Mapa.css";

const defaultPosition = [-27.366666666667, -55.893];

export default function Mapa() {
  const [bicycles, setBicycles] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [unlockToken, setUnlockToken] = useState("");
  const [message, setMessage] = useState("");
  const [timerText, setTimerText] = useState("Token no generado.");
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    const fetchBicycles = async () => {
      try {
        const response = await axios.get("/api/bicycles");
        const validBicycles = response.data.filter(
          (bike) =>
            bike.lat !== undefined &&
            bike.lng !== undefined &&
            !isNaN(bike.lat) &&
            !isNaN(bike.lng)
        );
        setBicycles(validBicycles);
      } catch (error) {
        console.error("Error al obtener bicicletas:", error);
      }
    };

    fetchBicycles();
  }, []);

  const fetchToken = async (bike) => {
    if (!bike) return;
    try {
      const response = await fetch(`/api/token/${bike.imei}`);
      const data = await response.json();
      setUnlockToken(data.token);
      updateTimer(data.expirationTime);
    } catch (error) {
      console.error("Error al obtener el token:", error);
      setMessage("Error al obtener el token.");
    }
  };

  const updateTimer = (expirationTime) => {
    if (timerInterval) clearInterval(timerInterval);

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingTime = Math.max(0, expirationTime - now);

      if (remainingTime <= 0) {
        clearInterval(interval);
        setTimerText("Token expirado.");
        return;
      }

      const secondsLeft = Math.floor(remainingTime / 1000);
      setTimerText(`Tiempo restante: ${secondsLeft}s`);
    }, 1000);

    setTimerInterval(interval);
  };

  const handleUnlock = async () => {
    if (!selectedBike || !unlockToken) {
      setMessage("Por favor selecciona una bicicleta e ingresa el token.");
      return;
    }

    try {
      const response = await axios.post("/api/unlock", {
        imei: selectedBike.imei,
        enteredToken: unlockToken,
      });

      if (response.status === 200) {
        setMessage(response.data.message);
      } else {
        setMessage(response.data.message || "Error desconocido.");
      }
    } catch (error) {
      console.error("Error al intentar desbloquear:", error);
      setMessage("Error al intentar desbloquear.");
    }
  };

  return (
    <div id="mapa">
      <MapContainer center={defaultPosition} zoom={15}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {bicycles.map((bike) => (
          <Marker
            key={bike.imei}
            position={[bike.lat, bike.lng]}
            eventHandlers={{
              click: () => setSelectedBike(bike),
            }}
          >
            <Popup>
              <strong>{bike.deviceName || "Sin nombre"}</strong>
              <br />
              Batería: {bike.batteryPowerVal}%
              <br />
              <button
                onClick={() => fetchToken(bike)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Generar Token
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <footer
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          textAlign: "center",
          borderTop: "1px solid #ddd",
        }}
      >
        <h4>Ingresar Código de Desbloqueo</h4>
        <p>{timerText}</p>
        <input
          type="text"
          value={unlockToken}
          onChange={(e) => setUnlockToken(e.target.value)}
          placeholder="Ingresa manualmente el código recibido"
          style={{
            padding: "10px",
            width: "60%",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={handleUnlock}
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Confirmar Código
        </button>
        <p style={{ color: "red" }}>{message}</p>
      </footer>
    </div>
  );
}

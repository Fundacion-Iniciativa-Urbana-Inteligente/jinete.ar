import React, { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation } from "../Context/LocationContext";
import UnlockDevice from "../Components/UnlockDevice"; // Asegúrate de que la ruta sea correcta

const posadas = [-27.366666666667, -55.893]; // Coordenadas iniciales de Posadas

export default function Mapa({ accessToken }) {
  const { deviceLocation } = useLocation(); // Obtén la ubicación desde el contexto
  const [showUnlock, setShowUnlock] = useState(false); // Estado para mostrar u ocultar UnlockDevice

  // Función para mostrar el componente de desbloqueo
  const handleUnlockClick = () => {
    setShowUnlock(true);
  };

  // Función para cerrar el componente de desbloqueo
  const closeUnlock = () => {
    setShowUnlock(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Contenedor del Mapa */}
      <MapContainer
        center={deviceLocation ? [deviceLocation.latitude, deviceLocation.longitude] : posadas}
        zoom={15}
        style={{ height: "100vh", width: "100%" }} // Asegura que el mapa ocupe el espacio esperado
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {deviceLocation &&
          deviceLocation.latitude !== undefined &&
          deviceLocation.longitude !== undefined && (
            <Marker position={[deviceLocation.latitude, deviceLocation.longitude]}>
              <Popup>
                Ubicación actual: <br />
                Latitud: {deviceLocation.latitude}, Longitud: {deviceLocation.longitude}
              </Popup>
            </Marker>
          )}
      </MapContainer>

      {/* Botón Desbloquear sobre el mapa */}
      <button
        onClick={handleUnlockClick}
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 20px",
          cursor: "pointer",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        Desbloquear Bicicleta
      </button>

      {/* Mostrar UnlockDevice cuando showUnlock es true */}
      {showUnlock && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 2000,
          }}
        >
          <UnlockDevice accessToken={accessToken} />
          <button
            onClick={closeUnlock}
            style={{
              display: "block",
              margin: "10px auto 0",
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}


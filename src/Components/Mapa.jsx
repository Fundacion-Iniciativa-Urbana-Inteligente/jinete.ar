import React, { useState, useEffect, useContext } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const defaultPosition = [-27.366666666667, -55.893];

export default function Mapa() {
  const [userPosition, setUserPosition] = useState(defaultPosition);
  const [bicycles, setBicycles] = useState([]);
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
      (error) => console.error("Error al obtener ubicación:", error)
    );
  }, []);

  useEffect(() => {
    const fetchBicycles = async () => {
      try {
        const response = await axios.get("/api/bicycles");
        setBicycles(response.data);
      } catch (error) {
        console.error("Error al obtener bicicletas:", error);
      }
    };

    fetchBicycles();
  }, []);

  const handleUnlockClick = async (imei) => {
    if (!user) {
      alert("Debes iniciar sesión para desbloquear una bicicleta.");
      try {
        const loggedUser = await login();
        if (loggedUser) {
          alert(`Bienvenido, ${loggedUser.name}! Intenta desbloquear nuevamente.`);
        } else {
          alert("No se pudo obtener la información del usuario. Intenta nuevamente.");
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        alert("Hubo un problema al iniciar sesión. Intenta nuevamente.");
      }
      return;
    }

    const arUrl = `/ar.html?imei=${imei}`;
    window.open(arUrl, "_blank", "width=800,height=600");
  };

  return (
    <div id="mapa">
      <MapContainer center={userPosition} zoom={15} style={{ height: "100vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {bicycles.map((bike) => (
          <Marker key={bike.imei} position={[bike.lat, bike.lng]}>
            <Popup>
              <strong>{bike.deviceName || "Sin nombre"}</strong>
              <br />
              Batería: {bike.batteryPowerVal}%
              <br />
              Estado: {bike.estado ? "En uso" : "Disponible"}
              <br />
              <button onClick={() => handleUnlockClick(bike.imei)}>Desbloquear Bicicleta</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

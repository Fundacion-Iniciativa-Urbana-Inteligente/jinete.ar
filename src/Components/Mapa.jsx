import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation } from "../Context/LocationContext";
import MapButton from "./MapButton"; // Asegúrate de importar MapButton

const posadas = [-27.366666666667, -55.893]; // Coordenadas iniciales de Posadas

export default function Mapa() {
  const { deviceLocation } = useLocation(); // Obtén la ubicación desde el contexto

  // Debugging opcional para confirmar los datos
  console.log("Device Location en Mapa.jsx:", deviceLocation);

  return (
    <>
      <MapContainer
        center={deviceLocation ? [deviceLocation.latitude, deviceLocation.longitude] : posadas}
        zoom={15}
        style={{ height: "100vh", width: "100%" }} // Asegura que el mapa ocupe el espacio esperado
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {deviceLocation && deviceLocation.latitude !== undefined && deviceLocation.longitude !== undefined && (
          <Marker position={[deviceLocation.latitude, deviceLocation.longitude]}>
            <Popup>
              Ubicación actual: <br />
              Latitud: {deviceLocation.latitude}, Longitud: {deviceLocation.longitude}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <MapButton /> {/* Ahora está envuelto en el mismo fragmento que el mapa */}
    </>
  );
}


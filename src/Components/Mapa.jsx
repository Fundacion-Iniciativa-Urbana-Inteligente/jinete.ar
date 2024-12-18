import React, { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation } from "../Context/LocationContext";
import UnlockDevice from "../Components/UnlockDevice";
import { signInWithGoogle } from "../firebaseAuth";

const posadas = [-27.366666666667, -55.893];

export default function Mapa({ accessToken }) {
  const { deviceLocation } = useLocation();
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    console.log("Device Location Data:", deviceLocation);
  }, [deviceLocation]);

  const handleUnlockClick = () => {
    setShowUnlock(true);
  };

  const closeUnlock = () => {
    setShowUnlock(false);
  };

  const formatCoordinates = (coord) => {
    return coord.toFixed(6);
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return "#4CAF50";
    if (level >= 30) return "#FFC107";
    return "#F44336";
  };

  const getDeviceTitle = () => {
    if (!deviceLocation) return "Bicicleta Sin ID";
    const name = deviceLocation.deviceName || deviceLocation.device_name || deviceLocation.imei;
    return `Bicicleta ${name || "Sin ID"}`;
  };

  return (
    <div id="mapa">
      <MapContainer
        center={deviceLocation ? [deviceLocation.latitude, deviceLocation.longitude] : posadas}
        zoom={15}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        minZoom={3}
        maxZoom={18}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {deviceLocation &&
          deviceLocation.latitude !== undefined &&
          deviceLocation.longitude !== undefined && (
            <Marker position={[deviceLocation.latitude, deviceLocation.longitude]}>
              <Popup className="custom-popup">
                <div className="popup-header">
                  <i className="bi bi-bicycle"></i>
                  <h3>{getDeviceTitle()}</h3>
                </div>
                <div className="popup-content">
                  <div className="info-row">
                    <i className="bi bi-geo-alt"></i>
                    <div>
                      <strong>Ubicación:</strong><br />
                      <span>{formatCoordinates(deviceLocation.latitude)}° N, {formatCoordinates(deviceLocation.longitude)}° O</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <i className="bi bi-battery-half"></i>
                    <div>
                      <strong>Batería:</strong>
                      <div className="battery-bar">
                        <div 
                          className="battery-level" 
                          style={{
                            width: `${deviceLocation.batteryPowerVal || 85}%`,
                            backgroundColor: getBatteryColor(deviceLocation.batteryPowerVal || 85)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="info-row">
                    <i className="bi bi-clock"></i>
                    <div>
                      <strong>Última actualización:</strong><br />
                      <span>{deviceLocation.gpsTime || new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
      </MapContainer>

      <button
        onClick={handleUnlockClick}
        className="unlock-button"
        aria-label="Desbloquear dispositivo"
      >
        <i className="bi bi-lock-fill"></i>
      </button>

      {showUnlock && (
        <div className="unlock-modal">
          <div className="unlock-modal-content">
            <div className="unlock-modal-header">
              <h2>
                <i className="bi bi-bicycle"></i>
                {getDeviceTitle()}
              </h2>
              <button onClick={closeUnlock} className="close-button">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <UnlockDevice accessToken={accessToken} />
          </div>
        </div>
      )}
    </div>
  );
}


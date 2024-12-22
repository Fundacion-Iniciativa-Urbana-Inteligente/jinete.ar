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
    if (deviceLocation) {
      console.log("Coordenadas del dispositivo:", {
        latitude: deviceLocation.latitude || deviceLocation.lat,
        longitude: deviceLocation.longitude || deviceLocation.lng
      });
    }
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
    const name = deviceLocation.deviceName || deviceLocation.device_name || deviceLocation.name || "Sin Nombre";
    const id = deviceLocation.imei || deviceLocation.id || "Sin ID";
    return `Bicicleta ${name} #${id}`;
  };

  const getStatusText = (status) => {
    switch(status) {
      case '1': return 'Disponible';
      case '2': return 'En uso';
      case '3': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const getSignalQuality = (gpsSignal) => {
    const signal = parseInt(gpsSignal);
    if (signal >= 4) return { text: 'Buena', color: '#4CAF50' };
    if (signal >= 2) return { text: 'Regular', color: '#FFC107' };
    return { text: 'Débil', color: '#dc3545' };
  };

  const formatBattery = (batteryPowerVal) => {
    if (!batteryPowerVal) return '0%';
    const voltage = parseFloat(batteryPowerVal);
    // Convertir voltaje a porcentaje (asumiendo rango 3.2V - 4.2V)
    const percentage = Math.round(((voltage - 3.2) / (4.2 - 3.2)) * 100);
    return `${Math.min(Math.max(percentage, 0), 100)}%`;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getCoordinates = () => {
    if (!deviceLocation) return posadas;
    return [
      deviceLocation.latitude || deviceLocation.lat || posadas[0],
      deviceLocation.longitude || deviceLocation.lng || posadas[1]
    ];
  };

  return (
    <div id="mapa">
      <MapContainer
        center={getCoordinates()}
        zoom={15}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        minZoom={3}
        maxZoom={18}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {deviceLocation && (
          <Marker position={getCoordinates()}>
            <Popup className="custom-popup">
              <div className="popup-header">
                <i className="bi bi-bicycle"></i>
                {deviceLocation.deviceName || 'Sin nombre'} #{deviceLocation.imei}
              </div>
              <div className="popup-content">
                <div className="info-row">
                  <i className="bi bi-circle-fill status-icon" style={{
                    color: deviceLocation.status === '1' ? '#4CAF50' : '#dc3545'
                  }}></i>
                  <div>
                    <label>Estado:</label>
                    <span>{getStatusText(deviceLocation.status)}</span>
                  </div>
                </div>
                <div className="info-row">
                  <i className="bi bi-reception-4"></i>
                  <div>
                    <label>Señal:</label>
                    <span style={{ color: getSignalQuality(deviceLocation.gpsSignal).color }}>
                      {getSignalQuality(deviceLocation.gpsSignal).text} ({deviceLocation.gpsNum} satélites)
                    </span>
                  </div>
                </div>
                <div className="info-row">
                  <i className="bi bi-battery"></i>
                  <div>
                    <label>Batería:</label>
                    <span>{formatBattery(deviceLocation.batteryPowerVal)}</span>
                  </div>
                </div>
                <div className="info-row">
                  <i className="bi bi-geo-alt"></i>
                  <div>
                    <label>Ubicación:</label>
                    <span>{deviceLocation.lat}° N, {deviceLocation.lng}° O</span>
                  </div>
                </div>
                <div className="info-row">
                  <i className="bi bi-speedometer2"></i>
                  <div>
                    <label>Kilometraje:</label>
                    <span>{parseFloat(deviceLocation.currentMileage).toFixed(2)} km</span>
                  </div>
                </div>
                <div className="info-row">
                  <i className="bi bi-clock"></i>
                  <div>
                    <label>Última actualización:</label>
                    <span>{formatDateTime(deviceLocation.gpsTime)}</span>
                  </div>
                </div>
              </div>
              <div className="device-actions">
                <button 
                  onClick={handleUnlockClick}
                  className="btn btn-primary w-100"
                  disabled={deviceLocation.status !== '1'}
                >
                  <i className="bi bi-unlock"></i>
                  {deviceLocation.status === '1' ? 'Desbloquear' : 'No disponible'}
                </button>
                <button 
                  onClick={() => window.location.href = `https://wa.me/+5493513385327?text=Hola, necesito ayuda con la bicicleta ${deviceLocation.deviceName} (${deviceLocation.imei})`}
                  className="btn btn-success w-100"
                >
                  <i className="bi bi-whatsapp"></i>
                  Contactar Soporte
                </button>
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

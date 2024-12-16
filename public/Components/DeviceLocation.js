import React, { useEffect } from "react";
import axios from "axios";
import { useLocation } from "../Context/LocationContext";
import md5 from "md5"; // Asegúrate de importar la librería

const DeviceLocation = ({
  heartbeat
}) => {
  const {
    accessToken,
    setDeviceLocation
  } = useLocation(); // Obtén el token y el setter desde el contexto

  const fetchDeviceLocation = async () => {
    if (!accessToken) {
      console.warn("AccessToken no disponible");
      return;
    }
    const endpoint = "https://us-open.tracksolidpro.com/route/rest";
    const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
    const appSecret = "YOUR_APP_SECRET"; // Reemplaza con tu App Secret
    const target = "gazzimon@gmail.com";
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const params = {
      method: "jimi.user.device.location.list",
      timestamp,
      app_key: appKey,
      sign_method: "md5",
      v: "0.9",
      format: "json",
      access_token: accessToken,
      target,
      map_type: ""
    };

    // Generar firma MD5
    const paramString = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&");
    const signatureString = `${appSecret}${paramString}${appSecret}`;
    const signature = md5(signatureString);

    // Mostrar los datos de la firma
    console.log("Cadena para MD5:", signatureString);
    console.log("Firma generada:", signature);
    const payload = {
      ...params,
      sign: signature
    };
    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      if (response.data && response.data.result) {
        const locationData = response.data.result[0]; // Accede al primer resultado
        console.log("Datos de la API:", locationData);

        // Actualiza el contexto con lat y lng
        setDeviceLocation({
          latitude: locationData.lat,
          longitude: locationData.lng
        });
      }
    } catch (error) {
      console.error("Error al obtener la ubicación:", error);
    }
  }; // Asegúrate de cerrar la función aquí

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeviceLocation();
    }, heartbeat * 1000);
    return () => clearInterval(interval);
  }, [accessToken, heartbeat]);
  return null; // Este componente tampoco necesita renderizar nada
};
export default DeviceLocation;
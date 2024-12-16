import React, { useEffect } from "react";
import axios from "axios";
import { useLocation } from "../Context/LocationContext";
const RefreshToken = () => {
  const {
    accessToken,
    setAccessToken,
    refreshToken
  } = useLocation();
  useEffect(() => {
    if (!refreshToken) {
      console.warn("RefreshToken no disponible.");
      return;
    }
    const refreshAccessToken = async () => {
      const endpoint = "https://us-open.tracksolidpro.com/route/rest";
      const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const payload = {
        method: "jimi.oauth.token.refresh",
        timestamp,
        app_key: appKey,
        sign_method: "md5",
        v: "0.9",
        format: "json",
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 7200
      };
      try {
        const response = await axios.post(endpoint, payload, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        const {
          result
        } = response.data;
        if (result && result.accessToken) {
          console.log("AccessToken renovado:", result.accessToken);
          setAccessToken(result.accessToken); // Actualiza el Access Token
        } else {
          console.error("Error al renovar el AccessToken.");
        }
      } catch (error) {
        console.error("Error al refrescar el AccessToken:", error);
      }
    };

    // Configurar un intervalo para renovar el token antes de que expire
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 600000); // 10 minutos

    return () => clearInterval(interval);
  }, [accessToken, refreshToken, setAccessToken]);
  return null;
};
export default RefreshToken;
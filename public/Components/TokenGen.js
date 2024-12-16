import React, { useEffect } from "react";
import axios from "axios";
import md5 from "md5";
import { useLocation } from "../Context/LocationContext";
const TokenGen = () => {
  const {
    setAccessToken,
    setRefreshToken
  } = useLocation();
  useEffect(() => {
    const fetchToken = async () => {
      const endpoint = "https://us-open.tracksolidpro.com/route/rest";
      const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
      const userId = "gazzimon@gmail.com";
      const userPwd = "Pajaro01"; // Reemplaza con la contraseña real
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const userPwdMd5 = md5(userPwd);
      const payload = {
        method: "jimi.oauth.token.get",
        timestamp,
        app_key: appKey,
        sign: "123456",
        sign_method: "md5",
        v: "0.9",
        format: "json",
        user_id: userId,
        user_pwd_md5: userPwdMd5,
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
          console.log("AccessToken generado:", result.accessToken);
          setAccessToken(result.accessToken); // Guarda en el contexto y LocalStorage
          setRefreshToken(result.refreshToken); // Guarda en el contexto y LocalStorage
        } else {
          console.error("Error: No se pudo generar el AccessToken.");
        }
      } catch (error) {
        console.error("Error al obtener el AccessToken:", error);
      }
    };
    fetchToken();
  }, [setAccessToken, setRefreshToken]);
  return null; // Este componente no renderiza nada
};
export default TokenGen;
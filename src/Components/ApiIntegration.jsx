import React, { useState } from "react";
import axios from "axios";
import md5 from "md5";
import DeviceLocation from "./DeviceLocation";
import UnlockDevice from "./UnlockDevice";

const ApiIntegration = () => {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  const handleApiCall = async () => {
    const endpoint = "https://us-open.tracksolidpro.com/route/rest";
    const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
    const userPwd = "Pajaro01"; // Contraseña original
    const userId = "gazzimon@gmail.com";

    // Generar valores dinámicos
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const userPwdMd5 = md5(userPwd);
    const signature = "123456"; // Aquí puedes agregar tu lógica de firma

    const payload = {
      method: "jimi.oauth.token.get",
      timestamp,
      app_key: appKey,
      sign: signature,
      sign_method: "md5",
      v: "0.9",
      format: "json",
      user_id: userId,
      user_pwd_md5: userPwdMd5,
      expires_in: 7200,
    };

    try {
      // Hacer la solicitud POST
      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Parsear la respuesta
      const { result } = response.data;
      const { accessToken, refreshToken, time, expiresIn } = result;

      // Calcular `TimeEnd`
      const timeObject = new Date(time);
      const timeEndObject = new Date(timeObject.getTime() + expiresIn * 1000);

      // Actualizar el estado
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setTimeEnd(timeEndObject.toISOString());

      console.log("AccessToken:", accessToken);
      console.log("RefreshToken:", refreshToken);
      console.log("Time:", time);
      console.log("TimeEnd:", timeEndObject.toISOString());
    } catch (error) {
      console.error("Error al hacer la solicitud:", error);
    }
  };

  return (
    <div>
      <h1>Integración de API</h1>
      <button onClick={handleApiCall}>Obtener Token</button>
      {accessToken ? (
        <div>
          <p><strong>AccessToken:</strong> {accessToken}</p>
          <p><strong>RefreshToken:</strong> {refreshToken}</p>
          <p><strong>TimeEnd:</strong> {timeEnd}</p>
          {/* Componentes adicionales */}
          <DeviceLocation accessToken={accessToken} heartbeat={40} />
          <UnlockDevice accessToken={accessToken} imei="860187050182074" />
        </div>
      ): <p>No hay token</p>}
    </div>
  );
};

export default ApiIntegration;

import md5 from "md5";
import axios from "axios";
import { useEffect } from "react";
import { useLocation } from "../Context/LocationContext";

export default function TokenGen() {
  const { setAccessToken } = useLocation(); // Obtiene el setter desde el contexto

  const endpoint = "https://us-open.tracksolidpro.com/route/rest";
  const appKey = "8FB345B8693CCD00A85859F91CC77D2A339A22A4105B6558";
  const userPwd = "Pajaro01";
  const userId = "gazzimon@gmail.com";

  const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
  const userPwdMd5 = md5(userPwd);
  const signature = "123456"; // Agrega tu lógica de firma aquí

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

  const handleApiCall = async () => {
    try {
      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { result } = response.data;
      if (result) {
        const { accessToken } = result;
        setAccessToken(accessToken); // Actualiza el contexto con el accessToken
        console.log("AccessToken obtenido:", accessToken);
      }
    } catch (error) {
      console.error("Error al hacer la solicitud:", error);
    }
  };

  useEffect(() => {
    handleApiCall();
  }, []); // Llama al token solo una vez al montar

  return null; // Este componente no necesita renderizar nada
}


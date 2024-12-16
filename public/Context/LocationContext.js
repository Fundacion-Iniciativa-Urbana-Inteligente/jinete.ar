import React, { createContext, useContext, useState, useEffect } from "react";
const LocationContext = /*#__PURE__*/createContext();
export const LocationProvider = ({
  children
}) => {
  // Leer los tokens desde LocalStorage al cargar el contexto
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);
  const [deviceLocation, setDeviceLocation] = useState(null);

  // Guardar tokens en LocalStorage cuando cambien
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [refreshToken]);
  return /*#__PURE__*/React.createElement(LocationContext.Provider, {
    value: {
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
      deviceLocation,
      setDeviceLocation
    }
  }, children);
};
export const useLocation = () => useContext(LocationContext);
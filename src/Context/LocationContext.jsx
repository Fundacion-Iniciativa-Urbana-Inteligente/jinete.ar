import React, { createContext, useState, useContext } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  return (
    <LocationContext.Provider value={{ deviceLocation, setDeviceLocation, accessToken, setAccessToken }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

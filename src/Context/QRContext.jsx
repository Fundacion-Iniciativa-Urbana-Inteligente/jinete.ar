import React, { createContext, useContext, useState } from "react";

// Crear el contexto
const QRContext = createContext();

// Proveedor del contexto
export const QRProvider = ({ children }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  console.log("Estado inicial de isUnlocking:", isUnlocking); // Verificar el estado inicial

  return (
    <QRContext.Provider value={{ isUnlocking, setIsUnlocking }}>
      {children}
    </QRContext.Provider>
  );
};

// Hook para consumir el contexto
export const useQR = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error("useQR debe usarse dentro de un QRProvider");
  }
  return context;
};
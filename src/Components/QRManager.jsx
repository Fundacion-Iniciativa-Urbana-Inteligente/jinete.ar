import React from "react";
import { useQR } from "../Context/QRContext";
import MapButton from "./MapButton";
import UnlockDevice from "./UnlockDevice";

export default function QRManager({ accessToken }) {
  const { isUnlocking, setIsUnlocking } = useQR();

  // Logs de depuración para verificar el estado
  console.log("Estado actual de isUnlocking:", isUnlocking);

  return (
    <div>
      {!isUnlocking ? (
        <MapButton
          onClick={() => {
            console.log("Botón presionado: Activando flujo de desbloqueo");
            setIsUnlocking(true);
          }}
        />
      ) : (
        <UnlockDevice
          accessToken={accessToken}
          onClose={() => {
            console.log("Cerrando flujo de desbloqueo");
            setIsUnlocking(false);
          }}
        />
      )}
    </div>
  );
}

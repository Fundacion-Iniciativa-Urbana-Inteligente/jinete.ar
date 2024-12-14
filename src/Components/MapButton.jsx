import { useQR } from "../Context/QRContext";

export default function MapButton() {
  const { setIsUnlocking } = useQR(); // Obtiene la función desde el contexto

  // Log para verificar que setIsUnlocking se pasa correctamente
  console.log("setIsUnlocking en MapButton:", setIsUnlocking);

  return (
    <div className="bt-escaner">
      <button
        className="btn btn-light escaner"
        onClick={() => {
          console.log("Botón presionado"); // Log para confirmar que el botón fue clickeado
          if (typeof setIsUnlocking === "function") {
            setIsUnlocking(true); // Cambia el estado en el contexto
            console.log("Estado cambiado a desbloqueo activo"); // Log para confirmar la ejecución
          } else {
            console.error("setIsUnlocking no está definido o no es una función"); // Error si el contexto no está configurado
          }
        }}
      >
        <img src="/qr_code.svg" height={35} alt="Escanear QR" />
      </button>
    </div>
  );
}

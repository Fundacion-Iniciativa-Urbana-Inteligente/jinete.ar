import React from "react";

export default function MapButton({ onClick }) {
  return (
    <div className="bt-escaner">
      <button
        className="btn btn-light escaner"
        onClick={() => {
          console.log("Botón QR presionado en MapButton");
          onClick(); // Llama a la función pasada como prop
        }}
      >
        <img src="/qr_code.svg" height={35} alt="Escanear QR" />
      </button>
    </div>
  );
}
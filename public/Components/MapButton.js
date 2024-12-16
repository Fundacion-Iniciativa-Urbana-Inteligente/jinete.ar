import React from "react";
export default function MapButton({
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bt-escaner"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-light escaner",
    onClick: () => {
      console.log("Botón QR presionado en MapButton");
      onClick(); // Llama a la función pasada como prop
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/qr_code.svg",
    height: 35,
    alt: "Escanear QR"
  })));
}
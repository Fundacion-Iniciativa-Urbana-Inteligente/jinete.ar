import { useParams } from "react-router-dom";
import VehiculoEnPerfil from "../Components/VehiculoEnPerfil";
import ApiIntegration from "../Components/ApiIntegration";
export default function Perfil() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "profile-banner"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile"
  }, /*#__PURE__*/React.createElement("h2", null, "Saldo:"), /*#__PURE__*/React.createElement("h1", {
    id: "saldo"
  }, "$2905.94"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-success"
  }, "Comprar Saldo"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(VehiculoEnPerfil, null), /*#__PURE__*/React.createElement(ApiIntegration, null))));
}
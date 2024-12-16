import { NavLink } from "react-router-dom";
export default function NotFound() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("h1", null, "Not Found"), /*#__PURE__*/React.createElement("p", null, "Parece que te perdiste"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement(NavLink, {
    to: "/"
  }, "Volver al mapa"))));
}
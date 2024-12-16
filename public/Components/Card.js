import { NavLink } from "react-router-dom";
export default function Card(props) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "col-sm-6 mb-3 mb-sm-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "card-title"
  }, props.titulo), /*#__PURE__*/React.createElement("p", {
    className: "card-text"
  }, props.texto), /*#__PURE__*/React.createElement(NavLink, {
    to: props.url,
    className: "btn btn-primary"
  }, props.boton)))));
}
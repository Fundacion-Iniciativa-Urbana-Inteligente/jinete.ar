import React, { useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext"; // Importar UserContext

const Menu = () => {
  const navbarToggler = useRef(null); // Referencia al botón de colapsar el menú
  const navbarCollapse = useRef(null); // Referencia al contenedor del menú
  const {
    user,
    setUser
  } = useContext(UserContext); // Usar contexto global
  const navigate = useNavigate();

  // Función para cerrar el menú en vista móvil
  const closeMenu = () => {
    if (window.innerWidth < 992 && navbarCollapse.current?.classList.contains("show")) {
      navbarToggler.current?.click();
    }
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar token del almacenamiento local
    localStorage.removeItem("user"); // Eliminar usuario del almacenamiento local
    setUser(null); // Actualizar estado global
    navigate("/"); // Redirigir al inicio
  };

  // Manejar el colapso del menú al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        navbarCollapse.current?.classList.remove("show"); // Asegurarse de cerrar el menú en pantallas grandes
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Limpiar el listener al desmontar
  }, []);
  return /*#__PURE__*/React.createElement("nav", {
    className: "navbar navbar-expand-lg fixed-top bg-body-tertiary",
    "data-bs-theme": "light"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement(NavLink, {
    className: "navbar-brand",
    to: "/",
    onClick: closeMenu
  }, "Inicio"), /*#__PURE__*/React.createElement("button", {
    ref: navbarToggler,
    className: "navbar-toggler",
    type: "button",
    "data-bs-toggle": "collapse",
    "data-bs-target": "#navbarNavDropdown",
    "aria-controls": "navbarNavDropdown",
    "aria-expanded": "false",
    "aria-label": "Toggle navigation"
  }, /*#__PURE__*/React.createElement("span", {
    className: "navbar-toggler-icon"
  })), /*#__PURE__*/React.createElement("div", {
    ref: navbarCollapse,
    className: "collapse navbar-collapse",
    id: "navbarNavDropdown"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "navbar-nav ms-auto"
  }, " ", /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement(NavLink, {
    className: "nav-link",
    "aria-current": "page",
    to: "/",
    onClick: closeMenu
  }, "Home")), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement(NavLink, {
    className: "nav-link",
    to: "/Helpme",
    onClick: closeMenu
  }, "As\xED Funciona")), user ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nav-link"
  }, "Bienvenido, ", user.name)), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-link nav-link",
    onClick: handleLogout
  }, "Logout"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement(NavLink, {
    className: "nav-link",
    to: "/login",
    onClick: closeMenu
  }, "Login")), /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement(NavLink, {
    className: "nav-link",
    to: "/signup",
    onClick: closeMenu
  }, "Sign Up")))))));
};
export default Menu;
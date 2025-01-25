import React, { useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import "./Menu.css";

const Menu = () => {
  const navbarToggler = useRef(null);
  const navbarCollapse = useRef(null);
  const { user, login, logout } = useContext(AuthContext); // Usamos únicamente AuthContext
  const navigate = useNavigate();

  // Cerrar el menú en dispositivos pequeños
  const closeMenu = () => {
    if (window.innerWidth < 992 && navbarCollapse.current?.classList.contains("show")) {
      navbarToggler.current?.click();
    }
  };

  // Manejo del proceso de pago
  const handlePayment = async () => {
    if (!user) {
      alert("Por favor, inicia sesión antes de realizar un pago.");
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/mercadopago/create_payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: `${user.name}@example.com`,
          title: "Alquiler x 1hora - Jinete.ar",
          quantity: 1,
          unitPrice: 10,
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redirige al checkout de Mercado Pago
      } else {
        alert("Error al generar el pago. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un problema al procesar el pago.");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/" onClick={closeMenu}>
          Jinete.ar
        </NavLink>
        <button
          ref={navbarToggler}
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div ref={navbarCollapse} className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/helpme" onClick={closeMenu}>
                Así Funciona
              </NavLink>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Bienvenido, {user.name}</span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                  >
                    Cargar Saldo
                  </button>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="btn btn-primary" onClick={login}>
                  Ingresar con Google
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;

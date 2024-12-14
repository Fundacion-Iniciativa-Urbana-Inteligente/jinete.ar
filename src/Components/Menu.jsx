import React, { useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext"; // Importar UserContext

const Menu = () => {
  const navbarToggler = useRef(null); // Referencia al botón de colapsar el menú
  const navbarCollapse = useRef(null); // Referencia al contenedor del menú
  const { user, setUser } = useContext(UserContext); // Usar contexto global
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

  return (
    <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary" data-bs-theme="light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/" onClick={closeMenu}>
          Inicio
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
          <ul className="navbar-nav ms-auto"> {/* Alineación a la derecha */}
            <li className="nav-item">
              <NavLink className="nav-link" aria-current="page" to="/" onClick={closeMenu}>
                Home
              </NavLink>
              
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/Helpme" onClick={closeMenu}>
                Así Funciona
              </NavLink>
            </li>
          
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Bienvenido, {user.name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={closeMenu}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/signup" onClick={closeMenu}>
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;

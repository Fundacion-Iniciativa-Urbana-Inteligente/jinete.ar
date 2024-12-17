import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebaseAuth"; // Importar función de autenticación
import "./menu.css";

const Menu = () => {
  const navbarToggler = useRef(null);
  const navbarCollapse = useRef(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Cerrar el menú en dispositivos pequeños
  const closeMenu = () => {
    if (window.innerWidth < 992 && navbarCollapse.current?.classList.contains("show")) {
      navbarToggler.current?.click();
    }
  };

  // Manejo de Login con Google
  const handleLogin = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      console.log("Usuario autenticado:", loggedUser); // Verifica el usuario en consola
      if (loggedUser && loggedUser.displayName) {
        setUser({ name: loggedUser.displayName });
        localStorage.setItem("user", JSON.stringify({ name: loggedUser.displayName }));
        navigate("/");
      } else {
        console.error("El nombre del usuario no está disponible.");
        alert("No se pudo obtener el nombre del usuario. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Error al iniciar sesión. Inténtalo nuevamente.");
    }
  };
  
  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Recuperar usuario almacenado en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
              <NavLink className="nav-link" to="/help" onClick={closeMenu}>
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
              <li className="nav-item">
                <button className="btn btn-primary" onClick={handleLogin}>
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
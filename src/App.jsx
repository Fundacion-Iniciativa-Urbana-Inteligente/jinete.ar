import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Menu from "./Components/Menu";
import Home from "./Pages/Home";
import Perfil from "./Pages/Perfil";
import NotFound from "./Pages/NotFound";
import Helpme from "./Pages/Helpme";
import LogIn from "./Components/LogIn";
import SignUp from "./Components/SignUp";
import Verify from "./Components/Verify"; // Nueva página de verificación
import Footer from "./Components/Footer";
import { UserProvider } from "./Context/UserContext"; // Contexto de usuario
import { LocationProvider } from "./Context/LocationContext"; // Contexto de localización
import { QRProvider } from "./Context/QRContext"; // Contexto para el flujo QR
import TokenGen from "./Components/TokenGen";
import RefreshToken from "./Components/RefreshToken";
import DeviceLocation from "./Components/DeviceLocation";
import Mapa from "./Components/Mapa";
import QRManager from "./Components/QRManager"; // Componente principal para manejar MapButton y UnlockDevice

function App() {
  return (
    <UserProvider> {/* El contexto de usuario debe envolver a los demás si es necesario */}
      <LocationProvider> {/* Contexto de localización */}
        <QRProvider> {/* Contexto para el flujo QR */}
          <Router>
            <Menu />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/helpme" element={<Helpme />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify/:userId" element={<Verify />} /> {/* Ruta de verificación */}
              <Route path="/map" element={<Mapa />} /> {/* Mapa como una ruta */}
              <Route path="/qr" element={<QRManager />} /> {/* Ruta para el flujo QR */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Router>
          {/* Componentes globales que necesitan acceso al contexto */}
          <TokenGen /> {/* Genera Access y Refresh Tokens */}
          <RefreshToken /> {/* Renueva el Access Token automáticamente */}
          <DeviceLocation heartbeat={10} />
        </QRProvider>
      </LocationProvider>
    </UserProvider>
  );
}

export default App;

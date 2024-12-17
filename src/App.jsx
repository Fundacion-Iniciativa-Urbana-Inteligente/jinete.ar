import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Menu from "./Components/Menu";
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";
import Helpme from "./Pages/Helpme";
import Footer from "./Components/Footer";
import { LocationProvider } from "./Context/LocationContext"; // Contexto de localización
import TokenGen from "./Components/TokenGen";
import RefreshToken from "./Components/RefreshToken";
import DeviceLocation from "./Components/DeviceLocation";
import Mapa from "./Components/Mapa";

function App() {
  return (
      <LocationProvider> {/* Contexto de localización */}
        <Router>
          {/* Componentes de navegación */}
          <Menu />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/helpme" element={<Helpme />} />
            <Route path="/map" element={<Mapa />} /> {/* Mapa como una ruta */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Footer siempre visible */}
          <Footer />
        </Router>
        
        {/* Componentes globales */}
        <TokenGen /> {/* Genera Access y Refresh Tokens */}
        <RefreshToken /> {/* Renueva el Access Token automáticamente */}
        <DeviceLocation heartbeat={10} /> {/* Seguimiento de ubicación */}
      </LocationProvider>
  );
}

export default App;

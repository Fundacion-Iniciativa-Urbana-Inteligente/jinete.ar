import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Menu from "./Components/Menu";
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";
import Helpme from "./Pages/Helpme";
import Footer from "./Components/Footer";
import { LocationProvider } from "./Context/LocationContext";
import TokenGen from "./Components/TokenGen";
import RefreshToken from "./Components/RefreshToken";
import DeviceLocation from "./Components/DeviceLocation";
import Mapa from "./Components/Mapa";
import Payment from "./Components/Payment";
import Success from "./Components/Success";
import Failure from "./Components/Failure";
import Pending from "./Components/Pending";


// Componente para renderizar el Footer condicionalmente
const FooterWrapper = () => {
  const location = useLocation();
  const showFooter = location.pathname !== "/" && location.pathname !== "/map";
  
  return showFooter ? <Footer /> : null;
};

function App() {
  return (
    <LocationProvider>
      <Router>
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/helpme" element={<Helpme />} />
          <Route path="/map" element={<Mapa />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/failure" element={<Failure />} />
          <Route path="/pending" element={<Pending />} />
          </Routes>
        <FooterWrapper />
        
        {/* Componentes globales */}
        <TokenGen />
        <RefreshToken />
        <DeviceLocation heartbeat={10} />
      </Router>
    </LocationProvider>
  );
}

export default App;

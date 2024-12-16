import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Menu from "./Components/Menu";
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";
import Helpme from "./Pages/Helpme";
import LogIn from "./Components/LogIn";
import SignUp from "./Components/SignUp";
import Verify from "./Components/Verify"; // Nueva página de verificación
import Footer from "./Components/Footer";
import { UserProvider } from "./Context/UserContext"; // Contexto de usuario
import { LocationProvider } from "./Context/LocationContext"; // Contexto de localización
import TokenGen from "./Components/TokenGen";
import RefreshToken from "./Components/RefreshToken";
import DeviceLocation from "./Components/DeviceLocation";
import Mapa from "./Components/Mapa";
function App() {
  return /*#__PURE__*/React.createElement(UserProvider, null, " ", /*#__PURE__*/React.createElement(LocationProvider, null, " ", /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement(Menu, null), /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(Home, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/helpme",
    element: /*#__PURE__*/React.createElement(Helpme, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/login",
    element: /*#__PURE__*/React.createElement(LogIn, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signup",
    element: /*#__PURE__*/React.createElement(SignUp, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/verify/:userId",
    element: /*#__PURE__*/React.createElement(Verify, null)
  }), " ", /*#__PURE__*/React.createElement(Route, {
    path: "/map",
    element: /*#__PURE__*/React.createElement(Mapa, null)
  }), " ", /*#__PURE__*/React.createElement(Route, {
    path: "*",
    element: /*#__PURE__*/React.createElement(NotFound, null)
  })), /*#__PURE__*/React.createElement(Footer, null)), /*#__PURE__*/React.createElement(TokenGen, null), " ", /*#__PURE__*/React.createElement(RefreshToken, null), " ", /*#__PURE__*/React.createElement(DeviceLocation, {
    heartbeat: 10
  })));
}
export default App;
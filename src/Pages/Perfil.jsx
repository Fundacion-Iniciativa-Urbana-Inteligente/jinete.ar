import { useParams } from "react-router-dom";
import VehiculoEnPerfil from "../Components/VehiculoEnPerfil";
import ApiIntegration from "../Components/ApiIntegration";

export default function Perfil(){
    return(
        <>
        <div className="profile-banner"></div>
        <div className="container">
            <div className="profile">
                <h2>Saldo:</h2>
                <h1 id="saldo">$2905.94</h1>
                <button className="btn btn-outline-success">Comprar Saldo</button>
                <hr />
                <VehiculoEnPerfil/>
                {/*Acá podrían ir los movimientos*/}
                <ApiIntegration/>
            </div>
        </div>
        </>
    )
}
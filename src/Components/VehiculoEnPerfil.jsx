export default function VehiculoEnPerfil(){
    return(
       <>
       <div className="row">
                    <h3>Mis vehículos</h3>
        </div>
        <div className="row">
                    <div className="col-8">
                        <select className="form-select">
                            <option disabled>Seleccionar</option>
                            <option valuename="AA123AA">AA123AA</option>
                        </select>

                    </div>
                    <div className="col-4">
                        <button className="btn btn-primary">Agregar</button>
                        </div>
            </div>
            <button className="btn btn-success">
                    Iniciar Estacionamiento
            </button>
       </>
    )
}
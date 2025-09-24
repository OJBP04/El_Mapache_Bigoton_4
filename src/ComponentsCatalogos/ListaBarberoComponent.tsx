import {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import BarberoService from "../Services/BarberoService.tsx";

interface Barbero{
    idBarbero: number;
    nombre: string;
}

export default function ListaBarberoComponent(){
    const [barberos, setBarberos] = useState<Barbero[]>([]);

    useEffect(()=>{
        BarberoService.findAll().then(response => {
            setBarberos(response.data);
        }).catch(error => {
            console.log(error);
        })
    }, []);

    return(
        <div className="card">
            <DataTable value={barberos} tableStyle={{minWidth: '50rem'}}>
                <Column field="idBarbero" header="ID" ></Column>
                <Column field="nombre" header="Nombre" ></Column>
            </DataTable>
        </div>
    )
}
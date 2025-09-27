import axios from 'axios';
const URL_BASE = "http://localhost:8080/citas";

class CitaService {
    findAll(){
        return axios.get(URL_BASE);
    }
    findById(idCita : number){
        return axios.get(URL_BASE +'/'+ idCita);
    }

    create(cita: object){
        return axios.post(URL_BASE, cita);
    }
    update(idCita: number, cita: object){
        return axios.put(URL_BASE + '/' + idCita, cita);
    }
    delete(idCita: number){
        return axios.delete(URL_BASE + '/' + idCita);
    }

}
export default new CitaService();


import axios from 'axios';
const URL_BASE = "http://localhost:8080/servicios";

class ServicioService {
    findAll(){
        return axios.get(URL_BASE);
    }
    findById(idServicio : number){
        return axios.get(URL_BASE +'/'+ idServicio);
    }

    create(servicio: object){
        return axios.post(URL_BASE, servicio);
    }
    update(idServicio: number, servicio: object){
        return axios.put(URL_BASE + '/' + idServicio, servicio);
    }
    delete(idServicio: number){
        return axios.delete(URL_BASE + '/' + idServicio);
    }

}
export default new ServicioService();
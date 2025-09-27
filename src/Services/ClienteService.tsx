import axios from 'axios';
const URL_BASE = "http://localhost:8080/clientes";

class ClienteService {
    findAll(){
        return axios.get(URL_BASE);
    }
    findById(idCliente : number){
        return axios.get(URL_BASE +'/'+ idCliente);
    }

    create(cliente: object){
        return axios.post(URL_BASE, cliente);
    }
    update(idCliente: number, cliente: object){
        return axios.put(URL_BASE + '/' + idCliente, cliente);
    }
    delete(idCliente: number){
        return axios.delete(URL_BASE + '/' + idCliente);
    }

}
export default new ClienteService();


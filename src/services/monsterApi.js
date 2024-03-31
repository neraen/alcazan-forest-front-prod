import axios from 'axios';
import {API_URL} from "../config";

function create(monstre){
    return axios.post(API_URL + "monstre/create", {monstre: monstre}).then(response => response.data)
}

function getAllMonsters() {
    return axios.post(API_URL + "monstres", {}).then(response => response.data);
}



export default {
    create,
    getAllMonsters
}
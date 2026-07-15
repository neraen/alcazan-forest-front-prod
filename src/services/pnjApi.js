import axios from 'axios';
import {API_URL} from "../config";

/* L'interaction joueur ↔ PNJ vit dans questApi (POST pnj/interaction).
   Ici ne reste que l'administration des PNJ (PnjMaker). */

function create(pnj){
    return axios.post(API_URL + "pnj/create", {pnj: pnj}).then(response => response.data)
}

export default {
    create
}

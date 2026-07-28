import axios from 'axios';
import {API_URL} from "../config";

/**
 * Métiers du joueur : progression, apprentissage, oubli.
 *
 * Le client n'envoie QUE l'id du métier. Le plafond par famille (2 récolte, 3
 * fabrication), l'existence du métier et le fait qu'il soit déjà appris sont revérifiés
 * par le serveur — ce que renvoie la vue d'un maître n'autorise rien.
 */
function progression(){
    return axios.post(API_URL + "metier/progression", {})
        .then(response => response.data)
}

function apprendre(metierId){
    return axios.post(API_URL + "metier/apprendre", {metierId})
        .then(response => response.data)
}

/** ⚠️ Irréversible : la progression du métier est perdue. Confirmer avant d'appeler. */
function oublier(metierId){
    return axios.post(API_URL + "metier/oublier", {metierId})
        .then(response => response.data)
}

const MetierApi = {progression, apprendre, oublier};

export default MetierApi;

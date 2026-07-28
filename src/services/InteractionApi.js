import axios from 'axios';
import {API_URL} from "../config";

/**
 * Cases interactives : ressources à récolter, coffres, leviers, mécanismes.
 *
 * Le client n'envoie QUE l'id de la case : le serveur revérifie la proximité, les
 * conditions (métier, niveau, quête…), les points d'action et le rechargement.
 */
/**
 * `mode` ("ethique" | "intensive") n'est envoyé que sur les cases qui proposent le choix ;
 * ailleurs le serveur le refuse. Absent = comportement historique.
 */
function executer(carteCarreauId, mode = null){
    return axios.post(API_URL + "interaction/executer", mode ? {carteCarreauId, mode} : {carteCarreauId})
        .then(response => response.data)
}

const InteractionApi = {executer};

export default InteractionApi;

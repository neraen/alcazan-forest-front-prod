import axios from 'axios';
import {API_URL} from "../config";

/**
 * Atelier : recettes accessibles, file de fabrication, retrait.
 *
 * Le client n'envoie que des identifiants et un mode. Métier, niveau, ingrédients
 * disponibles, plafond de commandes et fin de production sont tous arbitrés par le
 * serveur — ce que renvoie `atelier()` n'autorise rien.
 */
function atelier(){
    return axios.post(API_URL + "craft/atelier", {})
        .then(response => response.data)
}

function commandes(){
    return axios.post(API_URL + "craft/commandes", {})
        .then(response => response.data)
}

function lancer(recetteId, mode){
    return axios.post(API_URL + "craft/lancer", {recetteId, mode})
        .then(response => response.data)
}

function retirer(commandeId){
    return axios.post(API_URL + "craft/retirer", {commandeId})
        .then(response => response.data)
}

/** ⚠️ Rend les ingrédients mais perd le temps écoulé. Confirmer avant d'appeler. */
function annuler(commandeId){
    return axios.post(API_URL + "craft/annuler", {commandeId})
        .then(response => response.data)
}

const CraftApi = {atelier, commandes, lancer, retirer, annuler};

export default CraftApi;

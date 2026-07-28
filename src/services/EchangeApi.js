import axios from 'axios';
import {API_URL} from "../config";

/**
 * API du système d'échange joueur-à-joueur. Toutes les mutations portent `expectedVersion` :
 * le serveur répond 409 avec l'état frais si l'autre joueur a agi entre-temps — le composant
 * remplace alors son état local (voir EchangeHost). Le client ne décide jamais rien :
 * quantités, or et confirmations sont revalidés côté serveur.
 */

function current(){
    return axios.post(API_URL + "echange/current", {})
        .then(response => response.data)
}

function create(cibleId){
    return axios.post(API_URL + "echange/create", {cibleId})
        .then(response => response.data)
}

function accept(echangeId){
    return axios.post(API_URL + "echange/accept", {echangeId})
        .then(response => response.data)
}

function decline(echangeId){
    return axios.post(API_URL + "echange/decline", {echangeId})
        .then(response => response.data)
}

function addItem(type, itemId, quantite, expectedVersion){
    return axios.post(API_URL + "echange/item/add", {type, itemId, quantite, expectedVersion})
        .then(response => response.data)
}

function removeItem(ligneId, expectedVersion){
    return axios.post(API_URL + "echange/item/remove", {ligneId, expectedVersion})
        .then(response => response.data)
}

function updateOr(montant, expectedVersion){
    return axios.post(API_URL + "echange/or", {montant, expectedVersion})
        .then(response => response.data)
}

function confirm(expectedVersion){
    return axios.post(API_URL + "echange/confirm", {expectedVersion})
        .then(response => response.data)
}

function cancel(){
    return axios.post(API_URL + "echange/cancel", {})
        .then(response => response.data)
}

/** JWT d'abonnement Mercure du joueur courant (topics user/{id} + échange actif). */
function mercureToken(){
    return axios.post(API_URL + "mercure/token", {})
        .then(response => response.data)
}

export default {
    current,
    create,
    accept,
    decline,
    addItem,
    removeItem,
    updateOr,
    confirm,
    cancel,
    mercureToken,
}

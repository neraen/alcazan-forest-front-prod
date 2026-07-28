import axios from 'axios';
import {API_URL} from "../config";

/**
 * Donjons : composition du groupe éphémère devant la porte, puis lancement.
 *
 * L'entrée EN SOLO n'est pas ici : elle passe par le franchissement de wrap habituel
 * (UsersApi.changeMap), qui crée l'instance côté serveur.
 */

/** Ce qu'on voit en cliquant sur une porte : donjon, verrou du jour, groupes ouverts. */
function porte(carteCarreauId){
    return axios.post(API_URL + "donjon/porte", {carteCarreauId})
        .then(response => response.data)
}

function creerGroupe(carteCarreauId){
    return axios.post(API_URL + "donjon/groupe/creer", {carteCarreauId})
        .then(response => response.data)
}

function rejoindreGroupe(groupeId){
    return axios.post(API_URL + "donjon/groupe/rejoindre", {groupeId})
        .then(response => response.data)
}

function quitterGroupe(){
    return axios.post(API_URL + "donjon/groupe/quitter", {})
        .then(response => response.data)
}

function lancerGroupe(){
    return axios.post(API_URL + "donjon/groupe/lancer", {})
        .then(response => response.data)
}

function groupeCourant(){
    return axios.post(API_URL + "donjon/groupe/courant", {})
        .then(response => response.data)
}

/**
 * État de combat de l'instance : vie du boss, phase, menaces, zones annoncées, renforts.
 *
 * ATTENTION : cet appel JOUE LE TICK côté serveur (zones échues, mécaniques de la phase).
 * Le tick étant paresseux — pas de tâche planifiée —, c'est le sondage du front qui fait
 * avancer la rencontre. Ne pas le retirer en croyant optimiser.
 */
function combat(){
    return axios.post(API_URL + "donjon/combat", {})
        .then(response => response.data)
}

function attaquerRenfort(renfortId, spellId){
    return axios.post(API_URL + "donjon/renfort/attaquer", {renfortId, spellId})
        .then(response => response.data)
}

const DonjonApi = {
    porte,
    creerGroupe,
    rejoindreGroupe,
    quitterGroupe,
    lancerGroupe,
    groupeCourant,
    combat,
    attaquerRenfort
};

export default DonjonApi;

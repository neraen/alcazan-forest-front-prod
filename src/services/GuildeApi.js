import axios from 'axios';
import {API_URL} from "../config";

/**
 * Guildes : consultation et transitions.
 *
 * Chaque transition renvoie l'ÉTAT FRAIS et complet — le front n'a donc jamais à recharger
 * derrière une action ni à deviner le nouvel état. Même patron que l'échange, dont la réponse
 * est toujours le payload normalisé du serveur.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "guilde/" + chemin, payload).then(response => response.data);

const GuildeApi = {
    /** @returns {Promise<{appartenance, guilde, membres, candidatures, config, grades}>} */
    etat: () => post("etat"),

    /** Les guildes du même alignement — les seules rejoignables. */
    annuaire: () => post("annuaire"),

    creer: (nom, description) => post("creer", {nom, description}),
    candidater: (guildeId) => post("candidater", {guildeId}),
    accepter: (userId) => post("accepter", {userId}),
    refuser: (userId) => post("refuser", {userId}),
    promouvoir: (userId, grade) => post("promouvoir", {userId, grade}),
    transmettre: (userId) => post("transmettre", {userId}),
    exclure: (userId) => post("exclure", {userId}),
    quitter: () => post("quitter"),
    dissoudre: () => post("dissoudre"),
};

export default GuildeApi;

import axios from 'axios';
import {API_URL} from "../config";

/**
 * Classements publics : accessibles à tout joueur connecté, pas réservés à l'administration.
 *
 * Les catégories voyagent AVEC la liste : l'écran a besoin des deux au premier rendu, et les
 * séparer coûterait un aller-retour pour rien. Aucun libellé n'est en dur côté client.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "classement/" + chemin, payload).then(response => response.data);

const ClassementApi = {
    /**
     * @param {string} [categorie] valeur d'une catégorie servie par le serveur ;
     *        omise, le serveur renvoie la première.
     * @returns {Promise<{categories: Array, categorie: string, classement: Array, taille: number}>}
     */
    liste: (categorie) => post("liste", categorie ? {categorie} : {}),

    /**
     * Le rang du joueur courant dans toutes les catégories — y compris hors du top.
     *
     * @returns {Promise<{rangs: Array, horsClassement: boolean}>} `rang` vaut null pour un
     *          compte exclu des classements.
     */
    moi: () => post("moi"),
};

export default ClassementApi;

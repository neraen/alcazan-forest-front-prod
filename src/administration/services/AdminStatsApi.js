import axios from 'axios';
import {API_URL} from "../../config";

/**
 * Endpoints d'OBSERVATION de l'administration : journal d'événements et référentiels.
 *
 * Tout le préfixe /api/admin/ est réservé ROLE_ADMIN côté serveur (lectures comprises).
 * Aucune écriture ici : ces écrans regardent le jeu, ils ne le modifient pas.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "admin/stats/" + chemin, payload).then(response => response.data);

const AdminStatsApi = {
    /**
     * Une page du journal.
     *
     * @param {{userId?: number, types?: string[], categorie?: string,
     *          depuis?: string, jusqua?: string, page?: number, parPage?: number}} filtre
     */
    journal: (filtre = {}) => post("journal", filtre),

    /** Types d'événements, catégories et joueurs — le front n'en connaît aucun en dur. */
    referentiels: () => post("referentiels"),

    /** Vue d'ensemble : activité, masse monétaire, objets et vendeurs en tête. */
    tableauDeBord: () => post("tableau-de-bord"),

    /** La liste des comptes, pour le rail de l'écran « Joueurs ». */
    joueurs: () => post("joueurs"),

    /** Fiche d'enquête : identité, cumuls, et ce que le joueur a fait ET subi. */
    joueur: (userId) => post("joueur", {userId}),
};

export default AdminStatsApi;

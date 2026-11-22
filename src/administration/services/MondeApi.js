import axios from 'axios';
import {API_URL} from "../../config";

/**
 * Atlas du monde (`/api/admin/monde/*`, ROLE_ADMIN).
 *
 * Le serveur DÉDUIT la géographie des passages (wraps) à chaque appel : rien n'est stocké,
 * l'atlas ne peut donc pas diverger de ce que vit le joueur.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "admin/monde/" + chemin, payload).then(response => response.data);

const MondeApi = {
    atlas: () => post("atlas"),
    /** Crée une carte vierge collée à `carteId` côté `direction`, reliée par deux passages. */
    prolonger: (carteId, direction, nom) => post("prolonger", {carteId, direction, nom}),
};

export default MondeApi;

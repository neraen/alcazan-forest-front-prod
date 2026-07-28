import axios from 'axios';
import {API_URL} from "../../config";

/**
 * API de l'InteractionMaker (préfixe /api/interaction/editor, réservé ROLE_ADMIN).
 * save() fait création ET mise à jour : id absent/null = création. La réponse de save
 * est l'interaction rechargée (ids définitifs) au même format que get.
 */

function list() {
    return axios.post(`${API_URL}interaction/editor/list`, {}).then(response => response.data);
}

function get(interactionId) {
    return axios.post(`${API_URL}interaction/editor/get`, {interactionId}).then(response => response.data);
}

/** Métiers, objets, classes, quêtes… en un seul appel. */
function referentiels() {
    return axios.post(`${API_URL}interaction/editor/referentiels`, {}).then(response => response.data);
}

/** Types, portées de recharge et conditions : quels champs afficher pour quoi. */
function config() {
    return axios.post(`${API_URL}interaction/editor/config`, {}).then(response => response.data);
}

function save(interaction) {
    return axios.post(`${API_URL}interaction/editor/save`, interaction).then(response => response.data);
}

function remove(interactionId) {
    return axios.post(`${API_URL}interaction/editor/delete`, {interactionId}).then(response => response.data);
}

const InteractionMakerApi = {list, get, referentiels, config, save, remove};

export default InteractionMakerApi;

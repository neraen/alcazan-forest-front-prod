import axios from 'axios';
import {API_URL} from "../../config";

/**
 * API du QuestMaker (préfixe /api/quest/editor, réservé ROLE_ADMIN).
 * save() fait création ET mise à jour : id absent/0 = création. La réponse
 * de save est la quête rechargée (ids définitifs) au même format que get.
 */

function list() {
    return axios.post(`${API_URL}quest/editor/list`, {}).then(response => response.data);
}

function get(questId) {
    return axios.post(`${API_URL}quest/editor/get`, {questId: questId}).then(response => response.data);
}

/** Tous les catalogues (objets, PNJ, boss, cartes…) en un seul appel. */
function referentiels() {
    return axios.post(`${API_URL}quest/editor/referentiels`, {}).then(response => response.data);
}

/** Config des types d'action : quels champs afficher pour quel type. */
function config() {
    return axios.post(`${API_URL}quest/editor/config`, {}).then(response => response.data);
}

function save(quest) {
    return axios.post(`${API_URL}quest/editor/save`, quest).then(response => response.data);
}

function remove(questId) {
    return axios.post(`${API_URL}quest/editor/delete`, {questId: questId}).then(response => response.data);
}

export default {
    list,
    get,
    referentiels,
    config,
    save,
    remove
}

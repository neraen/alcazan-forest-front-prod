import axios from 'axios';
import {API_URL} from "../../config";

/**
 * API du DonjonMaker (préfixe /api/donjon/editor, réservé ROLE_ADMIN).
 * save() fait création ET mise à jour : id absent/null = création. La réponse de save
 * est le donjon rechargé (ids définitifs) au même format que get.
 */

function list() {
    return axios.post(`${API_URL}donjon/editor/list`, {}).then(response => response.data);
}

function get(donjonId) {
    return axios.post(`${API_URL}donjon/editor/get`, {donjonId}).then(response => response.data);
}

/** Cartes, monstres et types de salle en un seul appel. */
function referentiels() {
    return axios.post(`${API_URL}donjon/editor/referentiels`, {}).then(response => response.data);
}

/** Config des mécaniques : quels champs afficher pour quel type. */
function config() {
    return axios.post(`${API_URL}donjon/editor/config`, {}).then(response => response.data);
}

function save(donjon) {
    return axios.post(`${API_URL}donjon/editor/save`, donjon).then(response => response.data);
}

function remove(donjonId) {
    return axios.post(`${API_URL}donjon/editor/delete`, {donjonId}).then(response => response.data);
}

const DonjonMakerApi = {list, get, referentiels, config, save, remove};

export default DonjonMakerApi;

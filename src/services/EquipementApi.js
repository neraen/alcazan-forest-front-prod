import axios from 'axios';
import {API_URL} from "../config";

function create(equipement){
    return axios.post(API_URL + "equipement/create", {equipement: equipement}).then(response => response.data)
}

/**
 * Envoie l'image d'un équipement : le back la renomme d'après `name` et la range dans le
 * dossier de `positionEquipement`. Renvoie le nom de fichier à stocker dans `icone`.
 */
function uploadIcone(file, {name, positionEquipement, currentIcone}){
    const formData = new FormData();
    formData.append("icone", file);
    formData.append("name", name);
    formData.append("positionEquipement", positionEquipement);
    formData.append("currentIcone", currentIcone || "");

    return axios.post(API_URL + "equipement/upload-icone", formData).then(response => response.data.icone);
}

/**
 * Import en masse depuis un CSV. Renvoie le rapport du back
 * ({crees, misAJour, ignores, colonnesIgnorees, lignes[]}) : c'est lui qui dit quelles lignes
 * sont passées, pas un simple booléen.
 */
function importCsv(file, {mettreAJour = true} = {}){
    const formData = new FormData();
    formData.append("csv", file);
    formData.append("mettreAJour", mettreAJour ? "1" : "0");

    return axios.post(API_URL + "equipement/import-csv", formData).then(response => response.data);
}

function fetchFormElements(){
    return axios.post(API_URL + "equipement/formelements", {}).then(response => response.data)
}

function getAllEquipements() {
    return axios.post(API_URL + "equipements", {}).then(response => response.data.equipements);
}

function getAllEquipementsGrouped() {
    return axios.post(API_URL + "equipements/grouped", {}).then(response => response.data);
}

function getAllEquipementsInfo() {
    return axios.post(API_URL + "equipements/info", {}).then(response => response.data);
}

export default {
    create,
    uploadIcone,
    importCsv,
    fetchFormElements,
    getAllEquipements,
    getAllEquipementsGrouped,
    getAllEquipementsInfo
}
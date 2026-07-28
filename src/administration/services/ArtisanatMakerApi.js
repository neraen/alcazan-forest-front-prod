import axios from 'axios';
import {API_URL} from "../../config";

/**
 * ArtisanatMaker : métiers, ressources et recettes.
 *
 * Tout le préfixe /api/artisanat/editor est réservé ROLE_ADMIN côté serveur (lectures
 * comprises) ; les routes joueur /api/craft/* et /api/metier/* restent ouvertes.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "artisanat/editor/" + chemin, payload).then(response => response.data);

const ArtisanatMakerApi = {
    list: () => post("list"),
    referentiels: () => post("referentiels"),
    config: () => post("config"),

    getMetier: (id) => post("metier/get", {id}),
    saveMetier: (metier) => post("metier/save", metier),
    deleteMetier: (id) => post("metier/delete", {id}),

    saveRessource: (ressource) => post("ressource/save", ressource),

    getRecette: (id) => post("recette/get", {id}),
    saveRecette: (payload) => post("recette/save", payload),
    deleteRecette: (id) => post("recette/delete", {id}),
};

export default ArtisanatMakerApi;

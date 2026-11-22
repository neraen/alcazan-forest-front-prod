import axios from 'axios';
import {API_URL} from "../../config";

/**
 * Item Maker (`/api/admin/items/*`, ROLE_ADMIN).
 *
 * Chaque écriture renvoie `{cle, catalogue}` : le catalogue est recalculé côté serveur (sources
 * et usages compris), l'écran n'a donc jamais à recoudre lui-même les liens.
 */
const post = (chemin, payload = {}) =>
    axios.post(API_URL + "admin/items/" + chemin, payload).then(response => response.data);

const ItemMakerApi = {
    catalogue: () => post("catalogue"),
    enregistrerObjet: (objet) => post("objet/save", objet),
    enregistrerConsommable: (consommable) => post("consommable/save", consommable),
    /** `{buffId, catalogue}` — le bonus est partagé : toutes les potions qui le citent changent. */
    enregistrerBuff: (buff) => post("buff/save", buff),
    enregistrerButins: (objetId, butins) => post("objet/butins", {objetId, butins}),
};

export default ItemMakerApi;

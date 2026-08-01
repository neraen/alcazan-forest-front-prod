import axios from 'axios';
import {API_URL} from "../config";

/**
 * Hôtel des ventes : marché asynchrone entre joueurs.
 *
 * Le client n'envoie que des identifiants, une quantité et un prix. Les frais de dépôt, la
 * disponibilité d'un lot et le montant réellement débité sont arbitrés par le serveur — ce que
 * renvoie `catalogue()` n'autorise rien, et `curseurs` ne sert qu'à afficher.
 *
 * `acheter` peut répondre 409 (`code: "hotel_vente_indisponible"`) quand le lot vient de partir
 * ou que son prix a changé : la réponse porte alors l'annonce fraîche, à adopter telle quelle.
 */
function catalogue({type = null, recherche = "", tri = null, page = 1} = {}){
    return axios.post(API_URL + "hotel/catalogue", {type, recherche, tri, page})
        .then(response => response.data)
}

function mesVentes(){
    return axios.post(API_URL + "hotel/mes-ventes", {})
        .then(response => response.data)
}

/** Prélève les frais de dépôt et sort l'objet du sac, en une fois. */
function vendre(type, itemId, quantite, prix){
    return axios.post(API_URL + "hotel/vendre", {type, itemId, quantite, prix})
        .then(response => response.data)
}

/** `prixAttendu` = le prix affiché à l'écran ; un écart vaut 409 plutôt qu'un achat surprise. */
function acheter(annonceId, prixAttendu){
    return axios.post(API_URL + "hotel/acheter", {annonceId, prixAttendu})
        .then(response => response.data)
}

/** ⚠️ Rend l'objet mais les frais de dépôt restent perdus. Confirmer avant d'appeler. */
function retirer(annonceId){
    return axios.post(API_URL + "hotel/retirer", {annonceId})
        .then(response => response.data)
}

const HotelVenteApi = {catalogue, mesVentes, vendre, acheter, retirer};

export default HotelVenteApi;

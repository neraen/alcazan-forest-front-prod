import axios from 'axios';
import {API_URL} from "../config";

function takeConsommable(consommableId){
    return axios.post(API_URL + 'joueur/use/consommable', {consommableId: consommableId}).then(response => response.data)
}

function buyItem(itemId, pnjId){
    return axios.post(API_URL + 'joueur/buy/shop', {item: itemId, pnjId: pnjId}).then(response => response.data)
}

/** Vend un item du sac. `type` = equipement | consommable | objet ; le prix vient du serveur. */
function sellItem(type, itemId, quantite = 1){
    return axios.post(API_URL + 'joueur/sell/shop', {type: type, id: itemId, quantite: quantite})
        .then(response => response.data)
}

function joinGuilde(guildeId){
    return axios.post(API_URL + 'joueur/guilde/join', {guildeId: guildeId}).then(response => response.data)
}

function addFriend(userId){
    return axios.post(API_URL + 'joueur/add/friend', {userId: userId}).then(response => response.data)
}

function removeFriend(friendId){
    return axios.post(API_URL + 'joueur/remove/friend', {friendId: friendId}).then(response => response.data)
}

export default {
    buyItem,
    sellItem,
    takeConsommable,
    joinGuilde,
    addFriend,
    removeFriend
}

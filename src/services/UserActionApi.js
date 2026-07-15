import axios from 'axios';
import {API_URL} from "../config";

function takeConsommable(consommableId){
    return axios.post(API_URL + 'joueur/use/consommable', {consommableId: consommableId}).then(response => response.data)
}

function buyItem(itemId){
    return axios.post(API_URL + 'joueur/buy/shop', {item: itemId}).then(response => response.data)
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
    takeConsommable,
    joinGuilde,
    addFriend,
    removeFriend
}

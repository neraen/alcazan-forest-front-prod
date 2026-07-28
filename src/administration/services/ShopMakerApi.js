import axios from 'axios';
import {API_URL} from "../../config";

/** API admin du ShopMaker (préfixe /api/shop/editor, réservé ROLE_ADMIN). */

function list(){
    return axios.post(API_URL + "shop/editor/list", {}).then(response => response.data);
}

function referentiels(){
    return axios.post(API_URL + "shop/editor/referentiels", {}).then(response => response.data);
}

function get(shopId){
    return axios.post(API_URL + "shop/editor/get", {shopId}).then(response => response.data);
}

function save(shop){
    return axios.post(API_URL + "shop/editor/save", shop).then(response => response.data);
}

function remove(shopId){
    return axios.post(API_URL + "shop/editor/delete", {shopId}).then(response => response.data);
}

export default {list, referentiels, get, save, remove};

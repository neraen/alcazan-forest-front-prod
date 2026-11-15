import axios from 'axios';
import {API_URL} from "../config";

/**
 * API du système de quêtes refondu. Réponses structurées communes :
 * {status: "step"|"blocked"|"done"|"locked", quest, step, blockedMessages,
 *  feedback: {rewards, messages}, needRefresh} — aucun HTML, le front rend
 * step.dialogue.paragraphs et les messages en texte brut.
 */

/** Ouverture d'un PNJ : lecture pure, la réponse est discriminée par "view". */
function getInteraction(pnjId){
    return axios.post(API_URL + "pnj/interaction", {pnjId: pnjId}).then(response => response.data)
}

function startQuest(pnjId){
    return axios.post(API_URL + "quest/start", {pnjId: pnjId}).then(response => response.data)
}

/** L'unique endpoint d'action de quête, tous types confondus. */
function postAction(sequenceId, actionId){
    return axios.post(API_URL + "quest/action", {sequenceId: sequenceId, actionId: actionId}).then(response => response.data)
}

/** Action posée sur une case de la carte (effet scripté). */
function postMapAction(actionId){
    return axios.post(API_URL + "map/action", {actionId: actionId}).then(response => response.data)
}

/**
 * Journal de quêtes : {enCours, disponibles, terminees}. Lecture pure — l'étape, le PNJ à
 * aller voir, la progression des objectifs et l'aperçu des récompenses viennent tous du
 * serveur, qui fait foi (même calcul que le dialogue du PNJ).
 */
function getJournal(){
    return axios.post(API_URL + "quest/journal", {}).then(response => response.data)
}

export default {
    getInteraction,
    getJournal,
    startQuest,
    postAction,
    postMapAction
}

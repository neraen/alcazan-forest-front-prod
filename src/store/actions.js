import GameApi from "../services/GameApi";

export const UPDATE_PLAYER_TARGET = "update player target";
export const REMOVE_PLAYER_TARGET = "remove player target";
export const REQUEST_TARGET = "request target";
export const FETCH_TARGET_SUCCESS = "fetch target success";
export const FETCH_TARGET_ERROR = "fetch target error";
export const UPDATE_POSITION_JOUEUR = "update position joueur";
export const UPDATE_JOUEUR_STATE = "update joueur state";
export const OPEN_PNJ_INTERACTION = "open pnj interaction";
export const CLOSE_PNJ_INTERACTION = "close pnj interaction";
export const UPDATE_ECHANGE = "update echange";
export const CLOSE_ECHANGE = "close echange";
export const SET_ECHANGE_INVITATIONS = "set echange invitations";
export const OPEN_DONJON_PORTE = "open donjon porte";
export const CLOSE_DONJON_PORTE = "close donjon porte";
export const UPDATE_DONJON_COMBAT = "update donjon combat";

export const SET_CASES = "set cases";
export const UPDATE_DIFF_CASES = "update diff cases";
export const TOGGLE_COLLISION_CASE = "toggle Collision Cases";
export const UPDATE_MODE_MAP_MAKER = "update mode mapmaker";
export const ADD_WRAP_TOOL = "add wrap tool"
export const ADD_WRAP_CASE = "add wrap case"
export const ADD_PNJ_CASE = "add pnj case"
export const ADD_MONSTER_CASE = "add monster case"
export const ADD_INTERACTION_CASE = "add interaction case"


export const updatePlayerTarget = (payload) => {
    return{
        type: UPDATE_PLAYER_TARGET,
        payload
    }
}

export const removePlayerTarget = () => {
    return {
        type: REMOVE_PLAYER_TARGET,
    }
}

export const requestTarget = () => {
    return {
        type: REQUEST_TARGET
    }
}

export const fetchTargetSuccess = (target) => {
    return {
        type: FETCH_TARGET_SUCCESS,
        target
    }
}

export const fetchTargetError = (error) => {
    return {
        type: FETCH_TARGET_ERROR,
        error
    }
}

export const fetchTargetInfo = (target, type) => {
    return dispatch => {
        dispatch(requestTarget());
        return GameApi.getTargetInfos(target, type).then(
            response => {
                const target = response.data;
                dispatch(fetchTargetSuccess(target));
            },
            error => {
                dispatch(fetchTargetError(error));
            }
        )
    }
}

export const updatePositionJoueur = (coordonnees) => {
    return{
        type: UPDATE_POSITION_JOUEUR,
        coordonnees
    }
}

export const updateJoueurState = (joueurState) => {
    return{
        type: UPDATE_JOUEUR_STATE,
        joueurState
    }
}

/* L'interaction PNJ active (une seule à la fois) : la modale est rendue
   une seule fois par PnjInteractionHost, les tuiles Pnj ne font que dispatch. */
export const openPnjInteraction = ({pnjId, abscisse, ordonnee}) => {
    return{
        type: OPEN_PNJ_INTERACTION,
        pnjInteraction: {pnjId, abscisse, ordonnee}
    }
}

export const closePnjInteraction = () => {
    return{
        type: CLOSE_PNJ_INTERACTION
    }
}

/* La session d'échange active (une seule à la fois) : la modale est rendue une
   seule fois par EchangeHost ; l'état est TOUJOURS le payload normalisé du serveur
   (REST ou Mercure), jamais construit côté client. */
export const updateEchange = (etat) => {
    return{
        type: UPDATE_ECHANGE,
        etat
    }
}

export const closeEchange = () => {
    return{
        type: CLOSE_ECHANGE
    }
}

export const setEchangeInvitations = (invitations) => {
    return{
        type: SET_ECHANGE_INVITATIONS,
        invitations
    }
}

export const setCases = (cases) => {
    return{
        type: SET_CASES,
        cases
    }
}

export const updateDiffCases = (cases) => {
    return{
        type: UPDATE_DIFF_CASES,
        cases
    }
}

export const toggleCollisionCase = (index) => {
    return{
        type: TOGGLE_COLLISION_CASE,
        index
    }
}

export const addWrapCase = (index) => {
    return{
        type: ADD_WRAP_CASE,
        index
    }
}

export const addPnjCase = (index) => {
    return{
        type: ADD_PNJ_CASE,
        index
    }
}

export const addMonsterCase = (index) => {
    return{
        type: ADD_MONSTER_CASE,
        index
    }
}

/* MapMaker : pose (ou retire, avec interactionId à null) une interaction sur une case. */
export const addInteractionCase = (index) => {
    return{
        type: ADD_INTERACTION_CASE,
        index
    }
}

export const updateModeMapMaker = (mode) => {
    return{
        type: UPDATE_MODE_MAP_MAKER,
        mode
    }
}

export const addWrapTool= (wrap) => {
    return{
        type: ADD_WRAP_TOOL,
        wrap
    }
}

/* La porte de donjon ouverte (une seule à la fois) : la modale de groupe est rendue
   une seule fois par DonjonHost, la grille ne fait que dispatch la case cliquée
   ({carteCarreauId, targetMapId, targetWrap} — de quoi franchir la porte en solo). */
export const openDonjonPorte = (porte) => {
    return{
        type: OPEN_DONJON_PORTE,
        porte
    }
}

export const closeDonjonPorte = () => {
    return{
        type: CLOSE_DONJON_PORTE
    }
}

/* État de combat de l'instance (vie du boss, phase, menaces, zones annoncées, renforts).
   TOUJOURS le payload du serveur : c'est lui qui joue le tick, le front ne simule rien —
   en particulier il ne décompte pas les zones lui-même, il affiche resoudreAt. */
export const updateDonjonCombat = (combat) => {
    return{
        type: UPDATE_DONJON_COMBAT,
        combat
    }
}

import React from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../store/actions";
import questApi from "../../services/questApi";

/**
 * Action posée sur une case de la carte (carte_carreau.action) : l'effet
 * est exécuté côté serveur via POST /api/map/action (adjacence vérifiée).
 */
const ActionMap = (props) => {

    const handleAction = async () => {
        try {
            const response = await questApi.postMapAction(props.action.actionId);
            response.messages.forEach(message => toast.info(message));
            if(response.needRefresh){
                props.updateJoueurState({needRefresh: true});
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Une erreur est survenue.");
        }
    }

    return(
        <div className="action-map" onClick={handleAction}>""</div>
    )
}

export default connect(null, {updateJoueurState})(ActionMap)

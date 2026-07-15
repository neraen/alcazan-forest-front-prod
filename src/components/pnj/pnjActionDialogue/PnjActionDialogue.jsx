import React, {useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../store/actions";
import questApi from "../../../services/questApi";

/**
 * Dialogue d'un PNJ de type "action" (ex. aubergiste) : une séquence sans
 * quête, des boutons dont l'effet est exécuté côté serveur. Remplace
 * l'ancien ActionView qui postait sur une URL fournie par le back.
 */
const PnjActionDialogue = (props) => {

    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (actionId) => {
        setIsLoading(true);
        try {
            const response = await questApi.postAction(props.dialogue.sequenceId, actionId);
            response.feedback?.messages?.forEach(message => toast.info(message.text));
            if(response.needRefresh){
                props.updateJoueurState({needRefresh: true});
            }
            props.onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || "Une erreur est survenue.");
            setIsLoading(false);
        }
    }

    if(!props.dialogue){
        return <div className="quest-modal-body"><p><i>{props.pnj.description}</i></p></div>;
    }

    return (
        <div className="quest-modal-body">
            <div>
                {props.dialogue.dialogue.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {!isLoading && props.dialogue.actions.map(action =>
                    <div key={action.actionId}>
                        <button onClick={() => handleAction(action.actionId)} className="btn-action">
                            {action.label}
                        </button>
                        <br/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default connect(null, {updateJoueurState})(PnjActionDialogue);

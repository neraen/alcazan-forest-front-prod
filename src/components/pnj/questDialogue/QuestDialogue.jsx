import React, {useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../store/actions";
import questApi from "../../../services/questApi";

/**
 * Vue quête d'un PNJ, pilotée par le contrat structuré du back :
 * available (accepter) → step (dialogue + boutons) → blocked | step | done.
 * Aucun HTML injecté : les dialogues arrivent en paragraphes de texte brut.
 */
const QuestDialogue = (props) => {

    // props.quest = {id, name, status, lockedReasons?, step?} (vue interaction)
    const [status, setStatus] = useState(props.quest.status);
    const [step, setStep] = useState(props.quest.step || null);
    const [blockedMessages, setBlockedMessages] = useState(props.quest.lockedReasons || []);
    const [isLoading, setIsLoading] = useState(false);

    const applyResponse = (response) => {
        // Réponse commune de /quest/start et /quest/action :
        // {status, quest, step, blockedMessages, feedback, needRefresh}
        response.feedback?.rewards?.forEach(reward =>
            toast.success(`Vous recevez ${reward.quantity} ${reward.label}`)
        );
        response.feedback?.messages?.forEach(message => toast.info(message.text));

        if(response.needRefresh){
            props.updateJoueurState({needRefresh: true});
        }

        if(response.status === "blocked"){
            setBlockedMessages(response.blockedMessages);
            setStep(response.step);
            setStatus("inProgress");
            return;
        }

        setBlockedMessages([]);
        setStep(response.step);
        setStatus(response.status === "done" ? "done" : "inProgress");
    }

    const callApi = async (apiCall) => {
        setIsLoading(true);
        try {
            applyResponse(await apiCall());
        } catch (error) {
            toast.error(error.response?.data?.error || "Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleStart = () => callApi(() => questApi.startQuest(props.pnj.id));
    const handleAction = (actionId) => callApi(() => questApi.postAction(step.sequenceId, actionId));

    const renderDialogue = () => {
        if(status === "available"){
            return <p><i>{props.pnj.description}</i></p>;
        }
        if(status === "locked"){
            return props.quest.lockedReasons.map((reason, index) => <p key={index}><i>{reason}</i></p>);
        }
        if(status === "done" && (!step || step.dialogue.paragraphs.length === 0)){
            return <p><i>Vous avez déjà terminé cette quête.</i></p>;
        }

        return step && step.dialogue.paragraphs.map((paragraph, index) => <p key={index}><i>{paragraph}</i></p>);
    }

    const renderActions = () => {
        if(isLoading){
            return null;
        }
        switch (status){
            case "available":
                return (
                    <>
                        <button onClick={handleStart} className="quest-modal-btn-action">Accepter la quête</button>
                        <br/>
                        <button onClick={props.onClose} className="quest-modal-btn-action">S'en aller</button>
                    </>
                );
            case "inProgress":
                return step && step.actions.map(action =>
                    <div key={action.actionId}>
                        <button onClick={() => handleAction(action.actionId)} className="quest-modal-btn-action">
                            {action.label}
                        </button>
                        <br/>
                    </div>
                );
            case "locked":
            case "done":
            default:
                return <button onClick={props.onClose} className="quest-modal-btn-action">S'en aller</button>;
        }
    }

    return (
        <div className="quest-modal-body">
            <div className="quest-modal-dialog">
                <div className="quest-modal-avatar">
                    {props.pnj.avatar && <img src={"img/pnj/" + props.pnj.avatar} alt={props.pnj.name}/>}
                    <div className="quest-modal-pnj-name">{props.pnj.name}</div>
                </div>
                <div className="quest-modal-text">
                    {renderDialogue()}
                    {blockedMessages.length > 0 && status !== "locked" && blockedMessages.map((message, index) =>
                        <p key={index} className="quest-modal-blocked-message"><i>{message}</i></p>
                    )}
                </div>
            </div>
            <hr/>
            <div className="quest-modal-actions">
                {renderActions()}
            </div>
        </div>
    )
}

export default connect(null, {updateJoueurState})(QuestDialogue);

import React, {useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updateJoueurState} from "../../../store/actions";
import questApi from "../../../services/questApi";
import GameButton from "../../ui/gameButton/GameButton";
import PnjAvatar from "../PnjAvatar";
import styles from "../PnjDialogue.module.scss";

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
            const intro = props.quest.introduction || [];
            if(intro.length > 0){
                return intro.map((paragraph, index) => <p key={index}><i>{paragraph}</i></p>);
            }
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
                        <button type="button" onClick={handleStart} className={styles.primary}>Accepter la quête</button>
                        <GameButton onClick={props.onClose}>S'en aller</GameButton>
                    </>
                );
            case "inProgress":
                return step && step.actions.map(action =>
                    <button key={action.actionId} type="button" onClick={() => handleAction(action.actionId)}
                            className={styles.primary}>
                        {action.label}
                    </button>
                );
            case "locked":
            case "done":
            default:
                return <GameButton onClick={props.onClose}>S'en aller</GameButton>;
        }
    }

    return (
        <div className={styles.body}>
            <div className={styles.dialog}>
                <PnjAvatar pnj={props.pnj}/>
                <div className={styles.text}>
                    {renderDialogue()}
                    {blockedMessages.length > 0 && status !== "locked" && blockedMessages.map((message, index) =>
                        <p key={index} className={styles.blocked}><i>{message}</i></p>
                    )}
                </div>
            </div>
            <div className={styles.separator}/>
            <div className={styles.actions}>
                {renderActions()}
            </div>
        </div>
    )
}

export default connect(null, {updateJoueurState})(QuestDialogue);

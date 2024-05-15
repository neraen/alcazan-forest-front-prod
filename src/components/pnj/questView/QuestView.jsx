import React, {useCallback, useEffect, useState} from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import UserActionApi from "../../../services/UserActionApi";
import pnjApi from "../../../services/pnjApi";
import ReactHtmlParser from "react-html-parser";


const QuestView = (props) => {

    const [sequence, setSequence] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        console.log(props);
        fetchSequenceData();
    }, []);

    const fetchSequenceData = async () => {
        console.log(props.pnj)
        const sequenceData = await pnjApi.getSequence(props.pnj.id)
        setSequence(sequenceData);
    }

    const handleAction = async (link, params, actionId) => {
        setIsLoading(true)
        const newSequence = await UserActionApi.applyUserAction(link, params, actionId, sequence.sequenceId);
        if(newSequence.hasConditionalAction){
            props.toggleDialogPnj();
        }else{
            setSequence(newSequence);
        }
        setIsLoading(false)
        //toast(messageData.message);

    }

    return(
        <div className="quest-modal-body">
            <div className="quest-modal-dialog">
                <div className="quest-modal-avatar">
                    {props.pnj.avatar && <img src={"img/pnj/" + props.pnj.avatar} />}
                    <div className="quest-modal-pnj-name">
                        {props.pnj.name}
                    </div>
                </div>
                <div className="quest-modal-text">
                    { /* ReactHtmlParser(dialogueText) */}
                    <i>{!isLoading && sequence && sequence.respectSequenceConditions && ReactHtmlParser(sequence.dialogue)} </i>
                    <i>{!isLoading && sequence && !sequence.respectSequenceConditions && ReactHtmlParser(sequence.messages)} </i>
                </div>
            </div>
            <hr />

            <div className="quest-modal-actions">
                {sequence && sequence.respectSequenceConditions && sequence.actions.map(action =>
                    <>
                        <button
                            onClick={() => handleAction(action.actionApiLink, action.actionParams, action.actionId)}
                            className="quest-modal-btn-action">
                            {action.actionName}
                        </button>
                        <br/>
                    </>
                )}

                {sequence && !sequence.respectSequenceConditions && (
                    <>
                        <button
                            onClick={() => props.toggleDialogPnj()}
                            className="quest-modal-btn-action">
                            S'en aller
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(QuestView)
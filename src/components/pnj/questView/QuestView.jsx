import React, {useEffect, useState} from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import UserActionApi from "../../../services/UserActionApi";
import pnjApi from "../../../services/pnjApi";
import ReactHtmlParser from "react-html-parser";


const QuestView = (props) => {

    const [sequence, setSequence] = useState();

    useEffect(()=>{
        fetchSequenceData();
    }, []);

    const fetchSequenceData = async () => {
        const sequenceData = await pnjApi.getSequence(props.pnjId)
        setSequence(sequenceData);
    }

    const handleAction = async (link, params, actionId) => {
        const messageData = await UserActionApi.applyUserAction(link, params, actionId);
        //toast(messageData.message);
    }

    return(
        <div className="quest-modal-body">
                <div>
                    {sequence && <div>{ ReactHtmlParser(sequence.dialogue) }</div> } <br />
                    {sequence && sequence.actions.map(action => <><button onClick={() => handleAction(action.actionLink, action.actionParams, action.actionId)} className="btn-action">{action.actionName}</button><br/> </>)}
                </div>
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(QuestView)
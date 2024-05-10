import React, {useCallback, useEffect, useState} from "react"
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import UserActionApi from "../../../services/UserActionApi";
import pnjApi from "../../../services/pnjApi";
import ReactHtmlParser from "react-html-parser";


const QuestView = (props) => {

    const [sequence, setSequence] = useState();
    const [dialogueText, setDialogueText] = useState('');
    const [isTyping, setIsTyping] = useState(true);



    useEffect(()=>{
        fetchSequenceData();
    }, []);

    useEffect(()=>{
        if(sequence){
            listenKeyboard();
        }

    }, [sequence]);

    useEffect(() => {
        if (sequence) {
            let index = 0;
            const typingInterval = setInterval(() => {
                if (index < sequence.dialogue.length && isTyping) {
                    setDialogueText(prevText => prevText + sequence.dialogue[index]);
                    index++;
                } else {
                    setIsTyping(false);
                    clearInterval(typingInterval);
                }
            }, 30);

            return () => clearInterval(typingInterval);
        }
    }, [sequence, isTyping])

    const handleKeybord = useCallback((event) => {
        console.log(event.key);
        console.log(isTyping);
        if (isTyping) {
            setDialogueText(sequence.dialogue);
            setIsTyping(false);
        }
    }, [isTyping, sequence]);

    const listenKeyboard = () => {
        document.addEventListener("keypress", (event) => {
            console.log(sequence);
            handleKeybord(event)
        });
    };


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
                    {sequence && ReactHtmlParser(dialogueText) } <br />
                    {sequence && !isTyping && sequence.actions.map(action => <><button onClick={() => handleAction(action.actionLink, action.actionParams, action.actionId)} className="btn-action">{action.actionName}</button><br/> </>)}
                </div>
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
}, {updateJoueurState})(QuestView)
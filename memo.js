{/*{clicked && sequence !== [] &&*/}
{/*<Modal*/}
{/*    isShowing={isDialogShowed}*/}
{/*    hide={toggleDialogPnj}*/}
{/*    title={sequence && sequence[0].dialogTitle}*/}
{/*>*/}
{/*    <div>*/}
{/*        {sequence && sequence[0].dialogContent}*/}
{/*        {sequence && sequence.map(action => <><button onClick={() => handleAction(action.actionLink, action.actionParams)} className="btn-action">{action.actionName}</button><br/> </>)}*/}


{/*    </div>*/}
{/*</Modal>*/}
{/*}*/}


useEffect(()=>{
    if(sequence){
        listenKeyboard();
    }

}, [sequence]);

useEffect(() => {
    console.log(sequence)
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
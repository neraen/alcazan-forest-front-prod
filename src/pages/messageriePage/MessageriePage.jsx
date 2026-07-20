import React from "react";
import Contacts from "../../components/social/messagerie/Contacts";
import Messenger from "../../components/social/messagerie/Messenger";
import ModalShell from "../../components/ui/gameModal/ModalShell";
import styles from "./MessageriePage.module.scss";

class MessageriePage extends React.Component{

    render(){
        return (
            <div className={styles.page}>
                <div className={styles.frame}>
                    <ModalShell iconSrc="/img/icons/book.png" title="Messagerie"
                                subtitle="Boîte aux lettres du royaume">
                        <div className={styles.body}>
                            <Contacts />
                            <Messenger />
                        </div>
                    </ModalShell>
                </div>
            </div>
        )
    }
}

export default MessageriePage

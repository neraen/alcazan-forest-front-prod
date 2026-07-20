import React from 'react'
import styles from "./Messagerie.module.scss";

const Contacts = (props) => {
    return(
        <div className={styles.contacts}>
            <div className={styles.panelHead}>
                <span className={styles.panelBar}/>
                <span className={styles.panelTitle}>Contacts</span>
            </div>
            <p className={styles.placeholder}>Aucun contact pour le moment.</p>
        </div>
    )
}

export default Contacts

import React from 'react'
import {connect} from "react-redux";
import styles from "./UserStatsBlock.module.scss";

/**
 * Ressources Or / PA / PM, affichées en ligne à droite de la barre d'action.
 * Les classes po / pa / pm sont des hooks pour intro.js.
 */
const UserStatsBlock = (props) => {
    return (
        <div className={styles.resources}>
            <span className={`po ${styles.resource}`}>
                <img className={`${styles.icon} ${styles.iconRound}`} src="/img/gui/Money03.png" alt="Icone pièce d'or"/>
                <span className={styles.gold}>{props.joueurState.money} Or</span>
            </span>
            <span className={`pa ${styles.resource}`}>
                <img className={styles.icon} src="/img/gui/10.png" alt="Icone action"/>
                <span className={styles.pa}>{props.joueurState.pa} PA</span>
            </span>
            <span className={`pm ${styles.resource}`}>
                <img className={styles.icon} src="/img/gui/36.png" alt="Icone mouvement"/>
                <span className={styles.pm}>{props.joueurState.pm} PM</span>
            </span>
        </div>
    )
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, ownProperties}
})(UserStatsBlock)

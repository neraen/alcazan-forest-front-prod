import React from 'react'
import {connect} from "react-redux";
import {updateJoueurState} from "../../../store/actions";
import Loader from "../../loader/Loader";
import Panel from "../../ui/panel/Panel";
import GaugeBar from "../../ui/gaugeBar/GaugeBar";
import styles from "./UsernameBlock.module.scss";

/**
 * Fiche joueur de la page principale : zone actuelle, avatar + niveau,
 * pseudo + classe, barres Santé / Mana.
 * Les classes js-life-gauge / js-mana-gauge sont des hooks pour intro.js.
 */
const UsernameBlock = (props) => {
    return <>
        {(props.joueurState.level && props.joueurState.lifeJoueur) && (
            <Panel className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.zoneName}>{props.zoneName || "…"}</h1>
                    <span className={styles.zoneTag}>Zone</span>
                </div>
                <div className={styles.separator}/>

                <div className={styles.identity}>
                    <div className={styles.avatarWrap}>
                        <img className={styles.avatar} src="/img/gui/CharacterPlayer/Avatar.png"
                             alt={`Avatar de ${props.user.pseudo}`}/>
                        <span className={styles.levelBadge}>Niv. {props.joueurState.level}</span>
                    </div>
                    <div className={styles.names}>
                        <span className={styles.pseudo}>{props.user.pseudo}</span>
                        <span className={styles.classe}>{props.user.nomClasse}</span>
                    </div>
                </div>

                <div className={styles.gauges}>
                    <GaugeBar className="js-life-gauge" variant="hp" label="Santé"
                              value={props.joueurState.lifeJoueur} max={props.user.maxLife}/>
                    <GaugeBar className="js-mana-gauge" variant="mp" label="Mana"
                              value={props.user.currentMana} max={props.user.maxMana}/>
                </div>
            </Panel>
            ) || (<Loader maxWidth={200} maxHeight={200}/>)
        }
    </>
}

export default connect((state, ownProperties) =>{
    return {joueurState: state.data.joueurState, ownProperties}
}, {updateJoueurState})(UsernameBlock)

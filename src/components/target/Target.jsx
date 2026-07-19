import React, {Component} from 'react'
import {connect} from "react-redux";
import { fetchTargetInfo, removePlayerTarget } from "../../store/actions";
import {Link} from "react-router-dom";
import Panel from "../ui/panel/Panel";
import GaugeBar from "../ui/gaugeBar/GaugeBar";
import styles from "./Target.module.scss";

/**
 * Carte de ciblage (joueur / monstre / boss), affichée sous la fiche joueur.
 * Même langage visuel que la fiche joueur, accent danger pour l'ennemi.
 */
class Target extends Component{

    constructor(props){
        super(props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((prevProps.target.type !== this.props.target.type) || (prevProps.target.targetId !== this.props.target.targetId)) {
            if(this.props.target.type !== undefined){
                this.props.fetchTargetInfo(this.props.target.targetId, this.props.target.type);
            }else{
                this.props.removePlayerTarget();
            }
        }
    }

    // Normalise les trois types de cible pour un rendu unique.
    getDisplay() {
        const target = this.props.target;
        if (target.type === "player") {
            return {
                name: target.pseudo,
                sub: `Niveau ${target.niveau}`,
                img: "/img/gui/CharacterEnemy/AvatarEnemy.png",
                hp: {value: target.currentLife, max: target.maxLife},
                mana: {value: target.currentMana, max: target.maxMana},
                profilePseudo: target.pseudo,
            };
        }
        if (target.type === "monstre") {
            return {
                name: target.nomMonstre,
                sub: `x ${target.quantiteMonstre}`,
                img: `/img/monstre/${target.imageMonstre}.png`,
                hp: {value: target.monstreLife, max: target.monstreLifeMax},
            };
        }
        if (target.type === "boss") {
            return {
                name: target.bossName,
                sub: "Boss",
                img: `/img/boss/${target.bossSkin}.png`,
                hp: {value: target.bossLife, max: target.bossMaxLife},
            };
        }
        return null;
    }

    render() {
        const display = this.props.target.type ? this.getDisplay() : null;
        if (!display) return null;

        return (
            <Panel className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.tag}>Cible</span>
                    <button type="button" title="Décibler" className={styles.close}
                            onClick={this.props.removePlayerTarget}>✕</button>
                </div>
                <div className={styles.separator}/>

                <div className={styles.identity}>
                    <img className={styles.avatar} src={display.img} alt={display.name}/>
                    <div className={styles.names}>
                        <span className={styles.name}>{display.name}</span>
                        <span className={styles.sub}>{display.sub}</span>
                        {display.profilePseudo && (
                            <Link className={styles.profileLink} to={`/profil/${display.profilePseudo}`}>
                                Voir le profil
                            </Link>
                        )}
                    </div>
                </div>

                <div className={styles.gauges}>
                    <GaugeBar variant="hp" label="Santé" value={display.hp.value} max={display.hp.max}/>
                    {display.mana && (
                        <GaugeBar variant="mp" label="Mana" value={display.mana.value} max={display.mana.max}/>
                    )}
                </div>
            </Panel>
        );
    }
}

export default connect(state => {
    let target = state.data.target;
    return {target};
}, {fetchTargetInfo, removePlayerTarget})(Target);

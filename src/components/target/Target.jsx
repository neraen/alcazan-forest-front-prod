import React, {Component} from 'react'
import {connect} from "react-redux";
import { fetchTargetInfo, removePlayerTarget, updateJoueurState } from "../../store/actions";
import UsersApi from "../../services/UsersApi";
import {toast} from "react-toastify";
import {Link} from "react-router-dom";
import Panel from "../ui/panel/Panel";
import GaugeBar from "../ui/gaugeBar/GaugeBar";
import styles from "./Target.module.scss";

/**
 * Carte de ciblage (joueur / monstre / boss), affichée sous la fiche joueur.
 * Même langage visuel que la fiche joueur, accent danger pour l'ennemi.
 */
export class Target extends Component{

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

    voisin() {
        const {target, joueurState, positionJoueur} = this.props;
        if (target.type !== "player" || Number(target.targetId) === Number(joueurState.idJoueur)) return false;
        const voisin = (joueurState.joueursCarte || []).find(c => Number(c.userId) === Number(target.targetId));
        return voisin && !voisin.isWrap && Math.max(
            Math.abs(Number(voisin.abscisse) - Number(positionJoueur.abscisse)),
            Math.abs(Number(voisin.ordonnee) - Number(positionJoueur.ordonnee))
        ) === 1;
    }

    echangerPosition = async () => {
        if (this.echangeEnCours || this.props.joueurState.deplacementEnCours || !this.voisin()) return;
        this.echangeEnCours = true;
        this.props.updateJoueurState({deplacementEnCours: true});
        try {
            const {target, joueurState, positionJoueur} = this.props;
            const data = await UsersApi.echangerPosition(Number(target.targetId), Number(joueurState.mapId),
                Number(positionJoueur.abscisse), Number(positionJoueur.ordonnee));
            this.props.updateJoueurState(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Échange de position impossible.");
            this.props.updateJoueurState({needRefresh: true});
        } finally {
            this.echangeEnCours = false;
            this.props.updateJoueurState({deplacementEnCours: false});
        }
    };

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
        // Un monstre d'instance (donjon) se présente EXACTEMENT comme un monstre du monde
        // ouvert : /api/target/renfort renvoie les mêmes clés, la carte est mutualisée.
        if (target.type === "monstre" || target.type === "renfort") {
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
                    {this.voisin() && (
                        <button type="button" className={styles.swap}
                                title="Échanger les positions — 1 PM" aria-label="Échanger les positions — 1 PM"
                                disabled={this.props.joueurState.deplacementEnCours || this.props.joueurState.pm < 1}
                                onClick={this.echangerPosition}>⇄</button>
                    )}
                    {/* Un monstre ne se décible pas à la main : il n'est visible/ciblé
                        que tant qu'on est sur sa case, et se décible en la quittant. */}
                    {this.props.target.type !== "monstre" && this.props.target.type !== "renfort" && (
                        <button type="button" title="Décibler" className={styles.close}
                                onClick={this.props.removePlayerTarget}>✕</button>
                    )}
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
    return {target, joueurState: state.data.joueurState, positionJoueur: state.data.positionJoueur};
}, {fetchTargetInfo, removePlayerTarget, updateJoueurState})(Target);

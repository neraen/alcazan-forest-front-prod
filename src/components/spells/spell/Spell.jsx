import React, {useEffect, useState} from 'react'
import {toast} from "react-toastify";
import UsersApi from "../../../services/UsersApi";
import DonjonApi from "../../../services/DonjonApi";
import {connect} from "react-redux";
import {fetchTargetInfo, updateJoueurState, removePlayerTarget} from "../../../store/actions";
import distanceCalculator from "../../../services/distanceCalculator";
import target from "../../target/Target";
import Slot from "../../ui/slot/Slot";
import styles from "./Spell.module.scss";


const Spell = (props) => {

    const [passedTime, setPassedTime] = useState(100);
    const [time, setTime] = useState(0);
    const [disable, setDisable] = useState(false);


    useEffect(() => {

        if(props.target.type === "player"){
            const distance = distanceCalculator.computeDistance(props.target.abscisseTarget, props.target.ordonneeTarget, props.positionJoueur.abscisse, props.positionJoueur.ordonnee);
            console.log(props.spell.portee < distance && props.spell.portee !== 0)
            if(props.spell.portee < distance && props.spell.portee !== 0){
                setDisable(true);
            }else{
                setDisable(false);
            }
        }else{
            setDisable(false)
        }

        if(props.allDisabled){
            setDisable(true);
        }

        if(passedTime >= 100){
            if(!disable){
                document.querySelector(".spell-filter-" + props.spell.id).style.background = 'none';
            }else{
                document.querySelector(".spell-filter-" + props.spell.id).style.background = 'rgba(255,0,0,0.35)';
            }
        }else{
            document.querySelector(".spell-filter-" + props.spell.id).style.background = 'conic-gradient(rgba(0, 0, 0, 0.6) '+ passedTime +'% ,rgba(0, 0, 0, 0.1)  '+ passedTime +'%)';
        }
    })

    const SECOND_IN_MS = 1000;
    const UPDATE_INTERVAL = SECOND_IN_MS / 60;


    const activateSkill = () => {

        setPassedTime(100);
        let time = props.spell.cooldown * 1000  - UPDATE_INTERVAL;
        setTime(time);
        props.setAllSpellDisabled(true);
        // Update remaining cooldown
        const intervalID = setInterval(() => {
            // Pass remaining time in percentage to CSS
            setPassedTime(time / props.spell.cooldown / 1000 * 100);


            // Display time left
            //target.textContent = (time / SECOND_IN_MS).toFixed(2);

            time -= UPDATE_INTERVAL;
            setTime(time);
            // Stop timer when there is no time left
            if(time < 0) {
                //target.textContent = '';
                props.setAllSpellDisabled(false);
                setPassedTime(100);
                clearInterval(intervalID);
            }
        }, UPDATE_INTERVAL);
    }

    const handleAttack = async event => {
        if(!disable){
            if(props.spell.portee === 0){
                await launchAutoFocusedSpell();
            }
            else if(props.target.type === "player"){
                const distance = distanceCalculator.computeDistance(props.target.abscisseTarget, props.target.ordonneeTarget, props.positionJoueur.abscisse, props.positionJoueur.ordonnee);
                if(props.spell.portee < distance){
                    setDisable(true)
                }else{
                    if(passedTime >= 100){
                        setDisable(false)
                        activateSkill();
                        await launchAttack();
                    }
                }
            }else if(props.target.type === "monstre" || props.target.type === "boss" || props.target.type === "renfort"){
                // "renfort" = monstre d'instance (population de salle, add de boss). Sans
                // lui dans cette liste, la cible tombait dans le « pas de cible » du else
                // et le clic sur un sort ne faisait RIEN : monstre inattaquable.
                await launchAttack();
            }else{
                //toast("Vous n'avez pas de cible.")
            }
        }
    }

    const launchAutoFocusedSpell = async () => {
        let spellStats = {};
        spellStats = await UsersApi.applySpellAutoFocused(props.spell.id);
        props.updateJoueurState({
            message: spellStats.message,
            lifeJoueur: spellStats.life,
            needRefresh: true
        })
    }

    const launchAttack = async () => {
        let attackStats = {};

        if(props.target.type === "player"){
            try{
                attackStats = await UsersApi.applyAttaqueToPlayer(props.target.targetId, props.spell.id)
            }catch(erreur){
                // Garde-fous serveur du duel (PA, portée, carte, feu ami, réapparition) :
                // message FR destiné au joueur. Sans ce catch, un refus parfaitement
                // légitime remontait en rejet non intercepté et laissait le ciblage mort
                // jusqu'au rechargement de la page.
                toast.error(erreur.response?.data?.message || "Impossible de viser ce joueur.");
                return;
            }
        }else if(props.target.type === "monstre"){
            if(props.spell.type !== "soin"){
                attackStats = await UsersApi.applyAttaqueToMonster(props.target.targetId, props.spell.id)
            }else{
                //toast("Vous ne pouvez pas soigner cette cible")
                return;
            }
        }else if(props.target.type === "boss"){
            attackStats = await UsersApi.applyAttaqueToBoss(props.target.targetId, props.spell.id)
        }else if(props.target.type === "renfort"){
            // Monstre d'instance : ce n'est pas un `monstre_carreau`, donc un endpoint
            // dédié — mais sa réponse a la MÊME forme que celle d'un monstre ordinaire
            // (XP, butin, riposte), il n'y a rien à normaliser ici.
            if(props.spell.type === "soin"){
                return;
            }
            try{
                attackStats = await DonjonApi.attaquerRenfort(props.target.targetId, props.spell.id);
            }catch(erreur){
                // Garde-fous serveur (PA, portée, carte) : message FR destiné au joueur.
                toast.error(erreur.response?.data?.error || "Impossible de frapper cette cible.");
                return;
            }
        }

        await props.fetchTargetInfo(props.target.targetId, props.target.type);
        props.updateJoueurState({
            experience: attackStats.experience,
            damage: attackStats.damage,
            newExperience: attackStats.newExperience,
            lifeJoueur: attackStats.lifeJoueur,
            damageReturns: attackStats.damageReturns,
            // Défensif : tous les endpoints d'attaque ne renvoient pas de butin (le duel
            // n'en a pas). Un accès direct à `[0]` sur une clé absente levait un TypeError
            // qui empêchait TOUT ce bloc de s'exécuter — donc plus de mise à jour d'état,
            // plus de ciblage, plus de noms au survol, jusqu'au F5.
            droppedItems: attackStats.droppedItems?.[0] ?? "",
            level: attackStats.level,
            killMessage: attackStats.killMessage,
            message: attackStats.message,
            pa: attackStats.pa,
            // Le serveur peut avoir DÉPLACÉ le joueur pendant l'échange (mort → cimetière).
            // Sans reprendre sa carte, le rechargement redemandait l'ancienne : on restait
            // affiché dans le donjon alors qu'on gisait au cimetière.
            ...(attackStats.mapId !== undefined ? {mapId: attackStats.mapId} : {}),
            needRefresh: true
        })

        /** todo verifier si target.mapId !== joueur.MapId */
        if(attackStats.killMessage){
            props.removePlayerTarget();
        }
    }

    return <>
        <div title={props.spell.nom} className={`spell-container ${styles.container}`} onClick={handleAttack}>
            <Slot src={"/img/spell/" + props.spell.icone} alt={props.spell.nom}>
                <div className={`${styles.cooldown} spell-filter-${props.spell.id}`}>
                    {time > 0 && (time/1000).toLocaleString('fr-FR', {maximumFractionDigits: 1})}
                </div>
            </Slot>
        </div>
    </>
}

export default connect((state, ownProps) => {
    let target = state.data.target;
    let positionJoueur = state.data.positionJoueur;
    return {target, positionJoueur, ownProps};
}, {fetchTargetInfo, updateJoueurState, removePlayerTarget})(Spell);
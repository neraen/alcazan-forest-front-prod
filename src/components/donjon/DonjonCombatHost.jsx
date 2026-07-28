import React, {useEffect, useRef} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import DonjonApi from "../../services/DonjonApi";
import UsersApi from "../../services/UsersApi";
import {updateDonjonCombat, updateJoueurState} from "../../store/actions";
import DonjonCombatHud from "./DonjonCombatHud";

/** Cadence de sondage pendant un combat engagé. */
const PERIODE_COMBAT_MS = 2000;
/** Cadence au repos : on est dans le donjon mais le boss n'a pas encore été touché. */
const PERIODE_REPOS_MS = 8000;

/**
 * Sondage de l'état de combat + HUD du donjon. Rendu une seule fois dans MapPage.
 *
 * ⚠️ Ce sondage n'est PAS un rafraîchissement d'affichage : le tick du serveur est
 * paresseux (aucune tâche planifiée), donc c'est cet appel qui fait avancer la rencontre —
 * les zones annoncées ne frappent que lorsque quelqu'un demande l'état. Le supprimer
 * fige le combat.
 *
 * Le front ne simule rien : il affiche le payload du serveur, et le compte à rebours des
 * zones est calculé à partir de `resoudreAt` (horloge serveur), jamais décompté localement.
 */
const DonjonCombatHost = (props) => {

    const mapId = props.joueurState.mapId;
    const combat = props.donjon.combat;
    const enCours = combat && combat.instanceId !== null;
    const engage = enCours && combat.combatEngage;

    // Refs : le setInterval ne doit pas se recréer à chaque rendu.
    const combatRef = useRef(combat);
    combatRef.current = combat;
    const viePrecedenteRef = useRef(null);
    const messagesVusRef = useRef(new Set());

    const sonder = async () => {
        try {
            const avaitUneInstance = combatRef.current && combatRef.current.instanceId !== null;
            const etat = await DonjonApi.combat();
            props.updateDonjonCombat(etat.instanceId ? etat : null);

            // On était dans une expédition et on n'y est plus, sans l'avoir demandé : le
            // serveur nous en a sorti (mort dans une zone télégraphiée, durée écoulée). Rien
            // dans nos requêtes ne nous l'apprend, donc on va relire OÙ l'on est et avec
            // combien de PV — sinon le front continuait d'afficher la salle du donjon et la
            // vie d'avant le coup fatal, y compris négative.
            if(avaitUneInstance && !etat.instanceId){
                const joueur = await UsersApi.find();
                props.updateJoueurState({
                    mapId: joueur.mapId,
                    lifeJoueur: joueur.currentLife,
                    needRefresh: true
                });
            }

            // Les annonces de mécanique ne sont émises qu'une fois par tick : on les
            // affiche à l'arrivée, sans les rejouer au sondage suivant.
            (etat.messages || []).forEach(message => {
                if(!messagesVusRef.current.has(message)){
                    messagesVusRef.current.add(message);
                    toast.warning(message, {autoClose: 6000});
                }
            });
            if(messagesVusRef.current.size > 30){
                messagesVusRef.current = new Set();
            }

            // Une zone qui frappe modifie les PV côté serveur : on resynchronise la fiche.
            const vie = etat.menaces?.find(menace => menace.userId === props.joueurState.idJoueur)?.vie;
            if(vie !== undefined && viePrecedenteRef.current !== null && vie < viePrecedenteRef.current){
                props.updateJoueurState({lifeJoueur: vie});
            }
            if(vie !== undefined){
                viePrecedenteRef.current = vie;
            }
        } catch (erreur) {
            // Hors instance ou serveur indisponible : le jeu reste jouable, sans HUD.
        }
    };

    useEffect(() => {
        sonder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapId]);

    useEffect(() => {
        if(!enCours){
            return undefined;
        }
        const periode = engage ? PERIODE_COMBAT_MS : PERIODE_REPOS_MS;
        const minuteur = setInterval(() => sonder(), periode);

        return () => clearInterval(minuteur);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enCours, engage]);

    if(!enCours){
        return null;
    }

    return <DonjonCombatHud combat={combat} monId={props.joueurState.idJoueur}/>;
};

export default connect((state) => {
    return {
        joueurState: state.data.joueurState,
        donjon: state.data.donjon,
    };
}, {updateDonjonCombat, updateJoueurState})(DonjonCombatHost);

import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import {updatePlayerTarget, updateEchange} from "../../store/actions";
import EchangeApi from "../../services/EchangeApi";
import distanceCalculator from "../../services/distanceCalculator";
import PlayerContextMenu from "../echange/PlayerContextMenu";

const Player = (props) => {

    // Menu contextuel (clic droit) : {x, y} d'ouverture, null fermé.
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        if(props.hasMonstre){
            props.updatePlayerTarget({targetId: props.hasMonstre, type: "monstre"})
        }
    }, [])

    const handleTarget = () =>{
        props.updatePlayerTarget({targetId: props.player.idJoueur, type: "player"})
    }

    const estMoi = props.player.idJoueur === props.joueurState.idJoueur;

    // `enLigne` vient d'un `CASE WHEN` DQL : selon l'hydratation, il arrive en 1/0 ou en
    // "1"/"0". Un simple test de vérité déclarerait tout le monde en ligne, `"0"` étant
    // truthy en JS. On normalise le type de transport — la RÈGLE, elle, reste au serveur.
    const enLigne = Number(props.player.enLigne) === 1;

    const handleContextMenu = (event) => {
        if(estMoi){
            return;
        }
        event.preventDefault();
        setMenu({x: event.clientX, y: event.clientY});
    }

    // Adjacence requise pour PROPOSER (le serveur revérifie : la distance client n'est
    // qu'un confort d'affichage, jamais une autorisation).
    const distance = distanceCalculator.computeDistance(
        props.abscisse,
        props.ordonnee,
        props.positionJoueur.abscisse,
        props.positionJoueur.ordonnee
    );

    const proposerEchange = async () => {
        try {
            const reponse = await EchangeApi.create(props.player.idJoueur);
            props.updateEchange(reponse.echange);
            toast.info(`Invitation d'échange envoyée à ${props.player.pseudo}.`);
        } catch (error) {
            toast.error(error.response?.data?.error || "Impossible de proposer l'échange.");
        }
    }

    return <>
        <div className={"joueur " + (props.player.idJoueur !== props.joueurState.joueurId && "joueur-hoverable") } style={{backgroundImage: "url(../img/classes/"+props.player.nomClasse+"_"+ props.player.sexe +".png)"}} onClick={handleTarget} onContextMenu={handleContextMenu}>
            <div className="joueur-hover">
                <div className="joueur-name">{props.player.pseudo}</div>
                <div className="joueur-level">
                    <span>Niveau : {props.player.niveau}</span>
                    {props.player.nomAlignement &&
                        <img className="icone-alignement"
                             src={"../img/alignement/" + props.player.iconeAlignement}
                             alt={props.player.nomAlignement}
                             title={props.player.nomAlignement}/>}
                    {/* Présence tranchée par le serveur (`enLigne`), jamais recalculée ici :
                        le client ne connaît ni la fenêtre de présence ni l'horloge serveur. */}
                    <span className={"joueur-presence" + (enLigne ? " en-ligne" : "")}
                          title={enLigne ? "En ligne" : "Hors ligne"}/>
                </div>
                {/*<div className="joueur-level">{props.player.nomGuilde && <span>{props.player.nomGuilde}</span>}</div>*/}

            </div>
        </div>
        {menu && (
            <PlayerContextMenu pseudo={props.player.pseudo}
                               x={menu.x} y={menu.y}
                               disabled={distance > 1}
                               onProposer={proposerEchange}
                               onClose={() => setMenu(null)}/>
        )}
    </>
}

export default connect((state, ownProperties) =>{
    return {joueurState: {...state.data.joueurState}, positionJoueur: state.data.positionJoueur, ownProperties}
}, {updatePlayerTarget, updateEchange})(Player)

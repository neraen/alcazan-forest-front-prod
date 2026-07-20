import React from "react";
import {connect} from "react-redux";
import {openPnjInteraction} from "../../../store/actions";
import distanceCalculator from "../../../services/distanceCalculator";

/**
 * Tuile PNJ sur la carte : uniquement le sprite et le clic. Aucune modale,
 * aucun fetch — l'interaction est portée par le state global pnjInteraction
 * et rendue une seule fois par PnjInteractionHost (au niveau de MapPage).
 */
const Pnj = (props) => {

    const isPlayerNearPnj = () => {
        return distanceCalculator.computeDistance(
            props.abscisse,
            props.ordonnee,
            props.positionJoueur.abscisse,
            props.positionJoueur.ordonnee
        ) < 2;
    }

    const handleClick = () => {
        if(isPlayerNearPnj()){
            props.openPnjInteraction({
                pnjId: props.pnj.pnjId,
                abscisse: props.abscisse,
                ordonnee: props.ordonnee
            });
        }
    }

    return (
        <div className="pnj" style={{backgroundImage: "url(../../../img/pnj/" + props.pnj.pnjSkin + ".png)"}} onClick={handleClick}>
            <div className="pnj-hover">
                <div className="pnj-name">{props.pnj.pnjName}</div>
                <div className="pnj-description">{props.pnj.pnjDescription}</div>
            </div>
        </div>
    )
}

export default connect((state) => {
    return {positionJoueur: state.data.positionJoueur};
}, {openPnjInteraction})(Pnj);

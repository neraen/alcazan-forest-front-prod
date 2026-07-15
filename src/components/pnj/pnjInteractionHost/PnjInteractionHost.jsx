import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import Modal from "../../modal/Modal";
import Loader from "../../loader/Loader";
import QuestDialogue from "../questDialogue/QuestDialogue";
import PnjActionDialogue from "../pnjActionDialogue/PnjActionDialogue";
import ShopView from "../shopView/ShopView";
import GuildeView from "../guildeView/GuildeView";
import questApi from "../../../services/questApi";
import distanceCalculator from "../../../services/distanceCalculator";
import {closePnjInteraction} from "../../../store/actions";

/**
 * L'unique hôte de la modale PNJ, rendu une seule fois dans MapPage.
 * Ouvre l'interaction quand pnjInteraction.pnjId est posé (fetch lazy au clic),
 * et gère la fermeture par éloignement à UN seul endroit : plus de
 * désynchronisation entre visibilité dérivée et état interne de modale.
 */
const PnjInteractionHost = (props) => {

    const [interaction, setInteraction] = useState(null);
    const {pnjId, abscisse, ordonnee} = props.pnjInteraction;

    useEffect(() => {
        if(!pnjId){
            setInteraction(null);
            return;
        }

        let cancelled = false;
        questApi.getInteraction(pnjId)
            .then(data => {
                if(!cancelled){
                    setInteraction(data);
                }
            })
            .catch(() => {
                toast.error("Impossible de parler à ce PNJ.");
                props.closePnjInteraction();
            });

        return () => {
            cancelled = true;
        };
    }, [pnjId]);

    // Fermeture automatique quand le joueur s'éloigne du PNJ.
    useEffect(() => {
        if(pnjId === null){
            return;
        }
        const distance = distanceCalculator.computeDistance(
            abscisse,
            ordonnee,
            props.positionJoueur.abscisse,
            props.positionJoueur.ordonnee
        );
        if(distance >= 2){
            props.closePnjInteraction();
        }
    }, [pnjId, abscisse, ordonnee, props.positionJoueur]);

    if(!pnjId){
        return null;
    }

    const title = () => {
        if(!interaction){
            return "";
        }
        switch (interaction.view){
            case "quest":
                return interaction.quest.name;
            case "shop":
                return interaction.shop.title || interaction.pnj.name;
            default:
                return interaction.pnj.name;
        }
    }

    const renderView = () => {
        switch (interaction.view){
            case "quest":
                return <QuestDialogue pnj={interaction.pnj} quest={interaction.quest} onClose={props.closePnjInteraction}/>;
            case "shop":
                return <ShopView typeShop={interaction.shop.typeShop} items={interaction.shop.items}/>;
            case "guilde":
                return <GuildeView guildeData={interaction.guilde}/>;
            case "dialogue":
            default:
                return <PnjActionDialogue pnj={interaction.pnj} dialogue={interaction.dialogue} onClose={props.closePnjInteraction}/>;
        }
    }

    return (
        <Modal isShowing={true} hide={props.closePnjInteraction} title={title()}>
            {interaction ? renderView() : <Loader/>}
        </Modal>
    )
}

export default connect((state) => {
    return {
        pnjInteraction: state.data.pnjInteraction,
        positionJoueur: state.data.positionJoueur
    };
}, {closePnjInteraction})(PnjInteractionHost);
